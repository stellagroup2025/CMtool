import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getUserBrands } from "@/lib/rbac"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:brands")

const createBrandSchema = z.object({
  name: z.string().min(1).max(100),
  logo: z.string().url().optional(),
  timezone: z.string().default("Europe/Madrid"),
})

// GET /api/brands - List brands user is a member of
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const brands = await getUserBrands(session.user.id)

    return NextResponse.json({ brands })
  } catch (error: any) {
    logger.error({ error }, "Failed to list brands")
    return NextResponse.json(
      { error: error.message || "Failed to list brands" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}

// POST /api/brands - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const data = createBrandSchema.parse(body)

    // Create slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Create brand and membership in a transaction
    const brand = await prisma.$transaction(async (tx) => {
      const newBrand = await tx.brand.create({
        data: {
          name: data.name,
          slug,
          logo: data.logo,
          timezone: data.timezone,
        },
      })

      // Create OWNER membership for creator
      await tx.membership.create({
        data: {
          userId: session.user.id,
          brandId: newBrand.id,
          role: "OWNER",
        },
      })

      return newBrand
    })

    logger.info({ brandId: brand.id, userId: session.user.id }, "Created brand")

    return NextResponse.json({ brand }, { status: 201 })
  } catch (error: any) {
    logger.error({ error }, "Failed to create brand")

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to create brand" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
