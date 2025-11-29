import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:personal:onboarding")

interface OnboardingData {
  name: string
  niche: string
  objective: string
  toneOfVoice: string[]
  platforms: string[]
  contentFrequency: number
}

// POST /api/personal/onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body: OnboardingData = await request.json()

    const { name, niche, objective, toneOfVoice, platforms, contentFrequency } = body

    // Validate required fields
    if (!name || !niche || !objective || !toneOfVoice?.length || !platforms?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    logger.info(
      { userId: session.user.id, name, niche, objective },
      "Completing personal mode onboarding"
    )

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        niche,
        objective,
        toneOfVoice,
        preferredPlatforms: platforms,
        contentFrequency,
        mode: "PERSONAL", // Confirm personal mode
      },
    })

    // Create a personal brand for the user
    const personalBrand = await prisma.brand.create({
      data: {
        name: `${name} - Personal`,
        slug: `personal-${session.user.id.toLowerCase()}`,
        isPersonal: true,
        memberships: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    })

    logger.info(
      { userId: session.user.id, brandId: personalBrand.id },
      "Personal brand created successfully"
    )

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        niche: updatedUser.niche,
        objective: updatedUser.objective,
        toneOfVoice: updatedUser.toneOfVoice,
        preferredPlatforms: updatedUser.preferredPlatforms,
        contentFrequency: updatedUser.contentFrequency,
      },
      brand: {
        id: personalBrand.id,
        name: personalBrand.name,
        slug: personalBrand.slug,
      },
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to complete onboarding")

    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
