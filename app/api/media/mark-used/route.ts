import { NextRequest, NextResponse } from "next/server"
import { createLogger } from "@/lib/logger"
import prisma from "@/lib/prisma"

const logger = createLogger("media-mark-used-api")

/**
 * POST /api/media/mark-used
 * Marks an image as used (increments usedCount and updates lastUsedAt)
 */
export async function POST(req: NextRequest) {
  try {
    const { publicId, brandId } = await req.json()

    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 })
    }

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 })
    }

    // Find the media asset
    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: {
        brandId_publicId: {
          brandId,
          publicId,
        },
      },
    })

    if (!mediaAsset) {
      // Image not in database yet, silently skip
      logger.warn({ publicId, brandId }, "Media asset not found in database")
      return NextResponse.json({
        success: true,
        message: "Media asset not tracked",
      })
    }

    // Update usedCount and lastUsedAt
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

    logger.info({ publicId, brandId }, "Marked image as used")

    return NextResponse.json({
      success: true,
      message: "Image marked as used",
    })
  } catch (error: any) {
    logger.error({ error }, "Error marking image as used")
    return NextResponse.json(
      { error: "Failed to mark image as used" },
      { status: 500 }
    )
  }
}
