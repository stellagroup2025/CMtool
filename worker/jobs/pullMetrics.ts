import { Job } from "bullmq"
import { PullMetricsJobData } from "@/lib/queue"
import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { getAdapter } from "@/lib/social"
import { createLogger } from "@/lib/logger"
import { notifyMetricsUpdated } from "@/lib/realtime"

const logger = createLogger("worker:metrics")

export async function processPullMetrics(job: Job<PullMetricsJobData>) {
  const { postItemId, socialAccountId, brandId } = job.data

  logger.info({ postItemId, socialAccountId, brandId }, "Processing metrics job")

  try {
    if (postItemId) {
      // Pull metrics for a specific post item
      await pullPostItemMetrics(postItemId, brandId)
    } else if (socialAccountId) {
      // Pull metrics for all published posts from an account
      const postItems = await prisma.postItem.findMany({
        where: {
          socialAccountId,
          status: "PUBLISHED",
          externalPostId: { not: null },
        },
        take: 50, // Limit to avoid rate limiting
        orderBy: {
          publishedAt: "desc",
        },
      })

      for (const item of postItems) {
        try {
          await pullPostItemMetrics(item.id, brandId)
        } catch (error: any) {
          logger.error({ error, postItemId: item.id }, "Failed to pull metrics for post item")
          // Continue with next item
        }
      }
    }

    logger.info("Successfully pulled metrics")
  } catch (error: any) {
    logger.error({ error }, "Failed to pull metrics")
    throw error
  }
}

async function pullPostItemMetrics(postItemId: string, brandId: string) {
  const postItem = await prisma.postItem.findUnique({
    where: { id: postItemId },
    include: {
      socialAccount: true,
    },
  })

  if (!postItem || !postItem.externalPostId) {
    logger.warn({ postItemId }, "Post item not found or not published")
    return
  }

  // Decrypt access token
  const accessToken = decrypt(postItem.socialAccount.accessToken)

  // Get platform adapter
  const adapter = getAdapter(postItem.platform)

  // Fetch metrics from platform
  const metrics = await adapter.fetchMetrics(accessToken, postItem.externalPostId)

  // Upsert metrics
  await prisma.postMetrics.upsert({
    where: {
      postItemId,
    },
    update: metrics,
    create: {
      postItemId,
      ...metrics,
    },
  })

  // Notify via realtime
  await notifyMetricsUpdated(brandId, postItemId)

  logger.info({ postItemId, metrics }, "Updated post metrics")
}
