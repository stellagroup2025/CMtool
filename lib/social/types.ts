import { Platform } from "@prisma/client"

// ============================================
// COMMON TYPES
// ============================================

export interface MediaItem {
  url: string
  type: "image" | "video"
  thumbnail?: string
}

export interface AccountInfo {
  id: string
  username: string
  displayName?: string
  avatar?: string
  followers?: number
  metadata?: Record<string, any>
}

export interface PublishRequest {
  content: string
  mediaUrls: string[]
  hashtags?: string[]
  metadata?: Record<string, any>
}

export interface PublishResult {
  externalPostId: string
  url?: string
  publishedAt: Date
  metadata?: Record<string, any>
}

export interface PostMetrics {
  likes: number
  comments: number
  shares: number
  views: number
  reach: number
  engagement: number
  clicks?: number
  saves?: number
}

export interface ReplyRequest {
  conversationId: string
  messageId?: string
  content: string
  mediaUrls?: string[]
}

export interface ReplyResult {
  externalMessageId: string
  createdAt: Date
}

export interface InboxMessage {
  id: string
  conversationId: string
  from: {
    id: string
    username: string
    displayName?: string
    avatar?: string
  }
  content: string
  mediaUrls?: string[]
  type: "dm" | "comment" | "mention"
  createdAt: Date
  metadata?: Record<string, any>
}

// ============================================
// ADAPTER INTERFACE
// ============================================

export interface SocialAdapter {
  platform: Platform

  /**
   * Verify and get account information
   */
  getAccount(accessToken: string): Promise<AccountInfo>

  /**
   * Publish content to the platform
   */
  publish(accessToken: string, request: PublishRequest): Promise<PublishResult>

  /**
   * Delete a published post
   */
  delete(accessToken: string, externalPostId: string): Promise<void>

  /**
   * Fetch metrics for a published post
   */
  fetchMetrics(accessToken: string, externalPostId: string): Promise<PostMetrics>

  /**
   * Reply to a conversation (DM, comment, etc.)
   */
  reply(accessToken: string, request: ReplyRequest): Promise<ReplyResult>

  /**
   * Fetch new inbox messages (for polling)
   */
  fetchInboxMessages?(
    accessToken: string,
    since?: Date
  ): Promise<InboxMessage[]>

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature?(payload: string, signature: string): boolean
}

export type AdapterRegistry = Record<Platform, SocialAdapter>
