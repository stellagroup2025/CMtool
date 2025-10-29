import { Job } from "bullmq"
import { PollInboxJobData } from "@/lib/queue"
import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { getAdapter } from "@/lib/social"
import { createLogger } from "@/lib/logger"
import { notifyNewMessage } from "@/lib/realtime"
import { Platform } from "@prisma/client"

const logger = createLogger("worker:inbox")

export async function processPollInbox(job: Job<PollInboxJobData>) {
  const { socialAccountId, brandId, platform } = job.data

  logger.info({ socialAccountId, platform }, "Processing inbox poll job")

  try {
    const socialAccount = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    })

    if (!socialAccount || !socialAccount.isActive) {
      logger.warn({ socialAccountId }, "Social account not found or inactive")
      return
    }

    // Decrypt access token
    const accessToken = decrypt(socialAccount.accessToken)

    // Get platform adapter
    const adapter = getAdapter(platform as Platform)

    // Check if adapter supports inbox polling
    if (!adapter.fetchInboxMessages) {
      logger.debug({ platform }, "Platform does not support inbox polling")
      return
    }

    // Get last sync time
    const since = socialAccount.lastSyncAt || undefined

    // Fetch messages
    const messages = await adapter.fetchInboxMessages(accessToken, since)

    logger.info({ count: messages.length }, "Fetched inbox messages")

    // Process each message
    for (const message of messages) {
      try {
        // Upsert conversation
        const conversation = await prisma.conversation.upsert({
          where: {
            platform_externalId: {
              platform: platform as Platform,
              externalId: message.conversationId,
            },
          },
          update: {
            lastMessageAt: message.createdAt,
            updatedAt: new Date(),
          },
          create: {
            brandId,
            socialAccountId,
            platform: platform as Platform,
            type: message.type === "dm" ? "DM" : message.type === "comment" ? "COMMENT" : "MENTION",
            externalId: message.conversationId,
            fromUserId: message.from.id,
            fromUsername: message.from.username,
            fromDisplayName: message.from.displayName,
            fromAvatar: message.from.avatar,
            lastMessageAt: message.createdAt,
            status: "NEW",
            priority: "MEDIUM",
          },
        })

        // Upsert message
        const createdMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            from: "USER",
            externalId: message.id,
            content: message.content,
            mediaUrls: message.mediaUrls || [],
            metadata: message.metadata as any,
            createdAt: message.createdAt,
          },
        })

        // Notify via realtime
        await notifyNewMessage(brandId, conversation.id, createdMessage)
      } catch (error: any) {
        logger.error({ error, messageId: message.id }, "Failed to process message")
        // Continue with next message
      }
    }

    // Update last sync time
    await prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: { lastSyncAt: new Date() },
    })

    logger.info("Successfully polled inbox")
  } catch (error: any) {
    logger.error({ error }, "Failed to poll inbox")
    throw error
  }
}
