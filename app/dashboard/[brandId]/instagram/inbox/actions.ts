"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram:inbox")

/**
 * Get all conversations (DMs) from Instagram
 * Requires: instagram_manage_messages permission
 */
export async function getConversations(brandId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    const accessToken = decrypt(account.accessToken)
    const igAccountId = account.platformAccountId

    // Get conversations
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/conversations?fields=id,updated_time,participants,messages{message,from,created_time}&platform=instagram&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch conversations")
      return {
        success: false,
        error: error.error?.message || "Failed to fetch conversations",
      }
    }

    const data = await response.json()

    return {
      success: true,
      conversations: data.data || [],
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching conversations")
    return { success: false, error: error.message }
  }
}

/**
 * Get messages from a specific conversation
 * Requires: instagram_manage_messages permission
 */
export async function getConversationMessages(brandId: string, conversationId: string) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    const accessToken = decrypt(account.accessToken)

    // Get messages
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${conversationId}?fields=id,messages{id,message,from,created_time,attachments}&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch messages")
      return {
        success: false,
        error: error.error?.message || "Failed to fetch messages",
      }
    }

    const data = await response.json()

    return {
      success: true,
      messages: data.messages?.data || [],
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching messages")
    return { success: false, error: error.message }
  }
}

/**
 * Send a message to a conversation
 * Requires: instagram_manage_messages permission
 */
export async function sendMessage(
  brandId: string,
  recipientId: string,
  message: string
) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    if (!message || message.trim() === "") {
      return { success: false, error: "Message cannot be empty" }
    }

    const accessToken = decrypt(account.accessToken)
    const igAccountId = account.platformAccountId

    // Send message
    const params = new URLSearchParams({
      recipient: JSON.stringify({ id: recipientId }),
      message: JSON.stringify({ text: message.trim() }),
      access_token: accessToken,
    })

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/messages`,
      {
        method: "POST",
        body: params,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to send message")
      return {
        success: false,
        error: error.error?.message || "Failed to send message",
      }
    }

    const data = await response.json()

    logger.info({ messageId: data.id, recipientId }, "Message sent successfully")

    return {
      success: true,
      messageId: data.id,
      message: "Message sent successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error sending message")
    return { success: false, error: error.message }
  }
}

/**
 * Get saved conversations from database
 */
export async function getSavedConversations(brandId: string, filters?: {
  status?: string
  type?: string
}) {
  try {
    const where: any = {
      brandId,
      type: "DM",
    }

    if (filters?.status) {
      where.status = filters.status
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        socialAccount: {
          select: {
            platform: true,
            username: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    })

    return {
      success: true,
      conversations,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching saved conversations")
    return { success: false, error: error.message }
  }
}

/**
 * Save a conversation to database
 */
export async function saveConversation(
  brandId: string,
  data: {
    externalId: string
    fromUserId: string
    fromUsername: string
    fromDisplayName?: string
    fromAvatar?: string
    lastMessageAt: Date
  }
) {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
    })

    if (!account) {
      return { success: false, error: "No Instagram account connected" }
    }

    // Upsert conversation
    const conversation = await prisma.conversation.upsert({
      where: {
        platform_externalId: {
          platform: "INSTAGRAM",
          externalId: data.externalId,
        },
      },
      create: {
        brandId,
        socialAccountId: account.id,
        platform: "INSTAGRAM",
        type: "DM",
        externalId: data.externalId,
        fromUserId: data.fromUserId,
        fromUsername: data.fromUsername,
        fromDisplayName: data.fromDisplayName,
        fromAvatar: data.fromAvatar,
        status: "NEW",
        lastMessageAt: data.lastMessageAt,
      },
      update: {
        lastMessageAt: data.lastMessageAt,
        fromDisplayName: data.fromDisplayName,
        fromAvatar: data.fromAvatar,
      },
    })

    return {
      success: true,
      conversation,
    }
  } catch (error: any) {
    logger.error({ error }, "Error saving conversation")
    return { success: false, error: error.message }
  }
}

/**
 * Update conversation status
 */
export async function updateConversationStatus(
  conversationId: string,
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
) {
  try {
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    })

    return {
      success: true,
      conversation,
    }
  } catch (error: any) {
    logger.error({ error }, "Error updating conversation status")
    return { success: false, error: error.message }
  }
}
