import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { uploadDataUrlsToS3 } from "@/lib/upload-helpers"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:upload:data-urls")

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { dataUrls, fileNamePrefix = "template" } = body

    if (!dataUrls || !Array.isArray(dataUrls) || dataUrls.length === 0) {
      return NextResponse.json(
        { error: "dataUrls array is required" },
        { status: 400 }
      )
    }

    logger.info({ count: dataUrls.length, fileNamePrefix }, "Uploading data URLs to Cloudinary")

    // Upload all data URLs to Cloudinary
    const urls = await uploadDataUrlsToS3(dataUrls, fileNamePrefix)

    logger.info({ count: urls.length }, "Successfully uploaded data URLs to Cloudinary")

    return NextResponse.json({
      urls,
      count: urls.length,
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to upload data URLs")

    return NextResponse.json(
      { error: error.message || "Failed to upload images" },
      { status: 500 }
    )
  }
}
