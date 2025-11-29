import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"
import { randomUUID } from "crypto"

const logger = createLogger("api:personal:templates")

interface Template {
  id: string
  name: string
  category: "quote" | "tip" | "announcement" | "product" | "custom"
  html: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

// POST /api/personal/templates - Create a custom template
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { name, category, html, variables } = body

    if (!name || !category || !html) {
      return NextResponse.json(
        { error: "Name, category, and html are required" },
        { status: 400 }
      )
    }

    // Get current templates
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { templates: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentTemplates = (user.templates as any[]) || []

    if (currentTemplates.length >= 20) {
      return NextResponse.json(
        { error: "Maximum 20 templates allowed. Delete some templates to create new ones." },
        { status: 400 }
      )
    }

    // Create new template
    const newTemplate: Template = {
      id: randomUUID(),
      name,
      category,
      html,
      variables: variables || ["TITLE", "CONTENT"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to templates array
    const updatedTemplates = [...currentTemplates, newTemplate]

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { templates: updatedTemplates as any },
    })

    logger.info({ templateId: newTemplate.id }, "Template created")

    return NextResponse.json({ template: newTemplate })
  } catch (error: any) {
    logger.error({ error }, "Failed to create template")
    return NextResponse.json(
      { error: error.message || "Failed to create template" },
      { status: 500 }
    )
  }
}

// PUT /api/personal/templates - Update a template
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { id, name, category, html, variables } = body

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Get current templates
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { templates: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentTemplates = (user.templates as any[]) || []
    const templateIndex = currentTemplates.findIndex((t) => t.id === id)

    if (templateIndex === -1) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Update template
    const updatedTemplate = {
      ...currentTemplates[templateIndex],
      ...(name && { name }),
      ...(category && { category }),
      ...(html && { html }),
      ...(variables && { variables }),
      updatedAt: new Date().toISOString(),
    }

    currentTemplates[templateIndex] = updatedTemplate

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { templates: currentTemplates as any },
    })

    logger.info({ templateId: id }, "Template updated")

    return NextResponse.json({ template: updatedTemplate })
  } catch (error: any) {
    logger.error({ error }, "Failed to update template")
    return NextResponse.json(
      { error: error.message || "Failed to update template" },
      { status: 500 }
    )
  }
}

// DELETE /api/personal/templates - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Get current templates
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { templates: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentTemplates = (user.templates as any[]) || []
    const filteredTemplates = currentTemplates.filter((t) => t.id !== id)

    if (filteredTemplates.length === currentTemplates.length) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { templates: filteredTemplates as any },
    })

    logger.info({ templateId: id }, "Template deleted")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error({ error }, "Failed to delete template")
    return NextResponse.json(
      { error: error.message || "Failed to delete template" },
      { status: 500 }
    )
  }
}
