import { NextRequest, NextResponse } from "next/server"
import { deleteFromCloudinary } from "@/lib/cloudinary"
import { createLogger } from "@/lib/logger"
import prisma from "@/lib/prisma"

const logger = createLogger("media-delete-api")

/**
 * DELETE /api/media/delete
 * Deletes an image from both Cloudinary and database
 */
export async function DELETE(req: NextRequest) {
  try {
    const { publicId, brandId } = await req.json()

    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 })
    }

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 })
    }

    // Delete from database first
    await prisma.mediaAsset.delete({
      where: {
        brandId_publicId: {
          brandId,
          publicId,
        },
      },
    })

    // Then delete from Cloudinary
    const result = await deleteFromCloudinary(publicId)

    if (!result.success) {
      logger.warn({ publicId, cloudinaryError: result.error }, "Failed to delete from Cloudinary but removed from DB")
    }

    logger.info({ publicId, brandId }, "Image deleted from database and Cloudinary")

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    })
  } catch (error: any) {
    logger.error({ error }, "Error deleting image")
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    )
  }
}
