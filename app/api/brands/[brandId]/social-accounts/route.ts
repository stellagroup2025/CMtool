import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { brandId } = await params

    // Verify user has access to this brand
    const membership = await prisma.membership.findUnique({
      where: {
        userId_brandId: {
          userId: session.user.id,
          brandId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get all social accounts for this brand
    const accounts = await prisma.socialAccount.findMany({
      where: {
        brandId,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        username: true,
        displayName: true,
        avatar: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching social accounts:", error)
    return NextResponse.json(
      { error: "Error fetching social accounts" },
      { status: 500 }
    )
  }
}
