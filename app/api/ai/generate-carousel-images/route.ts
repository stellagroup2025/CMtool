import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { createLogger } from "@/lib/logger"
import { createCanvas, loadImage } from "canvas"
import { uploadToCloudinary } from "@/lib/cloudinary"
import prisma from "@/lib/prisma"

const logger = createLogger("api:ai:generate-carousel-images")

// Helper to upload image buffer to Cloudinary
async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    logger.info({ fileName, bufferSize: imageBuffer.length }, "Starting Cloudinary upload")

    const result: any = await uploadToCloudinary(
      imageBuffer,
      "generated-carousel-slides",
      fileName
    )

    if (!result || !result.secure_url) {
      logger.error({ result }, "Cloudinary returned invalid result")
      throw new Error("Cloudinary upload returned no URL")
    }

    const publicUrl = result.secure_url

    logger.info({ fileName, publicUrl, size: imageBuffer.length }, "Successfully uploaded image to Cloudinary")

    return publicUrl
  } catch (error: any) {
    logger.error({ error, message: error.message, stack: error.stack }, "Failed to upload image to Cloudinary")
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

interface GenerateCarouselImagesRequest {
  slides: Array<{
    slideNumber: number
    title?: string
    content: string
    imagePrompt?: string
  }>
  companyInfo?: {
    name: string
    industry: string
  }
  imageSource: "unsplash" | "unsplash-designed" | "logo" | "gradient" | "ai" | "template"
  imageStyle?: string
  logoBase64?: string
}

// Helper to fetch Unsplash image
async function fetchUnsplashImage(query: string): Promise<string | null> {
  try {
    const UNSPLASH_ACCESS_KEY = env.UNSPLASH_ACCESS_KEY || ""
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=squarish&client_id=${UNSPLASH_ACCESS_KEY}`
    )

    if (!response.ok) {
      logger.error({ status: response.status }, "Unsplash API error")
      return null
    }

    const data = await response.json()
    return data.urls?.regular || null
  } catch (error: any) {
    logger.error({ error }, "Failed to fetch Unsplash image")
    return null
  }
}

// Helper to create gradient background image (fallback when Unsplash fails)
async function createGradientSlideImage(
  slideContent: string,
  slideTitle: string | undefined,
  companyName: string,
  logoUrl?: string | null
): Promise<string | null> {
  try {
    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext("2d")

    // Create gradient background (similar to UI preview)
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
    gradient.addColorStop(0, "#8b5cf6") // primary color
    gradient.addColorStop(0.5, "#6366f1") // accent color
    gradient.addColorStop(1, "#4f46e5") // darker accent
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Add subtle pattern overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
    for (let i = 0; i < 1080; i += 60) {
      ctx.fillRect(i, 0, 30, 1080)
      ctx.fillRect(0, i, 1080, 30)
    }

    // Helper to wrap text
    function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      const words = text.split(" ")
      const lines: string[] = []
      let currentLine = words[0] || ""

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(currentLine + " " + word).width
        if (width < maxWidth) {
          currentLine += " " + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)
      return lines
    }

    // Calculate vertical position
    let yPosition = 540 // Center

    // Draw title if exists
    if (slideTitle) {
      const titleLines = wrapText(slideTitle, 900, 56)
      ctx.font = "bold 56px Arial, sans-serif"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      const titleHeight = titleLines.length * 70
      yPosition = 540 - titleHeight / 2 - 40

      titleLines.forEach((line, index) => {
        ctx.fillText(line, 540, yPosition + index * 70)
      })

      yPosition += titleHeight + 30
    }

    // Draw content
    const contentLines = wrapText(slideContent, 900, 36)
    ctx.font = "600 36px Arial, sans-serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 8

    if (!slideTitle) {
      yPosition = 540 - (contentLines.length * 48) / 2
    }

    contentLines.forEach((line, index) => {
      ctx.fillText(line, 540, yPosition + index * 48)
    })

    // Draw brand name with semi-transparent background at bottom-left
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    ctx.font = "bold 32px Arial, sans-serif"
    const brandTextWidth = ctx.measureText(companyName).width
    const brandPadding = 20
    const brandBoxWidth = brandTextWidth + brandPadding * 2
    const brandBoxHeight = 60
    const brandBoxX = 30
    const brandBoxY = 1080 - brandBoxHeight - 30

    // Draw semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.fillRect(brandBoxX, brandBoxY, brandBoxWidth, brandBoxHeight)

    // Draw brand name text
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText(companyName, brandBoxX + brandPadding, brandBoxY + brandBoxHeight / 2)

    // Draw logo in bottom-right corner if provided
    if (logoUrl) {
      try {
        const logoResponse = await fetch(logoUrl)
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer()
          const logoImage = await loadImage(Buffer.from(logoBuffer))

          // Calculate logo dimensions (maintain aspect ratio, max 100px)
          const maxLogoSize = 100
          const logoAspect = logoImage.width / logoImage.height
          let logoWidth = maxLogoSize
          let logoHeight = maxLogoSize / logoAspect

          if (logoHeight > maxLogoSize) {
            logoHeight = maxLogoSize
            logoWidth = maxLogoSize * logoAspect
          }

          // Position in bottom-right corner with padding
          const logoPadding = 40
          const logoX = 1080 - logoWidth - logoPadding
          const logoY = 1080 - logoHeight - logoPadding

          // Add subtle shadow for better visibility
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
          ctx.shadowBlur = 8
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2

          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)

          // Reset shadow
          ctx.shadowColor = "transparent"
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
      } catch (logoError) {
        logger.warn({ logoUrl, error: logoError }, "Failed to load logo, skipping")
      }
    }

    // Upload to Cloudinary
    const imageBuffer = canvas.toBuffer("image/png")
    const fileName = `${companyName.toLowerCase().replace(/\s+/g, "-")}-gradient-${Date.now()}`

    logger.info({ bufferSize: imageBuffer.length, fileName }, "Uploading gradient image to Cloudinary")
    const uploadedUrl = await uploadImageToCloudinary(imageBuffer, fileName)
    logger.info({ uploadedUrl: !!uploadedUrl }, "Cloudinary upload result")

    return uploadedUrl
  } catch (error: any) {
    logger.error({ error, stack: error.stack }, "Failed to create gradient slide image")
    return null
  }
}

// Helper to design over Unsplash image
async function designSlideImage(
  slideContent: string,
  slideTitle: string | undefined,
  companyName: string,
  unsplashQuery: string,
  logoUrl?: string | null
): Promise<string | null> {
  try {
    // Fetch Unsplash image
    const unsplashUrl = await fetchUnsplashImage(unsplashQuery)
    if (!unsplashUrl) {
      logger.warn("Could not fetch Unsplash image, using gradient fallback")
      // Use gradient background instead
      return await createGradientSlideImage(slideContent, slideTitle, companyName, logoUrl)
    }

    // Create canvas
    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext("2d")

    // Download and load the Unsplash image
    const response = await fetch(unsplashUrl)
    if (!response.ok) {
      logger.warn("Failed to download Unsplash image, using gradient fallback")
      return await createGradientSlideImage(slideContent, slideTitle, companyName, logoUrl)
    }

    const buffer = await response.arrayBuffer()
    const image = await loadImage(Buffer.from(buffer))

    // Calculate dimensions to cover canvas
    const imgAspect = image.width / image.height
    const canvasAspect = 1
    let drawWidth, drawHeight, offsetX, offsetY

    if (imgAspect > canvasAspect) {
      drawHeight = 1080
      drawWidth = drawHeight * imgAspect
      offsetX = (1080 - drawWidth) / 2
      offsetY = 0
    } else {
      drawWidth = 1080
      drawHeight = drawWidth / imgAspect
      offsetX = 0
      offsetY = (1080 - drawHeight) / 2
    }

    // Draw background image
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)

    // Apply darkening filter
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)"
    ctx.fillRect(0, 0, 1080, 1080)

    // Add gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.2)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Helper to wrap text
    function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      const words = text.split(" ")
      const lines: string[] = []
      let currentLine = words[0] || ""

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(currentLine + " " + word).width
        if (width < maxWidth) {
          currentLine += " " + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)
      return lines
    }

    // Calculate vertical position
    let yPosition = 540 // Center

    // Draw title if exists
    if (slideTitle) {
      const titleLines = wrapText(slideTitle, 900, 56)
      ctx.font = "bold 56px Arial, sans-serif"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      const titleHeight = titleLines.length * 70
      yPosition = 540 - titleHeight / 2 - 40

      titleLines.forEach((line, index) => {
        ctx.fillText(line, 540, yPosition + index * 70)
      })

      yPosition += titleHeight + 30
    }

    // Draw content
    const contentLines = wrapText(slideContent, 900, 36)
    ctx.font = "600 36px Arial, sans-serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
    ctx.shadowBlur = 8

    if (!slideTitle) {
      yPosition = 540 - (contentLines.length * 48) / 2
    }

    contentLines.forEach((line, index) => {
      ctx.fillText(line, 540, yPosition + index * 48)
    })

    // Draw brand name with semi-transparent background at bottom-left
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    ctx.font = "bold 32px Arial, sans-serif"
    const brandTextWidth = ctx.measureText(companyName).width
    const brandPadding = 20
    const brandBoxWidth = brandTextWidth + brandPadding * 2
    const brandBoxHeight = 60
    const brandBoxX = 30
    const brandBoxY = 1080 - brandBoxHeight - 30

    // Draw semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.fillRect(brandBoxX, brandBoxY, brandBoxWidth, brandBoxHeight)

    // Draw brand name text
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText(companyName, brandBoxX + brandPadding, brandBoxY + brandBoxHeight / 2)

    // Draw logo in bottom-right corner if provided
    if (logoUrl) {
      try {
        const logoResponse = await fetch(logoUrl)
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer()
          const logoImage = await loadImage(Buffer.from(logoBuffer))

          // Calculate logo dimensions (maintain aspect ratio, max 100px)
          const maxLogoSize = 100
          const logoAspect = logoImage.width / logoImage.height
          let logoWidth = maxLogoSize
          let logoHeight = maxLogoSize / logoAspect

          if (logoHeight > maxLogoSize) {
            logoHeight = maxLogoSize
            logoWidth = maxLogoSize * logoAspect
          }

          // Position in bottom-right corner with padding
          const logoPadding = 40
          const logoX = 1080 - logoWidth - logoPadding
          const logoY = 1080 - logoHeight - logoPadding

          // Add subtle shadow for better visibility
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
          ctx.shadowBlur = 8
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2

          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)

          // Reset shadow
          ctx.shadowColor = "transparent"
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
      } catch (logoError) {
        logger.warn({ logoUrl, error: logoError }, "Failed to load logo, skipping")
      }
    }

    // Upload to Cloudinary
    const imageBuffer = canvas.toBuffer("image/png")
    const fileName = `${companyName.toLowerCase().replace(/\s+/g, "-")}-designed-${Date.now()}`

    logger.info({ bufferSize: imageBuffer.length, fileName }, "Uploading designed image to Cloudinary")
    const uploadedUrl = await uploadImageToCloudinary(imageBuffer, fileName)
    logger.info({ uploadedUrl: !!uploadedUrl }, "Cloudinary upload result for designed slide")

    return uploadedUrl
  } catch (error: any) {
    logger.error({ error, stack: error.stack }, "Failed to design slide image")
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body: GenerateCarouselImagesRequest = await req.json()

    const { slides, companyInfo, imageSource, logoBase64 } = body

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: "No slides provided" }, { status: 400 })
    }

    const companyName = companyInfo?.name || "Your Brand"
    const industry = companyInfo?.industry || "business"

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

    const logoUrl = user?.logoUrl || personalBrand?.logo || null

    logger.info({ slideCount: slides.length, imageSource, hasLogo: !!logoUrl }, "Generating carousel images")

    const generatedImages: Array<{ slideNumber: number; imageUrl: string | null }> = []

    for (const slide of slides) {
      try {
        let imageUrl: string | null = null

        logger.info({ slideNumber: slide.slideNumber, imageSource }, "Processing slide")

        if (imageSource === "unsplash" || imageSource === "unsplash-designed") {
          // Use image prompt or fallback to industry
          const query = slide.imagePrompt || industry
          logger.info({ query, slideNumber: slide.slideNumber }, "Generating designed slide with query")
          imageUrl = await designSlideImage(
            slide.content,
            slide.title,
            companyName,
            query,
            logoUrl
          )
          logger.info({ slideNumber: slide.slideNumber, generatedUrl: !!imageUrl }, "Slide image result")

          // If designSlideImage failed, try gradient fallback
          if (!imageUrl) {
            logger.warn({ slideNumber: slide.slideNumber }, "designSlideImage failed, using gradient fallback")
            imageUrl = await createGradientSlideImage(
              slide.content,
              slide.title,
              companyName,
              logoUrl
            )
          }
        } else if (imageSource === "gradient") {
          logger.info({ slideNumber: slide.slideNumber }, "Generating gradient slide")
          imageUrl = await createGradientSlideImage(
            slide.content,
            slide.title,
            companyName,
            logoUrl
          )
        } else if (imageSource === "logo" && logoBase64) {
          // TODO: Implement logo-based design
          logger.warn("Logo-based images not yet implemented for carousels")
          // Fallback to gradient
          imageUrl = await createGradientSlideImage(
            slide.content,
            slide.title,
            companyName,
            logoUrl
          )
        } else {
          logger.warn({ imageSource, slideNumber: slide.slideNumber }, "Unsupported image source, using gradient")
          // Fallback to gradient for any unsupported source
          imageUrl = await createGradientSlideImage(
            slide.content,
            slide.title,
            companyName,
            logoUrl
          )
        }

        generatedImages.push({
          slideNumber: slide.slideNumber,
          imageUrl,
        })

        logger.info({ slideNumber: slide.slideNumber, hasImage: !!imageUrl }, "Slide image generated")
      } catch (error: any) {
        logger.error({ error, slideNumber: slide.slideNumber }, "Failed to generate slide image, trying final fallback")

        // Final fallback: try to generate a simple gradient
        try {
          const fallbackUrl = await createGradientSlideImage(
            slide.content,
            slide.title,
            companyName,
            logoUrl
          )
          generatedImages.push({
            slideNumber: slide.slideNumber,
            imageUrl: fallbackUrl,
          })
        } catch (fallbackError: any) {
          logger.error({ error: fallbackError, slideNumber: slide.slideNumber }, "Even fallback failed")
          generatedImages.push({
            slideNumber: slide.slideNumber,
            imageUrl: null,
          })
        }
      }
    }

    const successCount = generatedImages.filter((img) => img.imageUrl !== null).length

    // Extract imageUrls in order for easier consumption
    const imageUrls = generatedImages.map((img) => img.imageUrl).filter((url): url is string => url !== null)

    return NextResponse.json({
      success: true,
      images: generatedImages,
      imageUrls, // Add this for backwards compatibility
      summary: {
        total: slides.length,
        generated: successCount,
        failed: slides.length - successCount,
      },
    })
  } catch (error: any) {
    logger.error({ error }, "Error generating carousel images")
    return NextResponse.json(
      { error: error.message || "Failed to generate images" },
      { status: 500 }
    )
  }
}
