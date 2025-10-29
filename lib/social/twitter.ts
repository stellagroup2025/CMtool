import { Platform } from "@prisma/client"
import {
  SocialAdapter,
  AccountInfo,
  PublishRequest,
  PublishResult,
  PostMetrics,
  ReplyRequest,
  ReplyResult,
} from "./types"
import { createLogger } from "../logger"

const logger = createLogger("social:twitter")

export class TwitterAdapter implements SocialAdapter {
  platform: Platform = Platform.X

  async getAccount(accessToken: string): Promise<AccountInfo> {
    logger.info("Getting Twitter/X account info")
    // TODO: Call Twitter API v2
    return {
      id: "mock-twitter-id",
      username: "demo_twitter",
      displayName: "Demo Twitter",
      avatar: "https://via.placeholder.com/150",
      followers: 15000,
    }
  }

  async publish(accessToken: string, request: PublishRequest): Promise<PublishResult> {
    logger.info("Publishing to Twitter/X")
    // TODO: POST /2/tweets
    return {
      externalPostId: `tw_${Date.now()}`,
      url: `https://twitter.com/user/status/${Date.now()}`,
      publishedAt: new Date(),
    }
  }

  async delete(accessToken: string, externalPostId: string): Promise<void> {
    logger.info({ externalPostId }, "Deleting Twitter/X post")
    // TODO: DELETE /2/tweets/:id
  }

  async fetchMetrics(accessToken: string, externalPostId: string): Promise<PostMetrics> {
    logger.info({ externalPostId }, "Fetching Twitter/X metrics")
    return {
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 10000),
      reach: Math.floor(Math.random() * 5000),
      engagement: Math.random() * 3,
    }
  }

  async reply(accessToken: string, request: ReplyRequest): Promise<ReplyResult> {
    logger.info("Replying on Twitter/X")
    return {
      externalMessageId: `tw_msg_${Date.now()}`,
      createdAt: new Date(),
    }
  }
}

export const twitterAdapter = new TwitterAdapter()
