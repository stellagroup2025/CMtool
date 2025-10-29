import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { assertBrandRole } from "@/lib/rbac"
import prisma from "@/lib/prisma"
import { addPublishJob } from "@/lib/queue"
import { Platform } from "@prisma/client"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:posts:schedule")

const postItemSchema = z.object({
  socialAccountId: z.string(),
  content: z.string().min(1),
  mediaUrls: z.array(z.string().url()).default([]),
  hashtags: z.array(z.string()).default([]),
})

const schedulePostSchema = z.object({
  scheduledAt: z.string().datetime(),
  items: z.array(postItemSchema).min(1),
})

// POST /api/brands/[brandId]/posts/schedule - Schedule a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params
    const session = await requireAuth()

    // Check user has MANAGER or OWNER role
    await assertBrandRole(session.user.id, brandId, ["MANAGER", "OWNER"])

    const body = await request.json()
    const data = schedulePostSchema.parse(body)

    const scheduledAt = new Date(data.scheduledAt)

    // Validate scheduledAt is in the future
    if (scheduledAt <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      )
    }

    // Verify all social accounts belong to this brand
    const accountIds = data.items.map((item) => item.socialAccountId)
    const accounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: accountIds },
        brandId,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
      },
    })

    if (accounts.length !== accountIds.length) {
      return NextResponse.json(
        { error: "One or more social accounts not found or inactive" },
        { status: 400 }
      )
    }

    // Create post and post items in a transaction
    const post = await prisma.$transaction(async (tx) => {
      // Create parent post
      const newPost = await tx.post.create({
        data: {
          brandId,
          status: "SCHEDULED",
          scheduledAt,
          createdById: session.user.id,
        },
      })

      // Create post items for each platform
      const postItems = await Promise.all(
        data.items.map(async (item) => {
          const account = accounts.find((a) => a.id === item.socialAccountId)!

          return tx.postItem.create({
            data: {
              postId: newPost.id,
              socialAccountId: item.socialAccountId,
              platform: account.platform,
              content: item.content,
              mediaUrls: item.mediaUrls,
              hashtags: item.hashtags,
              status: "SCHEDULED",
            },
          })
        })
      )

      // Enqueue publish jobs for each item
      await Promise.all(
        postItems.map((item) =>
          addPublishJob(
            {
              postItemId: item.id,
              brandId,
            },
            scheduledAt
          )
        )
      )

      return { ...newPost, items: postItems }
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        brandId,
        userId: session.user.id,
        action: "post.schedule",
        resource: post.id,
        metadata: {
          scheduledAt: scheduledAt.toISOString(),
          itemCount: data.items.length,
        },
      },
    })

    logger.info(
      { brandId, postId: post.id, scheduledAt },
      "Scheduled post"
    )

    return NextResponse.json({ post }, { status: 201 })
  } catch (error: any) {
    logger.error({ error }, "Failed to schedule post")

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to schedule post" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
