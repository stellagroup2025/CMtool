import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:personal:templates:render")

// POST /api/personal/templates/render
// This endpoint will be called from the client-side where html-to-image will do the actual rendering
// This is just to validate the template exists and return the populated HTML
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { templateId, variables } = body

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Get user's templates
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { templates: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const templates = (user.templates as any[]) || []
    const template = templates.find((t) => t.id === templateId)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Define default values for all common template variables
    const defaultVariables: Record<string, string> = {
      TITLE: "",
      CONTENT: "",
      CTA: "",
      LABEL: "",
      TAG1: "",
      TAG2: "",
      TAG3: "",
      CATEGORY: "",
      BIG_NUMBER: "",
      BIG_LABEL: "",
      POINT1: "",
      POINT2: "",
      POINT3: "",
      DATE: "",
      METRIC1: "",
      LABEL1: "",
      METRIC2: "",
      LABEL2: "",
      METRIC3: "",
      LABEL3: "",
    }

    // Merge provided variables with defaults
    const allVariables = { ...defaultVariables, ...variables }

    // Replace ALL variables in HTML
    let populatedHtml = template.html

    Object.keys(allVariables).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g")
      populatedHtml = populatedHtml.replace(regex, allVariables[key] || "")
    })

    // Additional cleanup: remove any remaining unreplaced variables (safety net)
    populatedHtml = populatedHtml.replace(/\{\{[A-Z_0-9]+\}\}/g, "")

    logger.info({ templateId, variablesReplaced: Object.keys(allVariables).length }, "Template rendered")

    return NextResponse.json({
      html: populatedHtml,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
      },
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to render template")
    return NextResponse.json(
      { error: error.message || "Failed to render template" },
      { status: 500 }
    )
  }
}
