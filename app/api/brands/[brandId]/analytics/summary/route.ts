import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { assertBrandMember } from "@/lib/rbac"
import prisma from "@/lib/prisma"
import { subDays } from "date-fns"

// GET /api/brands/[brandId]/analytics/summary - Get analytics summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params
    const session = await requireAuth()

    await assertBrandMember(session.user.id, brandId)

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    // Parse range
    const daysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    }
    const days = daysMap[range] || 7
    const startDate = subDays(new Date(), days)

    // Get published posts in the range
    const posts = await prisma.postItem.findMany({
      where: {
        post: {
          brandId,
        },
        status: "PUBLISHED",
        publishedAt: {
          gte: startDate,
        },
      },
      include: {
        metrics: {
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
      },
    })

    // Aggregate metrics
    const totalMetrics = posts.reduce(
      (acc, post) => {
        const metrics = post.metrics[0]
        if (!metrics) return acc

        return {
          likes: acc.likes + metrics.likes,
          comments: acc.comments + metrics.comments,
          shares: acc.shares + metrics.shares,
          views: acc.views + metrics.views,
          reach: acc.reach + metrics.reach,
          engagement: acc.engagement + metrics.engagement,
          clicks: acc.clicks + (metrics.clicks || 0),
          saves: acc.saves + (metrics.saves || 0),
        }
      },
      {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        reach: 0,
        engagement: 0,
        clicks: 0,
        saves: 0,
      }
    )

    // Get conversation counts
    const conversations = await prisma.conversation.groupBy({
      by: ["status"],
      where: {
        brandId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    })

    const conversationStats = conversations.reduce(
      (acc, item) => {
        acc[item.status.toLowerCase()] = item._count
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      range,
      startDate,
      endDate: new Date(),
      metrics: totalMetrics,
      posts: {
        total: posts.length,
      },
      conversations: conversationStats,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
