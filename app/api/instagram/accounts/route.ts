import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("instagram-accounts-api")

/**
 * GET /api/instagram/accounts?brandId=xxx
 * Obtiene las cuentas sociales de Instagram de una marca
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("brandId")

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      )
    }

    // Get Instagram social accounts for this brand
    const accounts = await prisma.socialAccount.findMany({
      where: {
        brandId,
        platform: "INSTAGRAM",
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        platformAccountId: true,
        metadata: true,
      },
    })

    return NextResponse.json({
      success: true,
      accounts,
    })
  } catch (error: any) {
    logger.error({ error }, "Error fetching Instagram accounts")
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
