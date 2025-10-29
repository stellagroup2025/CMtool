"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { assertBrandRole } from "@/lib/rbac"
import prisma from "@/lib/prisma"
import { addPublishJob } from "@/lib/queue"
import { z } from "zod"

const postItemSchema = z.object({
  socialAccountId: z.string(),
  content: z.string().min(1),
  mediaUrls: z.array(z.string().url()).default([]),
  hashtags: z.array(z.string()).default([]),
})

const schedulePostSchema = z.object({
  brandId: z.string(),
  scheduledAt: z.string().datetime(),
  items: z.array(postItemSchema).min(1),
})

export async function schedulePostAction(data: z.infer<typeof schedulePostSchema>) {
  const session = await requireAuth()
  const validated = schedulePostSchema.parse(data)

  // Check permissions
  await assertBrandRole(session.user.id, validated.brandId, ["MANAGER", "OWNER"])

  const scheduledAt = new Date(validated.scheduledAt)

  if (scheduledAt <= new Date()) {
    throw new Error("Scheduled time must be in the future")
  }

  // Verify accounts
  const accountIds = validated.items.map((item) => item.socialAccountId)
  const accounts = await prisma.socialAccount.findMany({
    where: {
      id: { in: accountIds },
      brandId: validated.brandId,
      isActive: true,
    },
    select: {
      id: true,
      platform: true,
    },
  })

  if (accounts.length !== accountIds.length) {
    throw new Error("One or more social accounts not found")
  }

  // Create post
  const post = await prisma.$transaction(async (tx) => {
    const newPost = await tx.post.create({
      data: {
        brandId: validated.brandId,
        status: "SCHEDULED",
        scheduledAt,
        createdById: session.user.id,
      },
    })

    const postItems = await Promise.all(
      validated.items.map(async (item) => {
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

    // Enqueue jobs
    await Promise.all(
      postItems.map((item) =>
        addPublishJob(
          {
            postItemId: item.id,
            brandId: validated.brandId,
          },
          scheduledAt
        )
      )
    )

    return { ...newPost, items: postItems }
  })

  revalidatePath(`/dashboard/${validated.brandId}`)
  revalidatePath(`/dashboard/${validated.brandId}/calendar`)

  return { success: true, post }
}
