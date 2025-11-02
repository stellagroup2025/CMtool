import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { decrypt } from "@/lib/crypto"
import {
  publishSingleImage,
  publishReel,
  publishCarousel,
} from "@/lib/instagram-api"

const logger = createLogger("instagram-publish-api")

// Validation schemas
const publishImageSchema = z.object({
  type: z.literal("image"),
  brandId: z.string(),
  socialAccountId: z.string(),
  imageUrl: z.string().url(),
  caption: z.string().optional(),
})

const publishReelSchema = z.object({
  type: z.literal("reel"),
  brandId: z.string(),
  socialAccountId: z.string(),
  videoUrl: z.string().url(),
  caption: z.string().optional(),
  coverUrl: z.string().url().optional(),
  shareToFeed: z.boolean().optional(),
})

const publishCarouselSchema = z.object({
  type: z.literal("carousel"),
  brandId: z.string(),
  socialAccountId: z.string(),
  items: z
    .array(
      z.object({
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
      })
      .refine(
        (item) => (item.imageUrl && !item.videoUrl) || (!item.imageUrl && item.videoUrl),
        {
          message: "Each item must have either imageUrl OR videoUrl, not both or neither",
        }
      )
    )
    .min(2)
    .max(10),
  caption: z.string().optional(),
})

const publishSchema = z.discriminatedUnion("type", [
  publishImageSchema,
  publishReelSchema,
  publishCarouselSchema,
])

/**
 * Helper function to extract Cloudinary public IDs from URLs
 */
function extractCloudinaryPublicId(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/)
    if (match) {
      return match[1].replace(/\.\w+$/, '') // Remove file extension if present
    }
    return null
  } catch {
    return null
  }
}

/**
 * Helper function to mark images as used in the database
 */
async function markImagesAsUsed(
  data: z.infer<typeof publishSchema>,
  brandId: string
) {
  const publicIds: string[] = []

  // Extract publicIds based on content type
  if (data.type === "image") {
    const publicId = extractCloudinaryPublicId(data.imageUrl)
    if (publicId) publicIds.push(publicId)
  } else if (data.type === "carousel") {
    for (const item of data.items) {
      if (item.imageUrl) {
        const publicId = extractCloudinaryPublicId(item.imageUrl)
        if (publicId) publicIds.push(publicId)
      }
    }
  }

  // Mark each image as used
  for (const publicId of publicIds) {
    try {
      const mediaAsset = await prisma.mediaAsset.findUnique({
        where: {
          brandId_publicId: {
            brandId,
            publicId,
          },
        },
      })

      if (mediaAsset) {
        await prisma.mediaAsset.update({
          where: {
            brandId_publicId: {
              brandId,
              publicId,
            },
          },
          data: {
            usedCount: { increment: 1 },
            lastUsedAt: new Date(),
          },
        })
        console.log("Marked image as used:", publicId, brandId)
      }
    } catch (error) {
      console.error("Failed to mark image as used:", error, publicId)
    }
  }
}

/**
 * POST /api/instagram/publish
 * Publica contenido en Instagram (imagen, reel o carousel)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = publishSchema.parse(body)

    // Get social account
    const socialAccount = await prisma.socialAccount.findUnique({
      where: {
        id: data.socialAccountId,
      },
    })

    if (!socialAccount) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      )
    }

    if (socialAccount.platform !== "INSTAGRAM") {
      return NextResponse.json(
        { error: "Social account is not an Instagram account" },
        { status: 400 }
      )
    }

    if (!socialAccount.isActive) {
      return NextResponse.json(
        { error: "Social account is not active" },
        { status: 400 }
      )
    }

    // Verify brand ownership
    if (socialAccount.brandId !== data.brandId) {
      return NextResponse.json(
        { error: "Social account does not belong to this brand" },
        { status: 403 }
      )
    }

    // Get Instagram user ID from platformAccountId
    // Note: platformAccountId contains the Instagram Business Account ID
    const igUserId = socialAccount.platformAccountId

    if (!igUserId) {
      return NextResponse.json(
        { error: "Instagram business account ID not found" },
        { status: 400 }
      )
    }

    // Decrypt access token (it's stored encrypted in the database)
    let pageAccessToken: string
    try {
      pageAccessToken = decrypt(socialAccount.accessToken)
    } catch (error) {
      logger.error({ error }, "Failed to decrypt access token")
      return NextResponse.json(
        { error: "Failed to decrypt access token" },
        { status: 500 }
      )
    }

    // Log the request for debugging
    console.log("Publishing content to Instagram:", {
      type: data.type,
      imageUrl: data.type === "image" ? data.imageUrl : undefined,
      videoUrl: data.type === "reel" ? data.videoUrl : undefined,
      igUserId,
      socialAccountId: data.socialAccountId,
    })

    // Publish based on type
    let result

    switch (data.type) {
      case "image":
        console.log("Publishing single image:", data.imageUrl)
        result = await publishSingleImage(
          igUserId,
          pageAccessToken,
          data.imageUrl,
          data.caption
        )
        break

      case "reel":
        result = await publishReel(
          igUserId,
          pageAccessToken,
          data.videoUrl,
          data.caption,
          data.coverUrl,
          data.shareToFeed
        )
        break

      case "carousel":
        console.log("Publishing carousel:", {
          itemCount: data.items.length,
          items: data.items.map(item => ({
            hasImage: !!item.imageUrl,
            hasVideo: !!item.videoUrl,
            imageUrl: item.imageUrl ? item.imageUrl.substring(0, 50) + '...' : undefined,
            videoUrl: item.videoUrl ? item.videoUrl.substring(0, 50) + '...' : undefined,
          }))
        })
        result = await publishCarousel(
          igUserId,
          pageAccessToken,
          data.items,
          data.caption
        )
        break
    }

    if (!result.success) {
      console.error("Failed to publish content:", result.error)
      return NextResponse.json(
        { error: result.error || "Failed to publish content" },
        { status: 500 }
      )
    }

    // Mark images as used (fire and forget - don't block response)
    markImagesAsUsed(data, data.brandId).catch((error) => {
      console.error("Failed to mark images as used:", error)
    })

    console.log("Content published successfully:", {
      postId: result.postId,
      type: data.type,
      socialAccountId: data.socialAccountId,
    })

    return NextResponse.json({
      success: true,
      postId: result.postId,
      message: "Content published successfully",
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error publishing content:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
