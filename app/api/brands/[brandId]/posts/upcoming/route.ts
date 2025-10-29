import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { assertBrandMember } from "@/lib/rbac"
import prisma from "@/lib/prisma"
import { addDays } from "date-fns"

// GET /api/brands/[brandId]/posts/upcoming - Get upcoming scheduled posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params
    const session = await requireAuth()

    await assertBrandMember(session.user.id, brandId)

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7")

    const endDate = addDays(new Date(), days)

    const posts = await prisma.post.findMany({
      where: {
        brandId,
        status: { in: ["SCHEDULED", "APPROVED"] },
        scheduledAt: {
          gte: new Date(),
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            socialAccount: {
              select: {
                platform: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    })

    return NextResponse.json({ posts })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch upcoming posts" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
