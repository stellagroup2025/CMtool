#!/usr/bin/env tsx
import { createWorker, QUEUE_NAMES } from "../lib/queue"
import { processPublishPostItem } from "./jobs/publishPostItem"
import { processPullMetrics } from "./jobs/pullMetrics"
import { processPollInbox } from "./jobs/pollInbox"
import { createLogger } from "../lib/logger"

const logger = createLogger("worker")

async function main() {
  logger.info("🚀 Starting Social Media Manager Worker...")

  // Create workers for each queue
  const publishWorker = createWorker(QUEUE_NAMES.PUBLISH, processPublishPostItem, {
    concurrency: 5,
  })

  const metricsWorker = createWorker(QUEUE_NAMES.METRICS, processPullMetrics, {
    concurrency: 3,
  })

  const inboxWorker = createWorker(QUEUE_NAMES.INBOX_POLL, processPollInbox, {
    concurrency: 2,
  })

  logger.info("✅ Workers started successfully")

  // Handle shutdown gracefully
  const shutdown = async () => {
    logger.info("Shutting down workers...")

    await Promise.all([
      publishWorker.close(),
      metricsWorker.close(),
      inboxWorker.close(),
    ])

    logger.info("Workers shut down gracefully")
    process.exit(0)
  }

  process.on("SIGTERM", shutdown)
  process.on("SIGINT", shutdown)
}

main().catch((error) => {
  logger.error({ error }, "Fatal error in worker")
  process.exit(1)
})
