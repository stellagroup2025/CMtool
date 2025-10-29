import { Platform } from "@prisma/client"
import {
  SocialAdapter,
  AccountInfo,
  PublishRequest,
  PublishResult,
  PostMetrics,
  ReplyRequest,
  ReplyResult,
  InboxMessage,
} from "./types"
import { createLogger } from "../logger"

const logger = createLogger("social:instagram")

export class InstagramAdapter implements SocialAdapter {
  platform: Platform = Platform.INSTAGRAM

  async getAccount(accessToken: string): Promise<AccountInfo> {
    logger.info("Getting Instagram account info")

    try {
      // Get Instagram Business Account info via Graph API
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${accessToken}`
      )

      if (!response.ok) {
        const error = await response.json()
        logger.error({ error }, "Failed to fetch Instagram account")
        throw new Error(`Instagram API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        username: data.username || data.name,
        displayName: data.name || data.username,
        avatar: data.profile_picture_url || "https://via.placeholder.com/150",
        followers: data.followers_count || 0,
        metadata: {
          accountType: "BUSINESS",
          mediaCount: data.media_count || 0,
        },
      }
    } catch (error) {
      logger.error({ error }, "Error fetching Instagram account")
      throw error
    }
  }

  async publish(accessToken: string, request: PublishRequest): Promise<PublishResult> {
    logger.info({ content: request.content }, "Publishing to Instagram")

    // TODO: Implement Instagram publishing
    // 1. For images/videos: Create media container
    //    POST https://graph.instagram.com/{ig-user-id}/media
    // 2. Publish the container
    //    POST https://graph.instagram.com/{ig-user-id}/media_publish

    // For now, simulate successful publish
    const externalPostId = `ig_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return {
      externalPostId,
      url: `https://instagram.com/p/${externalPostId}`,
      publishedAt: new Date(),
      metadata: {
        platform: "instagram",
      },
    }
  }

  async delete(accessToken: string, externalPostId: string): Promise<void> {
    logger.info({ externalPostId }, "Deleting Instagram post")

    // TODO: Call Instagram Graph API
    // DELETE https://graph.instagram.com/{media-id}

    // Simulate deletion
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  async fetchMetrics(accessToken: string, externalPostId: string): Promise<PostMetrics> {
    logger.info({ externalPostId }, "Fetching Instagram metrics")

    try {
      // Get basic post data (likes, comments)
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v19.0/${externalPostId}?fields=like_count,comments_count&access_token=${accessToken}`
      )

      if (!mediaResponse.ok) {
        logger.warn({ externalPostId }, "Failed to fetch media data, returning zeros")
        return {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          reach: 0,
          engagement: 0,
        }
      }

      const mediaData = await mediaResponse.json()

      // Try to get insights (requires specific permissions)
      let insights = { reach: 0, engagement: 0, saves: 0, impressions: 0 }
      try {
        const insightsResponse = await fetch(
          `https://graph.facebook.com/v19.0/${externalPostId}/insights?metric=engagement,impressions,reach,saved&access_token=${accessToken}`
        )
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json()
          // Parse insights data
          insightsData.data?.forEach((metric: any) => {
            if (metric.name === 'reach') insights.reach = metric.values[0]?.value || 0
            if (metric.name === 'engagement') insights.engagement = metric.values[0]?.value || 0
            if (metric.name === 'saved') insights.saves = metric.values[0]?.value || 0
            if (metric.name === 'impressions') insights.impressions = metric.values[0]?.value || 0
          })
        }
      } catch (e) {
        logger.warn("Insights not available for this post")
      }

      return {
        likes: mediaData.like_count || 0,
        comments: mediaData.comments_count || 0,
        shares: 0, // Not available in Instagram API
        views: insights.impressions,
        reach: insights.reach,
        engagement: insights.engagement,
        saves: insights.saves,
      }
    } catch (error) {
      logger.error({ error, externalPostId }, "Error fetching Instagram metrics")
      return {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        reach: 0,
        engagement: 0,
      }
    }
  }

  async reply(accessToken: string, request: ReplyRequest): Promise<ReplyResult> {
    logger.info({ conversationId: request.conversationId }, "Replying to Instagram conversation")

    // TODO: Implement Instagram reply
    // For comments: POST https://graph.instagram.com/{comment-id}/replies
    // For DMs: POST https://graph.instagram.com/{ig-user-id}/messages

    return {
      externalMessageId: `ig_msg_${Date.now()}`,
      createdAt: new Date(),
    }
  }

  async fetchInboxMessages(accessToken: string, since?: Date): Promise<InboxMessage[]> {
    logger.info({ since }, "Fetching Instagram inbox messages")

    // TODO: Call Instagram Graph API
    // GET https://graph.instagram.com/{ig-user-id}/conversations
    // GET https://graph.instagram.com/{conversation-id}/messages

    // Return mock messages for now
    return []
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implement Instagram webhook verification
    // Use app secret to verify the X-Hub-Signature header
    logger.info("Verifying Instagram webhook signature")
    return true
  }
}

export const instagramAdapter = new InstagramAdapter()
