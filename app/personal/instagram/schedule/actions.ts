"use server"

import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram:schedule")

/**
 * Create a scheduled post
 */
export async function createScheduledPost(
  brandId: string,
  data: {
    content: string
    mediaUrls: string[]
    hashtags: string[]
    scheduledAt: Date
    mediaType: "IMAGE" | "VIDEO" | "CAROUSEL" | "REEL"
  }
) {
  try {
    // Get Instagram account
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

    // Validate scheduled time is in the future
    if (new Date(data.scheduledAt) <= new Date()) {
      return { success: false, error: "Scheduled time must be in the future" }
    }

    // Create post with post item
    const post = await prisma.post.create({
      data: {
        brandId,
        status: "SCHEDULED",
        scheduledAt: new Date(data.scheduledAt),
        items: {
          create: {
            socialAccountId: account.id,
            platform: "INSTAGRAM",
            content: data.content,
            mediaUrls: data.mediaUrls,
            hashtags: data.hashtags,
            status: "SCHEDULED",
            metadata: {
              mediaType: data.mediaType,
            },
          },
        },
      },
      include: {
        items: true,
      },
    })

    logger.info({ postId: post.id }, "Scheduled post created")

    return {
      success: true,
      post,
      message: "Post scheduled successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error creating scheduled post")
    return { success: false, error: error.message }
  }
}

/**
 * Get all scheduled posts for a brand
 */
export async function getScheduledPosts(brandId: string, filters?: {
  status?: string
  startDate?: Date
  endDate?: Date
}) {
  try {
    const where: any = {
      brandId,
    }

    if (filters?.status) {
      where.status = filters.status
    } else {
      where.status = {
        in: ["DRAFT", "SCHEDULED", "APPROVED"],
      }
    }

    if (filters?.startDate || filters?.endDate) {
      where.scheduledAt = {}
      if (filters.startDate) {
        where.scheduledAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.scheduledAt.lte = filters.endDate
      }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        items: {
          include: {
            socialAccount: {
              select: {
                platform: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    })

    return {
      success: true,
      posts,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching scheduled posts")
    return { success: false, error: error.message }
  }
}

/**
 * Get a single scheduled post by ID
 */
export async function getScheduledPost(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        items: {
          include: {
            socialAccount: true,
          },
        },
        approvals: true,
      },
    })

    if (!post) {
      return { success: false, error: "Post not found" }
    }

    return {
      success: true,
      post,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching scheduled post")
    return { success: false, error: error.message }
  }
}

/**
 * Update a scheduled post
 */
export async function updateScheduledPost(
  postId: string,
  data: {
    content?: string
    mediaUrls?: string[]
    hashtags?: string[]
    scheduledAt?: Date
    status?: string
  }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { items: true },
    })

    if (!post) {
      return { success: false, error: "Post not found" }
    }

    // Can't update published posts
    if (post.status === "PUBLISHED") {
      return { success: false, error: "Cannot update published posts" }
    }

    // Validate scheduled time if provided
    if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
      return { success: false, error: "Scheduled time must be in the future" }
    }

    // Update post
    const updateData: any = {}
    if (data.status) updateData.status = data.status
    if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt)

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        items: true,
      },
    })

    // Update post item if content/media changed
    if (post.items.length > 0 && (data.content || data.mediaUrls || data.hashtags)) {
      const itemUpdateData: any = {}
      if (data.content) itemUpdateData.content = data.content
      if (data.mediaUrls) itemUpdateData.mediaUrls = data.mediaUrls
      if (data.hashtags) itemUpdateData.hashtags = data.hashtags

      await prisma.postItem.update({
        where: { id: post.items[0].id },
        data: itemUpdateData,
      })
    }

    logger.info({ postId }, "Scheduled post updated")

    return {
      success: true,
      post: updatedPost,
      message: "Post updated successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error updating scheduled post")
    return { success: false, error: error.message }
  }
}

/**
 * Delete a scheduled post
 */
export async function deleteScheduledPost(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return { success: false, error: "Post not found" }
    }

    // Can't delete published posts
    if (post.status === "PUBLISHED") {
      return { success: false, error: "Cannot delete published posts" }
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    logger.info({ postId }, "Scheduled post deleted")

    return {
      success: true,
      message: "Post deleted successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error deleting scheduled post")
    return { success: false, error: error.message }
  }
}

/**
 * Duplicate a post
 */
export async function duplicatePost(postId: string, scheduledAt?: Date) {
  try {
    const originalPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        items: true,
      },
    })

    if (!originalPost) {
      return { success: false, error: "Post not found" }
    }

    // Create duplicate
    const newPost = await prisma.post.create({
      data: {
        brandId: originalPost.brandId,
        status: "DRAFT",
        scheduledAt: scheduledAt || null,
        items: {
          create: originalPost.items.map((item) => ({
            socialAccountId: item.socialAccountId,
            platform: item.platform,
            content: item.content,
            mediaUrls: item.mediaUrls,
            hashtags: item.hashtags,
            status: "PENDING",
            metadata: item.metadata,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    logger.info({ originalPostId: postId, newPostId: newPost.id }, "Post duplicated")

    return {
      success: true,
      post: newPost,
      message: "Post duplicated successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error duplicating post")
    return { success: false, error: error.message }
  }
}

/**
 * Get posts stats for calendar view
 */
export async function getPostsCalendarStats(brandId: string, month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const posts = await prisma.post.findMany({
      where: {
        brandId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
      },
    })

    // Group by date
    const postsByDate: { [key: string]: any[] } = {}
    posts.forEach((post) => {
      if (post.scheduledAt) {
        const dateKey = post.scheduledAt.toISOString().split("T")[0]
        if (!postsByDate[dateKey]) {
          postsByDate[dateKey] = []
        }
        postsByDate[dateKey].push(post)
      }
    })

    return {
      success: true,
      postsByDate,
      total: posts.length,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching calendar stats")
    return { success: false, error: error.message }
  }
}
