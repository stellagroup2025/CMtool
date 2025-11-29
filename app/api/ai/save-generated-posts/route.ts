import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { z } from "zod"

const logger = createLogger("api:ai:save-generated-posts")

const generatedPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  content: z.string(),
  hashtags: z.array(z.string()),
  imageUrl: z.string().nullable().optional(),
  platform: z.string(),
  metadata: z.any().optional(),
})

const savePostsSchema = z.object({
  brandId: z.string(),
  batchId: z.string(),
  posts: z.array(generatedPostSchema),
  language: z.string().optional(),
  tone: z.string().optional(),
  controversyLevel: z.number().optional(),
})

// POST /api/ai/save-generated-posts
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const data = savePostsSchema.parse(body)

    logger.info(
      { brandId: data.brandId, batchId: data.batchId, count: data.posts.length },
      "Saving generated posts"
    )

    // Save all posts to database
    const savedPosts = await prisma.generatedPost.createMany({
      data: data.posts.map((post) => ({
        brandId: data.brandId,
        batchId: data.batchId,
        title: post.title,
        contentType: post.type,
        content: post.content,
        hashtags: post.hashtags,
        imageUrl: post.imageUrl || null,
        platform: post.platform as any,
        language: data.language || "es",
        tone: data.tone,
        controversyLevel: data.controversyLevel,
        metadata: post.metadata,
      })),
    })

    logger.info({ count: savedPosts.count }, "Posts saved successfully")

    return NextResponse.json({
      success: true,
      saved: savedPosts.count,
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to save generated posts")

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to save posts" },
      { status: 500 }
    )
  }
}

// GET /api/ai/save-generated-posts - Get saved posts for a brand
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get("brandId")
    const batchId = searchParams.get("batchId")

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 })
    }

    const where: any = { brandId }
    if (batchId) {
      where.batchId = batchId
    }

    const posts = await prisma.generatedPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ posts })
  } catch (error: any) {
    logger.error({ error }, "Failed to fetch generated posts")

    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 }
    )
  }
}
