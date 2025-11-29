import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:personal:products:productId")

// GET - Get a single product
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await requireAuth()
    const productId = params.productId

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

    // Get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        brandId: personalBrand.id,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error: any) {
    logger.error({ error }, "Error fetching product")
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// PUT - Update a product
export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await requireAuth()
    const productId = params.productId
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
      isActive,
    } = body

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

    // Check if product exists and belongs to this brand
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        brandId: personalBrand.id,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update product
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(currency !== undefined && { currency }),
        ...(features && { features }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(productUrl !== undefined && { productUrl }),
        ...(tags && { tags }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    logger.info({ productId: product.id, name: product.name }, "Product updated")

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error: any) {
    logger.error({ error }, "Error updating product")
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await requireAuth()
    const productId = params.productId

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

    // Check if product exists and belongs to this brand
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        brandId: personalBrand.id,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    })

    logger.info({ productId }, "Product deleted")

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error: any) {
    logger.error({ error }, "Error deleting product")
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    )
  }
}
