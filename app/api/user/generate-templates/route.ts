import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { uploadToS3 } from "@/lib/s3"
// @ts-ignore
import { createCanvas, loadImage, registerFont } from "canvas"

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await requireAuth()

    const body = await req.json()
    const { companyName, industry, brandPersonality, brandColors, logoUrl } = body

    if (!companyName || !brandColors || brandColors.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    const templates = []

    // Generate 3 unique templates
    for (let i = 0; i < 3; i++) {
      const canvas = createCanvas(1080, 1080)
      const ctx = canvas.getContext("2d")

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)

      if (i === 0) {
        // Template 1: Diagonal gradient
        gradient.addColorStop(0, brandColors[0])
        gradient.addColorStop(1, brandColors[brandColors.length - 1])
      } else if (i === 1) {
        // Template 2: Radial gradient from center
        const radialGradient = ctx.createRadialGradient(540, 540, 100, 540, 540, 700)
        radialGradient.addColorStop(0, brandColors[0])
        radialGradient.addColorStop(1, brandColors[brandColors.length - 1])
        ctx.fillStyle = radialGradient
        ctx.fillRect(0, 0, 1080, 1080)
      } else {
        // Template 3: Solid color with overlay pattern
        ctx.fillStyle = brandColors[0]
        ctx.fillRect(0, 0, 1080, 1080)

        // Add semi-transparent circles as pattern
        ctx.globalAlpha = 0.1
        ctx.fillStyle = brandColors[brandColors.length - 1]
        for (let j = 0; j < 5; j++) {
          const x = Math.random() * 1080
          const y = Math.random() * 1080
          const radius = 100 + Math.random() * 200
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1.0
      }

      if (i < 2) {
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 1080, 1080)
      }

      // Add logo if provided
      if (logoUrl) {
        try {
          const logo = await loadImage(logoUrl)
          const logoSize = 200
          const logoX = 1080 - logoSize - 50
          const logoY = 50

          // Add white background circle for logo
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
          ctx.beginPath()
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 20, 0, Math.PI * 2)
          ctx.fill()

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
        } catch (error) {
          console.error("Error loading logo:", error)
        }
      }

      // Add subtle texture overlay
      ctx.globalAlpha = 0.05
      ctx.fillStyle = "#000000"
      for (let y = 0; y < 1080; y += 4) {
        for (let x = 0; x < 1080; x += 4) {
          if (Math.random() > 0.5) {
            ctx.fillRect(x, y, 2, 2)
          }
        }
      }
      ctx.globalAlpha = 1.0

      // Convert canvas to buffer
      const buffer = canvas.toBuffer("image/png")

      // Upload to S3
      const templateUrl = await uploadToS3(
        buffer,
        `templates/${session.user.id}/${Date.now()}-template-${i + 1}.png`,
        "image/png"
      )

      templates.push({
        url: templateUrl,
        name: `Template ${i + 1}`,
        type: i === 0 ? "gradient" : i === 1 ? "radial" : "pattern"
      })
    }

    return NextResponse.json({ templates })

  } catch (error: any) {
    console.error("Error generating templates:", error)
    return NextResponse.json(
      { error: error.message || "Error al generar plantillas" },
      { status: 500 }
    )
  }
}
