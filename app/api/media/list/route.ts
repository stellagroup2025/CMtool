import { NextRequest, NextResponse } from "next/server"
import { createLogger } from "@/lib/logger"
import prisma from "@/lib/prisma"

const logger = createLogger("media-list-api")

/**
 * GET /api/media/list?brandId=xxx&filter=all|used|unused
 * Lists all images for a brand from database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("brandId")
    const filter = searchParams.get("filter") || "all" // all, used, unused

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 })
    }

    // Build where clause based on filter
    const where: any = { brandId }

    if (filter === "used") {
      where.usedCount = { gt: 0 }
    } else if (filter === "unused") {
      where.usedCount = 0
    }

    // Get images from database
    const images = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    logger.info({ brandId, filter, imageCount: images.length }, "Retrieved media library")

    return NextResponse.json({
      success: true,
      images: images.map((img) => ({
        id: img.publicId,
        url: img.url,
        thumbnail: img.url, // Already optimized
        width: img.width,
        height: img.height,
        format: img.format,
        bytes: img.bytes,
        createdAt: img.createdAt,
        usedCount: img.usedCount,
        lastUsedAt: img.lastUsedAt,
      })),
    })
  } catch (error: any) {
    logger.error({ error }, "Error fetching media library")
    return NextResponse.json(
      { error: "Failed to fetch media library" },
      { status: 500 }
    )
  }
}
