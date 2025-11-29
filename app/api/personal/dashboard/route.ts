import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        niche: true,
        objective: true,
        toneOfVoice: true,
        preferredPlatforms: true,
        contentFrequency: true,
        industry: true,
        industryOther: true,
        companyDescription: true,
        targetAudience: true,
        brandPersonality: true,
        brandColors: true,
        logoUrl: true,
        templates: true,
        onboardingCompleted: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error: any) {
    console.error("Error fetching dashboard:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener datos del dashboard" },
      { status: 500 }
    )
  }
}
