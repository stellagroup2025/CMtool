import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:personal:products")

// GET - List all products for the personal brand
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()

    // Get personal brand
    const personalBrand = await prisma.brand.findFirst({
      where: {
        isPersonal: true,
        memberships: {
          some: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!personalBrand) {
      return NextResponse.json({ error: "Personal brand not found" }, { status: 404 })
    }

    // Get all products
    const products = await prisma.product.findMany({
      where: {
        brandId: personalBrand.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error: any) {
    logger.error({ error }, "Error fetching products")
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST - Create a new product
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()

    const {
      name,
      description,
      shortDescription,
      category,
      price,
      currency,
      features,
      targetAudience,
      imageUrl,
      productUrl,
      tags,
    } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      )
    }

    // Get personal brand
    const personalBrand = await prisma.brand.findFirst({
      where: {
        isPersonal: true,
        memberships: {
          some: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!personalBrand) {
      return NextResponse.json({ error: "Personal brand not found" }, { status: 404 })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        brandId: personalBrand.id,
        name,
        description,
        shortDescription,
        category,
        price: price ? parseFloat(price) : null,
        currency,
        features: features || [],
        targetAudience,
        imageUrl,
        productUrl,
        tags: tags || [],
      },
    })

    logger.info({ productId: product.id, name: product.name }, "Product created")

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error: any) {
    logger.error({ error }, "Error creating product")
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    )
  }
}
