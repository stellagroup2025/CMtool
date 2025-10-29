import Pusher from "pusher"
import { env } from "./env"
import { createLogger } from "./logger"

const logger = createLogger("realtime")

let pusherClient: Pusher | null = null

function getPusherClient(): Pusher | null {
  if (!env.ENABLE_REALTIME) {
    return null
  }

  if (pusherClient) {
    return pusherClient
  }

  // Check if Pusher credentials are configured
  if (!env.PUSHER_APP_ID || !env.PUSHER_KEY || !env.PUSHER_SECRET || !env.PUSHER_CLUSTER) {
    logger.warn("Pusher credentials not configured. Realtime features disabled.")
    return null
  }

  pusherClient = new Pusher({
    appId: env.PUSHER_APP_ID,
    key: env.PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    cluster: env.PUSHER_CLUSTER,
    useTLS: true,
  })

  logger.info("Pusher client initialized")
  return pusherClient
}

// Event types
export type RealtimeEvent =
  | "post.status_changed"
  | "inbox.new_message"
  | "inbox.conversation_updated"
  | "metrics.updated"

export interface RealtimeEventData {
  type: RealtimeEvent
  payload: any
  timestamp: string
}

export async function publishToChannel(
  channel: string,
  event: RealtimeEvent,
  payload: any
): Promise<void> {
  const client = getPusherClient()

  if (!client) {
    logger.debug({ channel, event }, "Realtime disabled, skipping publish")
    return
  }

  try {
    const data: RealtimeEventData = {
      type: event,
      payload,
      timestamp: new Date().toISOString(),
    }

    await client.trigger(channel, event, data)
    logger.debug({ channel, event }, "Published realtime event")
  } catch (error) {
    logger.error({ error, channel, event }, "Failed to publish realtime event")
    // Don't throw - realtime is not critical
  }
}

// Helper functions for common channels
export function getBrandChannel(brandId: string): string {
  return `private-brand-${brandId}`
}

export function getUserChannel(userId: string): string {
  return `private-user-${userId}`
}

// Convenience functions
export async function notifyPostStatusChanged(brandId: string, postId: string, status: string) {
  await publishToChannel(getBrandChannel(brandId), "post.status_changed", { postId, status })
}

export async function notifyNewMessage(brandId: string, conversationId: string, message: any) {
  await publishToChannel(getBrandChannel(brandId), "inbox.new_message", { conversationId, message })
}

export async function notifyConversationUpdated(brandId: string, conversationId: string) {
  await publishToChannel(getBrandChannel(brandId), "inbox.conversation_updated", { conversationId })
}

export async function notifyMetricsUpdated(brandId: string, postItemId: string) {
  await publishToChannel(getBrandChannel(brandId), "metrics.updated", { postItemId })
}
