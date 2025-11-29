import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { createLogger } from "@/lib/logger"
import prisma from "@/lib/prisma"

const logger = createLogger("api:personal:upload-logo")

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()

    const formData = await req.formData()
    const file = formData.get("logo") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    logger.info({ fileName: file.name, fileSize: file.size }, "Uploading logo")

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get personal brand ID
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

    const brandId = personalBrand?.id || "personal"
    const filename = `logo-${Date.now()}`

    // Upload to Cloudinary
    const result: any = await uploadToCloudinary(buffer, brandId, filename)

    const logoUrl = result.secure_url

    logger.info({ logoUrl }, "Logo uploaded to Cloudinary")

    // Update user logoUrl
    await prisma.user.update({
      where: { id: session.user.id },
      data: { logoUrl },
    })

    // Also update personal brand logo if exists
    if (personalBrand) {
      await prisma.brand.update({
        where: { id: personalBrand.id },
        data: { logo: logoUrl },
      })
      logger.info({ brandId: personalBrand.id }, "Personal brand logo updated")
    }

    logger.info({ userId: session.user.id, logoUrl }, "Logo uploaded successfully")

    return NextResponse.json({ logoUrl })
  } catch (error: any) {
    logger.error({ error }, "Failed to upload logo")
    return NextResponse.json(
      { error: error.message || "Failed to upload logo" },
      { status: 500 }
    )
  }
}

// GET - Retrieve current logo
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()

    // Get user logo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { logoUrl: true },
    })

    // Also check personal brand logo as fallback
    const personalBrand = await prisma.brand.findFirst({
      where: {
        isPersonal: true,
        memberships: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: { logo: true },
    })

    // Return user logo, or brand logo as fallback
    const logoUrl = user?.logoUrl || personalBrand?.logo || null

    return NextResponse.json({ logoUrl })
  } catch (error: any) {
    logger.error({ error }, "Failed to get logo")
    return NextResponse.json(
      { error: error.message || "Failed to get logo" },
      { status: 500 }
    )
  }
}

// DELETE - Remove logo
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth()

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { logoUrl: null },
    })

    // Also update personal brand if exists
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

    if (personalBrand) {
      await prisma.brand.update({
        where: { id: personalBrand.id },
        data: { logo: null },
      })
    }

    logger.info({ userId: session.user.id }, "Logo removed")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error({ error }, "Failed to delete logo")
    return NextResponse.json(
      { error: error.message || "Failed to delete logo" },
      { status: 500 }
    )
  }
}
