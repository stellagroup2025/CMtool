import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api:personal:generate-content")

// POST /api/personal/generate-content
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { contentType, userInput, platforms, regenerate } = body

    if (!userInput?.trim()) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      )
    }

    // Check if AI features are enabled
    if (!env.ENABLE_AI_FEATURES) {
      return NextResponse.json(
        { error: "AI features are not enabled" },
        { status: 503 }
      )
    }

    // Check if Gemini API key is configured
    if (!env.GOOGLE_GEMINI_API_KEY) {
      logger.warn("Gemini API key not configured, returning placeholder")

      // Return placeholder content
      const content: Record<string, string> = {}
      platforms.forEach((platform: string) => {
        content[platform] = `${userInput}\n\nThis is placeholder content. Configure GOOGLE_GEMINI_API_KEY to enable AI features.`
      })

      return NextResponse.json({ content })
    }

    logger.info({ platforms, contentType }, "Generating personal content with Gemini")

    // Use Gemini API to generate content
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const content: Record<string, string> = {}

    // Generate content for each platform
    for (const platform of platforms) {
      const platformPrompt = `You are a social media content expert creating a ${contentType} post for ${platform}.

User's idea: ${userInput}

Create engaging, authentic content optimized for ${platform} that:
- Captures attention in the first line
- Uses an appropriate tone and style for ${platform}
- Is concise and impactful
- Includes line breaks for readability
- DOES NOT include hashtags (they will be added separately)
- Feels personal and genuine

Important: Return ONLY the post content, no explanations, metadata, or labels.

Post content:`

      const result = await model.generateContent(platformPrompt)
      const response = await result.response
      content[platform] = response.text().trim()
    }

    return NextResponse.json({ content })
  } catch (error: any) {
    logger.error({ error }, "Failed to generate personal content")

    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    )
  }
}
