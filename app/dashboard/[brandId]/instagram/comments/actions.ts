"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram:comments")

export async function getMediaComments(brandId: string, mediaId: string) {
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

    // Get comments for this media
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${mediaId}/comments?fields=id,text,username,timestamp,like_count,replies{id,text,username,timestamp}&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch comments")
      return { success: false, error: "Failed to fetch comments" }
    }

    const data = await response.json()

    return {
      success: true,
      comments: data.data || [],
      mediaId,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching comments")
    return { success: false, error: error.message }
  }
}

export async function getAllRecentComments(brandId: string, limit: number = 50) {
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

    // Get recent media
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments_count&limit=20&access_token=${accessToken}`
    )

    if (!mediaResponse.ok) {
      return { success: false, error: "Failed to fetch media" }
    }

    const mediaData = await mediaResponse.json()
    const allComments: any[] = []

    // Get comments for each media post
    for (const media of mediaData.data || []) {
      if (media.comments_count > 0) {
        const commentsResponse = await fetch(
          `https://graph.facebook.com/v19.0/${media.id}/comments?fields=id,text,username,timestamp,like_count&limit=10&access_token=${accessToken}`
        )

        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          for (const comment of commentsData.data || []) {
            allComments.push({
              ...comment,
              media: {
                id: media.id,
                caption: media.caption,
                thumbnail: media.thumbnail_url || media.media_url,
                permalink: media.permalink,
              },
            })
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    allComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      success: true,
      comments: allComments.slice(0, limit),
      total: allComments.length,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching all comments")
    return { success: false, error: error.message }
  }
}

export async function getCommentStats(brandId: string) {
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

    // Get recent media with comment counts
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media?fields=id,comments_count,timestamp&limit=50&access_token=${accessToken}`
    )

    if (!response.ok) {
      return { success: false, error: "Failed to fetch media" }
    }

    const data = await response.json()
    const media = data.data || []

    const totalComments = media.reduce((sum: number, m: any) => sum + (m.comments_count || 0), 0)
    const avgComments = media.length > 0 ? totalComments / media.length : 0

    // Find posts with most comments
    const topPosts = media
      .filter((m: any) => m.comments_count > 0)
      .sort((a: any, b: any) => b.comments_count - a.comments_count)
      .slice(0, 5)

    return {
      success: true,
      stats: {
        totalComments,
        avgComments: Math.round(avgComments),
        postsWithComments: media.filter((m: any) => m.comments_count > 0).length,
        totalPosts: media.length,
        topPosts,
      },
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching comment stats")
    return { success: false, error: error.message }
  }
}

/**
 * Reply to a comment on Instagram
 * Requires: instagram_manage_comments permission
 */
export async function replyToComment(
  brandId: string,
  commentId: string,
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
      return { success: false, error: "Reply message cannot be empty" }
    }

    const accessToken = decrypt(account.accessToken)

    // Reply to the comment
    const params = new URLSearchParams({
      message: message.trim(),
      access_token: accessToken,
    })

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${commentId}/replies`,
      {
        method: "POST",
        body: params,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to reply to comment")
      return {
        success: false,
        error: error.error?.message || "Failed to reply to comment",
      }
    }

    const data = await response.json()

    logger.info({ replyId: data.id, commentId }, "Reply posted successfully")

    return {
      success: true,
      replyId: data.id,
      message: "Reply posted successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error replying to comment")
    return { success: false, error: error.message }
  }
}

/**
 * Hide a comment on Instagram
 * Requires: instagram_manage_comments permission
 */
export async function hideComment(brandId: string, commentId: string) {
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

    const params = new URLSearchParams({
      hide: "true",
      access_token: accessToken,
    })

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${commentId}`,
      {
        method: "POST",
        body: params,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to hide comment")
      return {
        success: false,
        error: error.error?.message || "Failed to hide comment",
      }
    }

    logger.info({ commentId }, "Comment hidden successfully")

    return {
      success: true,
      message: "Comment hidden successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error hiding comment")
    return { success: false, error: error.message }
  }
}

/**
 * Delete a comment on Instagram
 * Requires: instagram_manage_comments permission
 */
export async function deleteComment(brandId: string, commentId: string) {
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
      `https://graph.facebook.com/v19.0/${commentId}?access_token=${accessToken}`,
      {
        method: "DELETE",
      }
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to delete comment")
      return {
        success: false,
        error: error.error?.message || "Failed to delete comment",
      }
    }

    logger.info({ commentId }, "Comment deleted successfully")

    return {
      success: true,
      message: "Comment deleted successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error deleting comment")
    return { success: false, error: error.message }
  }
}
