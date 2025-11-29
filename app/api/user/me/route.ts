import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        mode: true,
        niche: true,
        objective: true,
        toneOfVoice: true,
        preferredPlatforms: true,
        contentFrequency: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get personal brand if user is in personal mode
    let personalBrand = null
    if (user.mode === "PERSONAL") {
      personalBrand = await prisma.brand.findFirst({
        where: {
          isPersonal: true,
          memberships: {
            some: {
              userId: user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          socialAccounts: {
            select: {
              id: true,
              platform: true,
              username: true,
              displayName: true,
              avatar: true,
              isActive: true,
            },
          },
        },
      })
    }

    return NextResponse.json({
      ...user,
      personalBrand,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Error fetching user" },
      { status: 500 }
    )
  }
}
