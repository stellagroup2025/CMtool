import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createLogger } from "@/lib/logger"
import { v2 as cloudinary } from "cloudinary"

const logger = createLogger("api:ai:generate-complete-post")

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

interface GenerateCompletePostRequest {
  prompt: string
  platform: string
  includeImage: boolean
  imageStyle?: string
  controversyLevel?: number // 1-10
  tone?: "professional" | "casual" | "provocative" | "inspirational"
}

// POST /api/ai/generate-complete-post
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body: GenerateCompletePostRequest = await request.json()

    const {
      prompt,
      platform = "INSTAGRAM",
      includeImage = true,
      imageStyle = "modern and professional",
      controversyLevel = 5,
      tone = "professional",
    } = body

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
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
      logger.warn("Gemini API key not configured")
      return NextResponse.json(
        { error: "AI is not configured" },
        { status: 503 }
      )
    }

    logger.info({ platform, includeImage, controversyLevel, tone }, "Generating complete post")

    const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY)

    // STEP 1: Generate text content (copy + hashtags)
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const toneInstructions = {
      professional: "Use professional, credible language. Focus on expertise and value.",
      casual: "Use friendly, conversational language. Be approachable and relatable.",
      provocative: "Use bold, attention-grabbing language. Challenge conventional thinking.",
      inspirational: "Use motivational, uplifting language. Inspire and empower the audience.",
    }

    const controversyInstructions =
      controversyLevel <= 3
        ? "Keep the content safe, non-controversial, and universally agreeable."
        : controversyLevel <= 6
        ? "Include some thought-provoking perspectives but remain balanced."
        : "Take a strong stance. Don't be afraid to challenge common beliefs and spark debate."

    const textPrompt = `You are a social media content expert for ${platform}.

Topic: ${prompt}

Tone: ${toneInstructions[tone]}
Controversy Level (1-10): ${controversyLevel}/10
${controversyInstructions}

Generate a compelling post with:
1. An attention-grabbing hook (first line)
2. Valuable content that provides insight or value
3. A clear call-to-action or thought-provoking ending
4. Appropriate formatting with line breaks for ${platform}
5. 5-8 relevant hashtags

Return ONLY the post content (without the hashtags) and the hashtags as a separate list.

Format:
POST:
[Your post content here]

HASHTAGS:
#hashtag1 #hashtag2 #hashtag3...`

    const textResult = await textModel.generateContent(textPrompt)
    const textResponse = textResult.response.text()

    // Parse response
    const postMatch = textResponse.match(/POST:\s*([\s\S]*?)(?=HASHTAGS:|$)/i)
    const hashtagsMatch = textResponse.match(/HASHTAGS:\s*([\s\S]*)/i)

    const content = postMatch ? postMatch[1].trim() : textResponse.trim()
    const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : ""
    const hashtags = hashtagsText
      .split(/\s+/)
      .filter((h) => h.startsWith("#"))
      .map((h) => h.replace("#", ""))

    let imageUrl = null

    // STEP 2: Generate image if requested
    if (includeImage) {
      try {
        // Use Gemini 2.0 Flash for image generation
        const imageModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp",
        })

        const imagePrompt = `Create a professional, eye-catching image for ${platform} (square 1:1 aspect ratio) for this post:

"${content.substring(0, 200)}..."

Style: ${imageStyle}
Platform: ${platform}

The image should:
- Be visually striking and scroll-stopping
- Match the tone: ${tone}
- Work well as social media content
- Include relevant visual elements (but NO text overlay unless specifically needed for stats/quotes)
- Use modern design principles
- Be optimized for ${platform}'s aesthetic

Create the image now.`

        const imageResult = await imageModel.generateContent({
          contents: imagePrompt,
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
          },
        })

        // Check if response contains image
        const candidates = imageResult.response.candidates
        if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const imageData = part.inlineData.data
              const buffer = Buffer.from(imageData, "base64")

              // Upload to Cloudinary
              if (env.CLOUDINARY_CLOUD_NAME) {
                const uploadResult = await new Promise<any>((resolve, reject) => {
                  cloudinary.uploader
                    .upload_stream(
                      {
                        folder: "ai-generated",
                        resource_type: "image",
                      },
                      (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                      }
                    )
                    .end(buffer)
                })

                imageUrl = uploadResult.secure_url
                logger.info({ imageUrl }, "Image uploaded to Cloudinary")
              } else {
                // Return base64 if Cloudinary is not configured
                imageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`
                logger.warn("Cloudinary not configured, returning base64 image")
              }

              break
            }
          }
        }

        if (!imageUrl) {
          logger.warn("No image generated in response")
        }
      } catch (imageError: any) {
        logger.error({ error: imageError }, "Failed to generate image")
        // Continue without image rather than failing completely
      }
    }

    return NextResponse.json({
      success: true,
      post: {
        content,
        hashtags,
        imageUrl,
        platform,
        metadata: {
          tone,
          controversyLevel,
          generatedAt: new Date().toISOString(),
        },
      },
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to generate complete post")

    return NextResponse.json(
      { error: error.message || "Failed to generate post" },
      { status: 500 }
    )
  }
}
