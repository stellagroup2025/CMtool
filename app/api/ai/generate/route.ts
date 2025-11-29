import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { createLogger } from "@/lib/logger"
import { rateLimiters } from "@/lib/rateLimit"
import { GoogleGenerativeAI } from "@google/generative-ai"

const logger = createLogger("api:ai:generate")

const generateSchema = z.object({
  brandId: z.string(),
  platforms: z.array(z.string()).min(1),
  prompt: z.string().min(1).max(500),
  hashtags: z.array(z.string()).optional(),
})

// POST /api/ai/generate - Generate post content with AI
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Rate limit AI requests
    await rateLimiters.ai.consume(`ai:${session.user.id}`)

    const body = await request.json()
    const data = generateSchema.parse(body)

    // Check if AI features are enabled
    if (!env.ENABLE_AI_FEATURES) {
      return NextResponse.json(
        { error: "AI features are not enabled" },
        { status: 503 }
      )
    }

    // Check if any AI API key is configured
    const hasGemini = !!env.GOOGLE_GEMINI_API_KEY
    const hasOpenAI = !!env.OPENAI_API_KEY
    const hasAnthropic = !!env.ANTHROPIC_API_KEY

    if (!hasGemini && !hasOpenAI && !hasAnthropic) {
      logger.warn("No AI API key configured, returning placeholder")

      // Return deterministic placeholder
      return NextResponse.json({
        variants: data.platforms.map((platform) => ({
          platform,
          content: `${data.prompt}\n\nThis is a placeholder response. Configure an AI API key (Gemini, OpenAI, or Anthropic) to enable AI features.`,
          hashtags: data.hashtags || [],
        })),
      })
    }

    logger.info({ platforms: data.platforms }, "Generating AI content with Gemini")

    // Use Gemini API to generate content
    if (hasGemini) {
      const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      const variants = await Promise.all(
        data.platforms.map(async (platform) => {
          const platformPrompt = `Create a social media post for ${platform} with the following description: ${data.prompt}

Requirements:
- Write engaging, authentic content optimized for ${platform}
- Use an appropriate tone for ${platform}
- Keep it concise and impactful
- DO NOT include hashtags in the main content (they will be added separately)
- Return only the post content, no explanations or metadata

Post content:`

          const result = await model.generateContent(platformPrompt)
          const response = await result.response
          const content = response.text().trim()

          return {
            platform,
            content,
            hashtags: data.hashtags || [],
          }
        })
      )

      return NextResponse.json({ variants })
    }

    // Fallback for other AI providers (placeholder for now)
    const variants = data.platforms.map((platform) => ({
      platform,
      content: `${data.prompt}\n\n[AI-generated content for ${platform} would appear here]`,
      hashtags: data.hashtags || [],
    }))

    return NextResponse.json({ variants })
  } catch (error: any) {
    logger.error({ error }, "Failed to generate AI content")

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    if (error.name === "RateLimitError") {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    )
  }
}
