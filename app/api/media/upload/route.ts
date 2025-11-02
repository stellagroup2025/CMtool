import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary, getInstagramOptimizedUrl } from "@/lib/cloudinary"
import { createLogger } from "@/lib/logger"
import prisma from "@/lib/prisma"

const logger = createLogger("media-upload-api")

/**
 * POST /api/media/upload
 * Uploads an image to Cloudinary (organized by brandId)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const brandId = formData.get("brandId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}`

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, brandId, filename)
    const cloudinaryResult = result as any

    // Get Instagram-optimized URL
    const optimizedUrl = getInstagramOptimizedUrl(cloudinaryResult.public_id)

    // Save to database
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        brandId,
        publicId: cloudinaryResult.public_id,
        url: optimizedUrl,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        bytes: cloudinaryResult.bytes,
      },
    })

    logger.info(
      {
        brandId,
        filename,
        size: file.size,
        type: file.type,
        mediaAssetId: mediaAsset.id,
      },
      "Image uploaded to Cloudinary and saved to database"
    )

    return NextResponse.json({
      success: true,
      id: mediaAsset.id,
      url: optimizedUrl,
      publicId: cloudinaryResult.public_id,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      format: cloudinaryResult.format,
      bytes: cloudinaryResult.bytes,
    })
  } catch (error: any) {
    logger.error({ error }, "Error uploading to Cloudinary")
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    )
  }
}
