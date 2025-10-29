import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { assertBrandMember } from "@/lib/rbac"
import prisma from "@/lib/prisma"
import { ConversationStatus, ConversationPriority, Sentiment } from "@prisma/client"

// GET /api/brands/[brandId]/inbox - Get inbox conversations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params
    const session = await requireAuth()

    await assertBrandMember(session.user.id, brandId)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as ConversationStatus | null
    const priority = searchParams.get("priority") as ConversationPriority | null
    const sentiment = searchParams.get("sentiment") as Sentiment | null
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const conversations = await prisma.conversation.findMany({
      where: {
        brandId,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(sentiment && { sentiment }),
        ...(type && { type }),
      },
      include: {
        socialAccount: {
          select: {
            platform: true,
            username: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Just the latest message for preview
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.conversation.count({
      where: {
        brandId,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(sentiment && { sentiment }),
        ...(type && { type }),
      },
    })

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + conversations.length < total,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch inbox" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
