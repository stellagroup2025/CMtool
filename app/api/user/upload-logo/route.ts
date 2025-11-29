import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { uploadToS3 } from "@/lib/s3"

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await requireAuth()

    // Parse multipart form data
    const formData = await req.formData()
    const logo = formData.get("logo") as File

    if (!logo) {
      return NextResponse.json(
        { error: "No se proporcionó ningún logo" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!logo.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (logo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen debe ser menor a 5MB" },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await logo.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const logoUrl = await uploadToS3(
      buffer,
      `logos/${session.user.id}/${Date.now()}-${logo.name}`,
      logo.type
    )

    return NextResponse.json({ logoUrl })

  } catch (error: any) {
    console.error("Error uploading logo:", error)
    return NextResponse.json(
      { error: error.message || "Error al subir el logo" },
      { status: 500 }
    )
  }
}
