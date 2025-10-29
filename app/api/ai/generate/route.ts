import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { createLogger } from "@/lib/logger"
import { rateLimiters } from "@/lib/rateLimit"

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

    // Check if OpenAI key is configured
    if (!env.OPENAI_API_KEY) {
      logger.warn("OpenAI API key not configured, returning placeholder")

      // Return deterministic placeholder
      return NextResponse.json({
        variants: data.platforms.map((platform) => ({
          platform,
          content: `${data.prompt}\n\nThis is a placeholder response. Configure OPENAI_API_KEY to enable AI features.`,
          hashtags: data.hashtags || [],
        })),
      })
    }

    // TODO: Call OpenAI API to generate content
    // For now, return a simple response
    logger.info({ platforms: data.platforms }, "Generating AI content")

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
