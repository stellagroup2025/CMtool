import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { assertBrandRole } from "@/lib/rbac"
import prisma from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"
import { getAdapter } from "@/lib/social"
import { Platform } from "@prisma/client"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:accounts:connect")

const connectAccountSchema = z.object({
  platform: z.nativeEnum(Platform),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

// POST /api/brands/[brandId]/accounts/connect - Connect a social account
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
    const data = connectAccountSchema.parse(body)

    // Get adapter for platform
    const adapter = getAdapter(data.platform)

    // Verify token and get account info
    const accountInfo = await adapter.getAccount(data.accessToken)

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(data.accessToken)
    const encryptedRefreshToken = data.refreshToken ? encrypt(data.refreshToken) : null

    // Upsert social account
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        platform_platformAccountId: {
          platform: data.platform,
          platformAccountId: accountInfo.id,
        },
      },
      update: {
        brandId,
        username: accountInfo.username,
        displayName: accountInfo.displayName,
        avatar: accountInfo.avatar,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        metadata: accountInfo.metadata as any,
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        brandId,
        platform: data.platform,
        platformAccountId: accountInfo.id,
        username: accountInfo.username,
        displayName: accountInfo.displayName,
        avatar: accountInfo.avatar,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        metadata: accountInfo.metadata as any,
        lastSyncAt: new Date(),
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        brandId,
        userId: session.user.id,
        action: "account.connect",
        resource: socialAccount.id,
        metadata: {
          platform: data.platform,
          username: accountInfo.username,
        },
      },
    })

    logger.info(
      { brandId, platform: data.platform, accountId: socialAccount.id },
      "Connected social account"
    )

    // Return account without sensitive tokens
    const { accessToken, refreshToken, ...safeAccount } = socialAccount

    return NextResponse.json({ account: safeAccount }, { status: 201 })
  } catch (error: any) {
    logger.error({ error }, "Failed to connect account")

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to connect account" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
