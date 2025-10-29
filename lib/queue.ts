import { Queue, Worker, QueueOptions, WorkerOptions, Job } from "bullmq"
import IORedis from "ioredis"
import { env } from "./env"
import { createLogger } from "./logger"

const logger = createLogger("queue")

// Shared Redis connection
const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
})

connection.on("error", (err) => {
  logger.error({ error: err }, "Redis connection error")
})

connection.on("connect", () => {
  logger.info("Redis connected")
})

const defaultQueueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 500,
    },
  },
}

// ============================================
// QUEUE DEFINITIONS
// ============================================

export const QUEUE_NAMES = {
  PUBLISH: "publish-queue",
  METRICS: "metrics-queue",
  INBOX_POLL: "inbox-poll-queue",
} as const

// Publish Queue - for scheduling posts
export const publishQueue = new Queue(QUEUE_NAMES.PUBLISH, defaultQueueOptions)

// Metrics Queue - for pulling analytics
export const metricsQueue = new Queue(QUEUE_NAMES.METRICS, defaultQueueOptions)

// Inbox Poll Queue - for polling platforms without webhooks
export const inboxPollQueue = new Queue(QUEUE_NAMES.INBOX_POLL, defaultQueueOptions)

// ============================================
// JOB DATA TYPES
// ============================================

export interface PublishPostItemJobData {
  postItemId: string
  brandId: string
}

export interface PullMetricsJobData {
  postItemId?: string
  socialAccountId?: string
  brandId: string
}

export interface PollInboxJobData {
  socialAccountId: string
  brandId: string
  platform: string
}

// ============================================
// WORKER FACTORY
// ============================================

export function createWorker<T = any>(
  queueName: string,
  processor: (job: Job<T>) => Promise<any>,
  options?: Partial<WorkerOptions>
) {
  const worker = new Worker<T>(queueName, processor, {
    connection,
    ...options,
  })

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, queue: queueName }, "Job completed")
  })

  worker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, queue: queueName, error: err.message },
      "Job failed"
    )
  })

  worker.on("error", (err) => {
    logger.error({ queue: queueName, error: err.message }, "Worker error")
  })

  return worker
}

// ============================================
// HELPERS
// ============================================

export async function addPublishJob(
  data: PublishPostItemJobData,
  scheduledAt?: Date
): Promise<Job<PublishPostItemJobData>> {
  return publishQueue.add("publish-post-item", data, {
    delay: scheduledAt ? scheduledAt.getTime() - Date.now() : 0,
    jobId: `publish-${data.postItemId}`, // Idempotent
  })
}

export async function addMetricsJob(
  data: PullMetricsJobData
): Promise<Job<PullMetricsJobData>> {
  return metricsQueue.add("pull-metrics", data, {
    jobId: data.postItemId ? `metrics-post-${data.postItemId}` : `metrics-account-${data.socialAccountId}`,
  })
}

export async function addInboxPollJob(
  data: PollInboxJobData
): Promise<Job<PollInboxJobData>> {
  return inboxPollQueue.add("poll-inbox", data, {
    jobId: `poll-${data.socialAccountId}`,
    repeat: {
      every: 5 * 60 * 1000, // Poll every 5 minutes
    },
  })
}

export { connection }
