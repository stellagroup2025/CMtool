import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  templateLibrary,
  expandColorPalette,
  generateTemplateWithColors,
  type BaseTemplate,
} from "@/lib/template-library"
import { createLogger } from "@/lib/logger"
import { randomUUID } from "crypto"

const logger = createLogger("api:personal:templates:library")

// GET /api/personal/templates/library - Get all base templates with user's colors
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Get user's brand colors
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        brandColors: true,
      },
    })

    if (!user || !user.brandColors || user.brandColors.length < 2) {
      return NextResponse.json(
        { error: "Brand colors are required. Please complete onboarding first." },
        { status: 400 }
      )
    }

    const brandColors = user.brandColors as string[]
    const expandedColors = expandColorPalette(brandColors)

    // Return template metadata with color info
    const templatesMetadata = templateLibrary.map((template) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      style: template.style,
      description: template.description,
      aspectRatios: template.aspectRatios,
      variables: template.variables,
      previewColors: expandedColors,
    }))

    logger.info({ count: templatesMetadata.length }, "Fetched template library")

    return NextResponse.json({
      templates: templatesMetadata,
      colors: expandedColors,
      total: templatesMetadata.length,
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to fetch template library")
    return NextResponse.json(
      { error: error.message || "Failed to fetch template library" },
      { status: 500 }
    )
  }
}

// POST /api/personal/templates/library/add - Add a base template to user's collection
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { templateId, ratio = "1:1" } = body

    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        brandColors: true,
        templates: true,
      },
    })

    if (!user || !user.brandColors || user.brandColors.length < 2) {
      return NextResponse.json(
        { error: "Brand colors are required" },
        { status: 400 }
      )
    }

    const brandColors = user.brandColors as string[]

    // Generate HTML with user's colors
    const html = generateTemplateWithColors(templateId, brandColors, ratio as "1:1" | "4:5")

    if (!html) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Find the base template for metadata
    const baseTemplate = templateLibrary.find(t => t.id === templateId)
    if (!baseTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Create new user template
    const newTemplate = {
      id: randomUUID(),
      name: baseTemplate.name,
      category: baseTemplate.category,
      html,
      variables: baseTemplate.variables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Get existing templates and add new one
    const existingTemplates = (user.templates as any[]) || []
    const allTemplates = [...existingTemplates, newTemplate].slice(0, 20) // Limit to 20

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        templates: allTemplates as any,
      },
    })

    logger.info({ templateId, newTemplateId: newTemplate.id }, "Added base template to user collection")

    return NextResponse.json({
      template: newTemplate,
      total: allTemplates.length,
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to add template")
    return NextResponse.json(
      { error: error.message || "Failed to add template" },
      { status: 500 }
    )
  }
}
