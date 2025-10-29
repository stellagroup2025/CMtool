import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { assertBrandRole } from "@/lib/rbac"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:accounts")

// GET /api/brands/[brandId]/accounts - List social accounts for brand
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params
    const session = await requireAuth()

    // Check user has access to this brand
    await assertBrandRole(session.user.id, brandId, ["AGENT", "ANALYST", "MANAGER", "OWNER"])

    const accounts = await prisma.socialAccount.findMany({
      where: {
        brandId,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        username: true,
        displayName: true,
        avatar: true,
        metadata: true,
        lastSyncAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ accounts })
  } catch (error: any) {
    logger.error({ error }, "Failed to list accounts")
    return NextResponse.json(
      { error: error.message || "Failed to list accounts" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
