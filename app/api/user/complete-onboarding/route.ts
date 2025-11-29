import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await requireAuth()

    const body = await req.json()
    const {
      companyName,
      industry,
      industryOther,
      companyDescription,
      targetAudience,
      brandPersonality,
      objective,
      brandColors,
      logoUrl,
      templates,
    } = body

    // Validate required fields
    if (!companyName || !industry || !companyDescription || !targetAudience ||
        !brandPersonality || brandPersonality.length === 0 || !objective) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Update user with onboarding data
    await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        name: companyName,
        industry: industry,
        industryOther: industryOther || null,
        companyDescription: companyDescription,
        targetAudience: targetAudience,
        brandPersonality: brandPersonality,
        objective: objective,
        brandColors: brandColors,
        logoUrl: logoUrl || null,
        templates: templates || null,
        onboardingCompleted: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Onboarding completado exitosamente"
    })

  } catch (error: any) {
    console.error("Error completing onboarding:", error)
    return NextResponse.json(
      { error: error.message || "Error al completar el onboarding" },
      { status: 500 }
    )
  }
}
