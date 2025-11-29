"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram")

export async function getInstagramData(brandId: string) {
  try {
    // Get Instagram account for this brand
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

    // Decrypt access token
    const accessToken = decrypt(account.accessToken)
    const igAccountId = account.platformAccountId

    // Get account info
    const accountResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website&access_token=${accessToken}`
    )

    if (!accountResponse.ok) {
      const error = await accountResponse.json()
      logger.error({ error }, "Failed to fetch account info")
      return { success: false, error: "Failed to fetch account info" }
    }

    const accountData = await accountResponse.json()

    // Get recent media
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=12&access_token=${accessToken}`
    )

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json()
      logger.error({ error }, "Failed to fetch media")
      return { success: false, error: "Failed to fetch media" }
    }

    const mediaData = await mediaResponse.json()

    return {
      success: true,
      account: {
        id: accountData.id,
        username: accountData.username,
        name: accountData.name,
        profilePicture: accountData.profile_picture_url,
        followersCount: accountData.followers_count || 0,
        followsCount: accountData.follows_count || 0,
        mediaCount: accountData.media_count || 0,
        biography: accountData.biography,
        website: accountData.website,
      },
      media: mediaData.data || [],
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching Instagram data")
    return { success: false, error: error.message }
  }
}

export async function getMediaInsights(brandId: string, mediaId: string) {
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

    // Get media details with insights
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${mediaId}?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}`
    )

    if (!response.ok) {
      return { success: false, error: "Failed to fetch media details" }
    }

    const data = await response.json()

    // Try to get insights
    try {
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${mediaId}/insights?metric=engagement,impressions,reach,saved&access_token=${accessToken}`
      )
      if (insightsResponse.ok) {
        const insights = await insightsResponse.json()
        data.insights = insights.data
      }
    } catch (e) {
      // Insights might not be available
    }

    return { success: true, data }
  } catch (error: any) {
    logger.error({ error }, "Error fetching media insights")
    return { success: false, error: error.message }
  }
}
