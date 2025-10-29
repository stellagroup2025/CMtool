"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram:mentions")

/**
 * Get mentions (tags) from Instagram
 * Requires: instagram_basic permission
 */
export async function getMentions(brandId: string, limit: number = 50) {
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

    // Get recent media where the account was tagged
    // Note: This endpoint is limited - for full mentions you need instagram_manage_mentions
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=mentioned_media.limit(${limit}){id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,username,like_count,comments_count}&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch mentions")
      return {
        success: false,
        error: error.error?.message || "Failed to fetch mentions. May require instagram_manage_mentions permission.",
      }
    }

    const data = await response.json()

    return {
      success: true,
      mentions: data.mentioned_media?.data || [],
      total: data.mentioned_media?.data?.length || 0,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching mentions")
    return { success: false, error: error.message }
  }
}

/**
 * Get mention details
 */
export async function getMentionDetails(brandId: string, mediaId: string) {
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

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${mediaId}?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,username,like_count,comments_count,owner{username,profile_picture_url}&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch mention details")
      return {
        success: false,
        error: error.error?.message || "Failed to fetch mention details",
      }
    }

    const data = await response.json()

    return {
      success: true,
      mention: data,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching mention details")
    return { success: false, error: error.message }
  }
}

/**
 * Get mentions stats
 */
export async function getMentionsStats(brandId: string) {
  try {
    const result = await getMentions(brandId, 100)

    if (!result.success) {
      return result
    }

    const mentions = result.mentions || []

    // Calculate stats
    const totalMentions = mentions.length
    const totalLikes = mentions.reduce((sum: number, m: any) => sum + (m.like_count || 0), 0)
    const totalComments = mentions.reduce((sum: number, m: any) => sum + (m.comments_count || 0), 0)

    // Group by user
    const byUser: { [key: string]: number } = {}
    mentions.forEach((mention: any) => {
      if (mention.username) {
        byUser[mention.username] = (byUser[mention.username] || 0) + 1
      }
    })

    // Top users
    const topUsers = Object.entries(byUser)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([username, count]) => ({ username, count }))

    // Group by media type
    const byMediaType: { [key: string]: number } = {}
    mentions.forEach((mention: any) => {
      if (mention.media_type) {
        byMediaType[mention.media_type] = (byMediaType[mention.media_type] || 0) + 1
      }
    })

    return {
      success: true,
      stats: {
        totalMentions,
        totalLikes,
        totalComments,
        avgLikes: totalMentions > 0 ? Math.round(totalLikes / totalMentions) : 0,
        avgComments: totalMentions > 0 ? Math.round(totalComments / totalMentions) : 0,
        topUsers,
        byMediaType,
      },
    }
  } catch (error: any) {
    logger.error({ error }, "Error calculating mentions stats")
    return { success: false, error: error.message }
  }
}
