import { Job } from "bullmq"
import { PublishPostItemJobData } from "@/lib/queue"
import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { getAdapter } from "@/lib/social"
import { createLogger } from "@/lib/logger"
import { notifyPostStatusChanged } from "@/lib/realtime"

const logger = createLogger("worker:publish")

export async function processPublishPostItem(job: Job<PublishPostItemJobData>) {
  const { postItemId, brandId } = job.data

  logger.info({ postItemId, brandId }, "Processing publish job")

  try {
    // Fetch post item with social account
    const postItem = await prisma.postItem.findUnique({
      where: { id: postItemId },
      include: {
        socialAccount: true,
        post: true,
      },
    })

    if (!postItem) {
      throw new Error(`PostItem ${postItemId} not found`)
    }

    if (postItem.status === "PUBLISHED") {
      logger.info({ postItemId }, "Post item already published, skipping")
      return
    }

    // Update status to PUBLISHING
    await prisma.postItem.update({
      where: { id: postItemId },
      data: { status: "PUBLISHING" },
    })

    // Decrypt access token
    const accessToken = decrypt(postItem.socialAccount.accessToken)

    // Get platform adapter
    const adapter = getAdapter(postItem.platform)

    // Publish to platform
    const result = await adapter.publish(accessToken, {
      content: postItem.content,
      mediaUrls: postItem.mediaUrls,
      hashtags: postItem.hashtags,
      metadata: postItem.metadata as any,
    })

    // Update post item with published data
    await prisma.postItem.update({
      where: { id: postItemId },
      data: {
        status: "PUBLISHED",
        externalPostId: result.externalPostId,
        publishedAt: result.publishedAt,
        metadata: {
          ...((postItem.metadata as any) || {}),
          publishResult: result,
        },
      },
    })

    // Check if all siblings are published
    const siblings = await prisma.postItem.findMany({
      where: { postId: postItem.postId },
      select: { status: true },
    })

    const allPublished = siblings.every((s) => s.status === "PUBLISHED")

    if (allPublished) {
      await prisma.post.update({
        where: { id: postItem.postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      })
    }

    // Create audit log
    await prisma.audit.create({
      data: {
        brandId,
        action: "post.publish",
        resource: postItemId,
        metadata: {
          platform: postItem.platform,
          externalPostId: result.externalPostId,
        },
      },
    })

    // Notify via realtime
    await notifyPostStatusChanged(brandId, postItem.postId, "PUBLISHED")

    logger.info(
      { postItemId, externalPostId: result.externalPostId },
      "Successfully published post"
    )
  } catch (error: any) {
    logger.error({ error, postItemId }, "Failed to publish post")

    // Update post item with failure
    await prisma.postItem.update({
      where: { id: postItemId },
      data: {
        status: "FAILED",
        failureReason: error.message,
      },
    })

    // Update parent post status
    await prisma.post.update({
      where: { id: (await prisma.postItem.findUnique({ where: { id: postItemId } }))!.postId },
      data: { status: "FAILED" },
    })

    // Notify via realtime
    await notifyPostStatusChanged(brandId, postItemId, "FAILED")

    throw error
  }
}
