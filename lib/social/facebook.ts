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

const logger = createLogger("social:facebook")

export class FacebookAdapter implements SocialAdapter {
  platform: Platform = Platform.FACEBOOK

  async getAccount(accessToken: string): Promise<AccountInfo> {
    logger.info("Getting Facebook account info")

    // TODO: Call Facebook Graph API
    // GET https://graph.facebook.com/me?fields=id,name,picture

    return {
      id: "mock-fb-account-id",
      username: "demo.page",
      displayName: "Demo Facebook Page",
      avatar: "https://via.placeholder.com/150",
      followers: 8900,
      metadata: {
        pageId: "123456789",
        category: "Business",
      },
    }
  }

  async publish(accessToken: string, request: PublishRequest): Promise<PublishResult> {
    logger.info({ content: request.content }, "Publishing to Facebook")

    // TODO: Implement Facebook publishing
    // POST https://graph.facebook.com/{page-id}/feed
    // or POST https://graph.facebook.com/{page-id}/photos for images

    const externalPostId = `fb_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return {
      externalPostId,
      url: `https://facebook.com/${externalPostId}`,
      publishedAt: new Date(),
      metadata: {
        platform: "facebook",
      },
    }
  }

  async delete(accessToken: string, externalPostId: string): Promise<void> {
    logger.info({ externalPostId }, "Deleting Facebook post")

    // TODO: Call Facebook Graph API
    // DELETE https://graph.facebook.com/{post-id}

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  async fetchMetrics(accessToken: string, externalPostId: string): Promise<PostMetrics> {
    logger.info({ externalPostId }, "Fetching Facebook metrics")

    // TODO: Call Facebook Graph API
    // GET https://graph.facebook.com/{post-id}?fields=insights

    return {
      likes: Math.floor(Math.random() * 800) + 80,
      comments: Math.floor(Math.random() * 80) + 8,
      shares: Math.floor(Math.random() * 40) + 4,
      views: Math.floor(Math.random() * 4000) + 400,
      reach: Math.floor(Math.random() * 2500) + 250,
      engagement: Math.random() * 4 + 1.5,
      clicks: Math.floor(Math.random() * 150) + 15,
    }
  }

  async reply(accessToken: string, request: ReplyRequest): Promise<ReplyResult> {
    logger.info({ conversationId: request.conversationId }, "Replying to Facebook conversation")

    // TODO: Implement Facebook reply
    // POST https://graph.facebook.com/{comment-id}/comments for comment replies
    // POST https://graph.facebook.com/me/messages for messenger

    return {
      externalMessageId: `fb_msg_${Date.now()}`,
      createdAt: new Date(),
    }
  }

  async fetchInboxMessages(accessToken: string, since?: Date): Promise<InboxMessage[]> {
    logger.info({ since }, "Fetching Facebook inbox messages")

    // TODO: Call Facebook Graph API
    // GET https://graph.facebook.com/{page-id}/conversations

    return []
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implement Facebook webhook verification
    logger.info("Verifying Facebook webhook signature")
    return true
  }
}

export const facebookAdapter = new FacebookAdapter()
