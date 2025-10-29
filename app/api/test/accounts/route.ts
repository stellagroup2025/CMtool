import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:test:accounts")

/**
 * Test endpoint to list all connected social accounts
 * GET /api/test/accounts
 */
export async function GET() {
  try {
    const accounts = await prisma.socialAccount.findMany({
      select: {
        id: true,
        platform: true,
        username: true,
        displayName: true,
        platformAccountId: true,
        isActive: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      count: accounts.length,
      accounts: accounts.map(account => ({
        accountId: account.id,
        platform: account.platform,
        username: account.username,
        displayName: account.displayName,
        platformAccountId: account.platformAccountId,
        isActive: account.isActive,
        brandId: account.brand.id,
        brandName: account.brand.name,
        connectedAt: account.createdAt,
        testUrls: account.platform === 'INSTAGRAM' ? {
          info: `/api/test/instagram?accountId=${account.id}&action=info`,
          media: `/api/test/instagram?accountId=${account.id}&action=media`,
        } : null,
      })),
    })
  } catch (error: any) {
    logger.error({ error }, "Error listing accounts")
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
