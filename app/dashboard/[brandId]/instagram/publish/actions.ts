"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { createLogger } from "@/lib/logger"

const logger = createLogger("actions:instagram:publish")

/**
 * Publish a single photo to Instagram
 * Requires: instagram_content_publish, pages_manage_posts permissions
 */
export async function publishPhoto(
  brandId: string,
  imageUrl: string,
  caption?: string,
  location_id?: string
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

    // Step 1: Create media container
    const createParams = new URLSearchParams({
      image_url: imageUrl,
      access_token: accessToken,
    })

    if (caption) {
      createParams.set("caption", caption)
    }

    if (location_id) {
      createParams.set("location_id", location_id)
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
      logger.error({ error }, "Failed to create media container")
      return { success: false, error: error.error?.message || "Failed to create media container" }
    }

    const createData = await createResponse.json()
    const creationId = createData.id

    // Step 2: Publish the media
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
      logger.error({ error }, "Failed to publish media")
      return { success: false, error: error.error?.message || "Failed to publish media" }
    }

    const publishData = await publishResponse.json()

    logger.info({ mediaId: publishData.id }, "Photo published successfully")

    return {
      success: true,
      mediaId: publishData.id,
      message: "Photo published successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error publishing photo")
    return { success: false, error: error.message }
  }
}

/**
 * Publish a video to Instagram
 * Requires: instagram_content_publish, pages_manage_posts permissions
 */
export async function publishVideo(
  brandId: string,
  videoUrl: string,
  caption?: string,
  coverUrl?: string,
  location_id?: string
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

    // Step 1: Create video container
    const createParams = new URLSearchParams({
      media_type: "VIDEO",
      video_url: videoUrl,
      access_token: accessToken,
    })

    if (caption) {
      createParams.set("caption", caption)
    }

    if (coverUrl) {
      createParams.set("thumb_offset", "0") // or use cover_url if available
    }

    if (location_id) {
      createParams.set("location_id", location_id)
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
      logger.error({ error }, "Failed to create video container")
      return { success: false, error: error.error?.message || "Failed to create video container" }
    }

    const createData = await createResponse.json()
    const creationId = createData.id

    // Step 2: Wait for video to be ready (check status)
    let isReady = false
    let attempts = 0
    const maxAttempts = 30 // 30 attempts = ~2 minutes

    while (!isReady && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 4000)) // Wait 4 seconds

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

    // Step 3: Publish the video
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
      logger.error({ error }, "Failed to publish video")
      return { success: false, error: error.error?.message || "Failed to publish video" }
    }

    const publishData = await publishResponse.json()

    logger.info({ mediaId: publishData.id }, "Video published successfully")

    return {
      success: true,
      mediaId: publishData.id,
      message: "Video published successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error publishing video")
    return { success: false, error: error.message }
  }
}

/**
 * Publish a carousel (multiple images/videos) to Instagram
 * Requires: instagram_content_publish, pages_manage_posts permissions
 */
export async function publishCarousel(
  brandId: string,
  items: Array<{ type: "IMAGE" | "VIDEO"; url: string }>,
  caption?: string,
  location_id?: string
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

    if (items.length < 2 || items.length > 10) {
      return { success: false, error: "Carousel must have between 2 and 10 items" }
    }

    const accessToken = decrypt(account.accessToken)
    const igAccountId = account.platformAccountId

    // Step 1: Create containers for each item
    const itemIds: string[] = []

    for (const item of items) {
      const params = new URLSearchParams({
        access_token: accessToken,
      })

      if (item.type === "IMAGE") {
        params.set("image_url", item.url)
        params.set("is_carousel_item", "true")
      } else {
        params.set("media_type", "VIDEO")
        params.set("video_url", item.url)
        params.set("is_carousel_item", "true")
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/media`,
        {
          method: "POST",
          body: params,
        }
      )

      if (!response.ok) {
        const error = await response.json()
        logger.error({ error }, "Failed to create carousel item")
        return { success: false, error: error.error?.message || "Failed to create carousel item" }
      }

      const data = await response.json()
      itemIds.push(data.id)

      // If video, wait for it to be ready
      if (item.type === "VIDEO") {
        let isReady = false
        let attempts = 0

        while (!isReady && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 4000))

          const statusResponse = await fetch(
            `https://graph.facebook.com/v19.0/${data.id}?fields=status_code&access_token=${accessToken}`
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
    }

    // Step 2: Create carousel container
    const carouselParams = new URLSearchParams({
      media_type: "CAROUSEL",
      children: itemIds.join(","),
      access_token: accessToken,
    })

    if (caption) {
      carouselParams.set("caption", caption)
    }

    if (location_id) {
      carouselParams.set("location_id", location_id)
    }

    const carouselResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media`,
      {
        method: "POST",
        body: carouselParams,
      }
    )

    if (!carouselResponse.ok) {
      const error = await carouselResponse.json()
      logger.error({ error }, "Failed to create carousel container")
      return {
        success: false,
        error: error.error?.message || "Failed to create carousel container",
      }
    }

    const carouselData = await carouselResponse.json()
    const creationId = carouselData.id

    // Step 3: Publish the carousel
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
      logger.error({ error }, "Failed to publish carousel")
      return { success: false, error: error.error?.message || "Failed to publish carousel" }
    }

    const publishData = await publishResponse.json()

    logger.info({ mediaId: publishData.id }, "Carousel published successfully")

    return {
      success: true,
      mediaId: publishData.id,
      message: "Carousel published successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error publishing carousel")
    return { success: false, error: error.message }
  }
}

/**
 * Publish a Reel to Instagram
 * Requires: instagram_content_publish, pages_manage_posts permissions
 */
export async function publishReel(
  brandId: string,
  videoUrl: string,
  caption?: string,
  coverUrl?: string,
  shareToFeed: boolean = true
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

    // Step 1: Create Reel container
    const createParams = new URLSearchParams({
      media_type: "REELS",
      video_url: videoUrl,
      share_to_feed: shareToFeed.toString(),
      access_token: accessToken,
    })

    if (caption) {
      createParams.set("caption", caption)
    }

    if (coverUrl) {
      createParams.set("cover_url", coverUrl)
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
      logger.error({ error }, "Failed to create Reel container")
      return { success: false, error: error.error?.message || "Failed to create Reel container" }
    }

    const createData = await createResponse.json()
    const creationId = createData.id

    // Step 2: Wait for Reel to be ready
    let isReady = false
    let attempts = 0
    const maxAttempts = 30

    while (!isReady && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 4000))

      const statusResponse = await fetch(
        `https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${accessToken}`
      )

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        if (statusData.status_code === "FINISHED") {
          isReady = true
        } else if (statusData.status_code === "ERROR") {
          return { success: false, error: "Reel processing failed" }
        }
      }

      attempts++
    }

    if (!isReady) {
      return { success: false, error: "Reel processing timeout" }
    }

    // Step 3: Publish the Reel
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
      logger.error({ error }, "Failed to publish Reel")
      return { success: false, error: error.error?.message || "Failed to publish Reel" }
    }

    const publishData = await publishResponse.json()

    logger.info({ mediaId: publishData.id }, "Reel published successfully")

    return {
      success: true,
      mediaId: publishData.id,
      message: "Reel published successfully!",
    }
  } catch (error: any) {
    logger.error({ error }, "Error publishing Reel")
    return { success: false, error: error.message }
  }
}

/**
 * Upload media file and get a publicly accessible URL
 * This is a helper function - you'll need to implement file upload to your storage
 */
export async function uploadMediaFile(
  brandId: string,
  file: File,
  type: "image" | "video"
): Promise<{ success: boolean; url?: string; error?: string }> {
  // TODO: Implement file upload to your storage service (S3, Cloudinary, etc.)
  // For now, return an error indicating this needs to be implemented
  return {
    success: false,
    error: "File upload not yet configured. Please provide a publicly accessible URL for the media.",
  }
}
