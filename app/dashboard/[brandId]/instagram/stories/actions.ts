"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram:stories")

/**
 * Get active stories (last 24 hours)
 * Requires: instagram_basic permission
 */
export async function getActiveStories(brandId: string) {
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

    // Get stories
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/stories?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch stories")
      return {
        success: false,
        error: error.error?.message || "Failed to fetch stories",
      }
    }

    const data = await response.json()

    return {
      success: true,
      stories: data.data || [],
      total: data.data?.length || 0,
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching stories")
    return { success: false, error: error.message }
  }
}

/**
 * Get story insights
 * Requires: instagram_manage_insights permission
 */
export async function getStoryInsights(brandId: string, storyId: string) {
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

    // Get insights
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${storyId}/insights?metric=impressions,reach,replies,exits,taps_forward,taps_back&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, "Failed to fetch story insights")
      return {
        success: false,
        hasInsights: false,
        message: "Story insights require instagram_manage_insights permission",
      }
    }

    const data = await response.json()

    return {
      success: true,
      hasInsights: true,
      insights: data.data || [],
    }
  } catch (error: any) {
    logger.error({ error }, "Error fetching story insights")
    return { success: false, error: error.message }
  }
}

/**
 * Publish a story
 * Requires: instagram_content_publish permission
 */
export async function publishStory(
  brandId: string,
  mediaUrl: string,
  mediaType: "IMAGE" | "VIDEO"
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

    const accessToken = decrypt(account.accessToken)
    const igAccountId = account.platformAccountId

    // Create story container
    const createParams = new URLSearchParams({
      media_type: "STORIES",
      access_token: accessToken,
    })

    if (mediaType === "IMAGE") {
      createParams.set("image_url", mediaUrl)
    } else {
      createParams.set("video_url", mediaUrl)
    }

    const createResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media`,
      {
        method: "POST",
        body: createParams,
      }
    )

    if (!createResponse.ok) {
      const error = await createResponse.json()
      logger.error({ error }, "Failed to create story container")
      return {
        success: false,
        error: error.error?.message || "Failed to create story container",
      }
    }

    const createData = await createResponse.json()
    const creationId = createData.id

    // Wait for processing if video
    if (mediaType === "VIDEO") {
      let isReady = false
      let attempts = 0

      while (!isReady && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 4000))

        const statusResponse = await fetch(
          `https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${accessToken}`
        )

        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          if (statusData.status_code === "FINISHED") {
            isReady = true
          } else if (statusData.status_code === "ERROR") {
            return { success: false, error: "Video processing failed" }
          }
        }

        attempts++
      }

      if (!isReady) {
        return { success: false, error: "Video processing timeout" }
      }
    }

    // Publish the story
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    })

    const publishResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        body: publishParams,
      }
    )

    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      logger.error({ error }, "Failed to publish story")
      return {
        success: false,
        error: error.error?.message || "Failed to publish story",
      }
    }

    const publishData = await publishResponse.json()

    logger.info({ storyId: publishData.id }, "Story published successfully")

    return {
      success: true,
      storyId: publishData.id,
      message: "Story published successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error publishing story")
    return { success: false, error: error.message }
  }
}
