import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { createLogger } from "@/lib/logger"

const logger = createLogger("upload-api")

/**
 * POST /api/upload
 * Sube archivos locales y devuelve una URL pública
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/3gpp",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Validar tamaño (100MB max)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit" },
        { status: 400 }
      )
    }

    // Crear directorio de uploads si no existe
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "instagram")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `${timestamp}-${randomString}${extension}`

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    // Construir URL pública
    const protocol = req.headers.get("x-forwarded-proto") || "http"
    const host = req.headers.get("host")
    const publicUrl = `${protocol}://${host}/uploads/instagram/${filename}`

    logger.info(
      {
        filename,
        size: file.size,
        type: file.type,
        publicUrl,
      },
      "File uploaded successfully"
    )

    return NextResponse.json({
      success: true,
      filename,
      url: publicUrl,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    logger.error({ error }, "Error uploading file")
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
