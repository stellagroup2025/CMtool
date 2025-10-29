import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { getPresignedPutUrl } from "@/lib/s3"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:uploads")

const presignSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  folder: z.string().optional().default("uploads"),
})

// POST /api/uploads/presign - Get presigned URL for upload
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const data = presignSchema.parse(body)

    // Validate content type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ]

    if (!allowedTypes.includes(data.contentType)) {
      return NextResponse.json(
        { error: "Invalid content type. Only images and videos are allowed." },
        { status: 400 }
      )
    }

    const result = await getPresignedPutUrl(data.filename, data.contentType, data.folder)

    logger.info({ key: result.key }, "Generated presigned URL")

    return NextResponse.json(result)
  } catch (error: any) {
    logger.error({ error }, "Failed to generate presigned URL")

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate presigned URL" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
