import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createLogger } from "@/lib/logger"
import { v2 as cloudinary } from "cloudinary"
import OpenAI from "openai"
import { createCanvas, loadImage } from "canvas"
import prisma from "@/lib/prisma"

const logger = createLogger("api:ai:generate-batch-posts")

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

interface GenerateBatchPostsRequest {
  companyInfo: {
    name: string
    industry: string
    description: string
    targetAudience?: string
    brandVoice?: string
  }
  quantity: number // Number of posts to generate
  platform: string
  language?: string // Language code (es, en, fr, de, it, pt)
  includeImages: boolean
  imageSource?: "none" | "unsplash" | "unsplash-designed" | "ai" | "logo" // Image source type
  logoBase64?: string // Base64 encoded logo image
  imageStyle?: string
  controversyLevel?: number
  tone?: "professional" | "casual" | "provocative" | "inspirational"
  contentTypes?: string[] // Types of content to generate
}

const DEFAULT_CONTENT_TYPES = [
  "product/service announcement",
  "industry insight",
  "customer success story",
  "behind-the-scenes",
  "educational tip",
  "company culture",
  "trending topic commentary",
  "inspirational/motivational",
  "problem-solution",
  "stat/data visualization",
]

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish",
  en: "English",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
}

// Helper function to fetch image from Unsplash
async function fetchUnsplashImage(query: string): Promise<string | null> {
  try {
    const UNSPLASH_ACCESS_KEY = env.UNSPLASH_ACCESS_KEY || "your-default-access-key"
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

// Helper function to generate image with DALL-E
async function generateDalleImage(prompt: string): Promise<string | null> {
  try {
    if (!env.OPENAI_API_KEY) {
      logger.warn("OpenAI API key not configured")
      return null
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    })

    return response.data[0]?.url || null
  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to generate DALL-E image")
    return null
  }
}

// Helper function to generate image with logo background and text overlay
async function generateLogoImage(logoBase64: string, text: string, companyName: string): Promise<string | null> {
  try {
    // Create a 1080x1080 canvas (Instagram square format)
    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext("2d")

    // Load the logo image
    const logo = await loadImage(logoBase64)

    // Draw logo as background (slightly faded)
    ctx.globalAlpha = 0.15
    const logoAspect = logo.width / logo.height
    const canvasAspect = 1
    let drawWidth, drawHeight, offsetX, offsetY

    if (logoAspect > canvasAspect) {
      drawHeight = 1080
      drawWidth = drawHeight * logoAspect
      offsetX = (1080 - drawWidth) / 2
      offsetY = 0
    } else {
      drawWidth = 1080
      drawHeight = drawWidth / logoAspect
      offsetX = 0
      offsetY = (1080 - drawHeight) / 2
    }

    ctx.drawImage(logo, offsetX, offsetY, drawWidth, drawHeight)
    ctx.globalAlpha = 1

    // Add a subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)")
    gradient.addColorStop(1, "rgba(240, 240, 240, 0.9)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Draw logo at top (smaller, centered)
    const logoSize = 200
    const logoX = (1080 - logoSize) / 2
    const logoY = 100
    ctx.globalAlpha = 1
    if (logoAspect > 1) {
      const scaledHeight = logoSize / logoAspect
      ctx.drawImage(logo, logoX, logoY + (logoSize - scaledHeight) / 2, logoSize, scaledHeight)
    } else {
      const scaledWidth = logoSize * logoAspect
      ctx.drawImage(logo, logoX + (logoSize - scaledWidth) / 2, logoY, scaledWidth, logoSize)
    }

    // Prepare text
    const maxWidth = 900
    const lineHeight = 60
    let fontSize = 48

    // Word wrap function
    function wrapText(text: string, maxWidth: number): string[] {
      const words = text.split(" ")
      const lines: string[] = []
      let currentLine = words[0]

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

    // Draw text (centered, wrapped)
    ctx.fillStyle = "#1a1a1a"
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const lines = wrapText(text.substring(0, 200), maxWidth) // Limit to 200 chars
    const totalHeight = lines.length * lineHeight
    const startY = 1080 / 2 - totalHeight / 2 + 100

    lines.forEach((line, index) => {
      ctx.fillText(line, 540, startY + index * lineHeight)
    })

    // Draw company name at bottom
    ctx.font = "600 36px Arial, sans-serif"
    ctx.fillStyle = "#666"
    ctx.fillText(companyName.toUpperCase(), 540, 950)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png")

    // Upload to Cloudinary if configured
    if (env.CLOUDINARY_CLOUD_NAME) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `logo-posts/${companyName.toLowerCase().replace(/\s+/g, "-")}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          .end(buffer)
      })

      return uploadResult.secure_url
    } else {
      // Return as base64 if no Cloudinary
      return `data:image/png;base64,${buffer.toString("base64")}`
    }
  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to generate logo image")
    return null
  }
}

// Helper function to design over Unsplash images with Canvas
async function designOverUnsplashImage(
  unsplashUrl: string,
  text: string,
  companyName: string
): Promise<string | null> {
  try {
    // Create a 1080x1080 canvas (Instagram square format)
    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext("2d")

    // Download and load the Unsplash image
    const response = await fetch(unsplashUrl)
    if (!response.ok) {
      logger.error({ status: response.status }, "Failed to download Unsplash image")
      return null
    }

    const buffer = await response.arrayBuffer()
    const image = await loadImage(Buffer.from(buffer))

    // Calculate dimensions to cover canvas (aspect-fill)
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

    // Apply subtle darkening filter to make text more readable
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)"
    ctx.fillRect(0, 0, 1080, 1080)

    // Add gradient overlay from bottom (darker at bottom for text readability)
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.1)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.6)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Word wrap function
    function wrapText(text: string, maxWidth: number): string[] {
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

    // Prepare text content (clean markdown)
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '')   // Remove italic markdown
      .replace(/#{1,6}\s/g, '') // Remove heading markdown

    // Draw main text (center)
    const maxWidth = 900
    const lineHeight = 70
    const fontSize = 54

    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const lines = wrapText(cleanText.substring(0, 150), maxWidth) // Limit to 150 chars
    const totalHeight = lines.length * lineHeight
    const startY = 1080 / 2 - totalHeight / 2

    // Draw text with white color and shadow for better readability
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4

    lines.forEach((line, index) => {
      ctx.fillStyle = "#ffffff"
      ctx.fillText(line, 540, startY + index * lineHeight)
    })

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Draw company name at bottom with background bar
    const barHeight = 80
    const barY = 1080 - barHeight

    // Semi-transparent background bar for company name
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, barY, 1080, barHeight)

    // Company name text
    ctx.font = "700 32px Arial, sans-serif"
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.fillText(companyName.toUpperCase(), 540, barY + barHeight / 2)

    // Convert canvas to buffer
    const outputBuffer = canvas.toBuffer("image/png")

    // Upload to Cloudinary if configured
    if (env.CLOUDINARY_CLOUD_NAME) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `designed-posts/${companyName.toLowerCase().replace(/\s+/g, "-")}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          .end(outputBuffer)
      })

      return uploadResult.secure_url
    } else {
      // Return as base64 if no Cloudinary
      return `data:image/png;base64,${outputBuffer.toString("base64")}`
    }
  } catch (error: any) {
    logger.error({ error: error.message }, "Failed to design over Unsplash image")
    return null
  }
}

// POST /api/ai/generate-batch-posts
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body: GenerateBatchPostsRequest = await request.json()

    let {
      companyInfo,
      quantity = 10,
      platform = "INSTAGRAM",
      language = "es",
      includeImages = true,
      imageSource = "unsplash",
      logoBase64,
      imageStyle = "modern and professional",
      controversyLevel = 5,
      tone = "professional",
      contentTypes = DEFAULT_CONTENT_TYPES,
    } = body

    // Enrich companyInfo with onboarding data if available
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        name: true,
        industry: true,
        industryOther: true,
        companyDescription: true,
        targetAudience: true,
        brandPersonality: true,
        objective: true,
      },
    })

    // Merge onboarding data with provided companyInfo
    if (user && user.industry) {
      companyInfo = {
        name: companyInfo?.name || user.name || "Company",
        industry: companyInfo?.industry || (user.industry === "otro" ? user.industryOther : user.industry) || "General",
        description: companyInfo?.description || user.companyDescription || "",
        targetAudience: companyInfo?.targetAudience || user.targetAudience || undefined,
        brandVoice: companyInfo?.brandVoice || (user.brandPersonality && user.brandPersonality.length > 0
          ? user.brandPersonality.join(", ")
          : undefined),
      }
    }

    if (!companyInfo?.name || !companyInfo?.industry) {
      return NextResponse.json(
        { error: "Company name and industry are required" },
        { status: 400 }
      )
    }

    if (quantity < 1 || quantity > 30) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 30" },
        { status: 400 }
      )
    }

    // Check if AI features are enabled
    if (!env.ENABLE_AI_FEATURES || !env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI features are not configured" },
        { status: 503 }
      )
    }

    logger.info(
      { company: companyInfo.name, quantity, platform },
      "Starting batch post generation"
    )

    const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY)

    // STEP 1: Generate post ideas based on company info
    // Using current stable model (as of 2025)
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const toneInstructions = {
      professional: "Professional, credible, and expertise-focused",
      casual: "Friendly, conversational, and approachable",
      provocative: "Bold, attention-grabbing, and challenging",
      inspirational: "Motivational, uplifting, and empowering",
    }

    const controversyInstructions =
      controversyLevel <= 3
        ? "safe and non-controversial"
        : controversyLevel <= 6
        ? "balanced with thought-provoking perspectives"
        : "bold and debate-sparking"

    const languageName = LANGUAGE_NAMES[language] || "Spanish"
    const ideasPrompt = `You are an elite social media strategist and viral content specialist with deep expertise in ${platform} algorithm optimization and audience psychology.

🎯 CRITICAL: ALL content MUST be written in ${languageName}. No exceptions.

═══════════════════════════════════════════════════════
📊 COMPANY INTELLIGENCE
═══════════════════════════════════════════════════════
Company: ${companyInfo.name}
Industry: ${companyInfo.industry}
Description: ${companyInfo.description}
${companyInfo.targetAudience ? `Target Audience: ${companyInfo.targetAudience}` : ""}
${companyInfo.brandVoice ? `Brand Voice: ${companyInfo.brandVoice}` : ""}

═══════════════════════════════════════════════════════
🎨 CONTENT PARAMETERS
═══════════════════════════════════════════════════════
Platform: ${platform}
Language: ${languageName} (MANDATORY - write everything in ${languageName})
Tone: ${toneInstructions[tone]}
Controversy Level: ${controversyLevel}/10 (${controversyInstructions})
Posts Required: ${quantity}

═══════════════════════════════════════════════════════
🧠 VIRAL CONTENT FRAMEWORKS TO USE
═══════════════════════════════════════════════════════
Mix these proven frameworks across your ${quantity} ideas:

1. PAS (Problem-Agitate-Solution)
2. AIDA (Attention-Interest-Desire-Action)
3. BAB (Before-After-Bridge)
4. 4 P's (Picture-Promise-Proof-Push)
5. PASO (Problem-Amplify-Story-Offer)
6. The Curiosity Gap
7. Pattern Interrupt
8. Social Proof Authority

═══════════════════════════════════════════════════════
🔥 HOOK TYPES (Use variety across posts)
═══════════════════════════════════════════════════════
- Shocking Statistic: "97% of [industry] are doing this wrong..."
- Contrarian Take: "Unpopular opinion: [common belief] is killing your business"
- Bold Prediction: "In 6 months, everyone who ignores [X] will..."
- Curiosity Gap: "The [X] secret that [competitors] don't want you to know"
- Personal Story: "I lost $[X] before I learned this..."
- Listicle Tease: "5 [industry] mistakes that are costing you [benefit]"
- Question Hook: "Are you making this expensive [industry] mistake?"
- Challenge Hook: "Try this for 7 days and watch what happens..."

═══════════════════════════════════════════════════════
📱 CONTENT TYPES (Distribute strategically)
═══════════════════════════════════════════════════════
${contentTypes.map((type, i) => `${i + 1}. ${type}`).join("\n")}

═══════════════════════════════════════════════════════
✨ YOUR MISSION
═══════════════════════════════════════════════════════
Generate ${quantity} HIGH-PERFORMANCE post ideas that:

✓ Use PROVEN viral frameworks (PAS, AIDA, BAB, etc.)
✓ Start with SCROLL-STOPPING hooks
✓ Trigger emotional responses (curiosity, fear of missing out, excitement)
✓ Are hyper-specific to ${companyInfo.industry} (NO generic advice)
✓ Optimized for ${platform} algorithm (saves, shares, comments)
✓ Include pattern interrupts and curiosity gaps
✓ Showcase unique expertise and authority
✓ Drive measurable engagement and action

═══════════════════════════════════════════════════════
📋 OUTPUT FORMAT
═══════════════════════════════════════════════════════
For each idea:

IDEA [number]:
Title: [Compelling 5-8 word title that hooks attention]
Hook: [Specific one-sentence hook using one of the hook types above - must stop the scroll]
Type: [Content type from the list]

Example:
IDEA 1:
Title: Por Qué Tu Empresa Morirá Sin IA
Hook: El 89% de las empresas que ignoran la IA estarán fuera del mercado en 2026 - aquí está la prueba que nadie quiere ver
Type: Industry Insight / Problem-Solution

═══════════════════════════════════════════════════════

Now generate all ${quantity} ideas with MAXIMUM viral potential:`

    const ideasResult = await textModel.generateContent(ideasPrompt)
    const ideasText = ideasResult.response.text()

    logger.info({ responsePreview: ideasText.substring(0, 500) }, "Ideas response received")

    // Parse ideas - flexible regex to handle markdown formatting
    const ideaMatches = ideasText.matchAll(/\*?\*?IDEA \d+:\*?\*?\s*\*?\*?Title:\*?\*?\s*(.*?)\s*\*?\*?Hook:\*?\*?\s*(.*?)\s*\*?\*?Type:\*?\*?\s*(.*?)(?=\*?\*?IDEA \d+:|$)/gs)
    const ideas = Array.from(ideaMatches).map((match) => ({
      title: match[1].trim().replace(/\*\*/g, ''),
      hook: match[2].trim().replace(/\*\*/g, ''),
      type: match[3].trim().replace(/\*\*/g, ''),
    }))

    if (ideas.length === 0) {
      logger.error({ fullResponse: ideasText }, "Failed to parse ideas from response")
      return NextResponse.json(
        { error: "Failed to generate post ideas. Check server logs for details." },
        { status: 500 }
      )
    }

    logger.info({ ideasCount: ideas.length }, "Generated post ideas")

    // STEP 2: Generate full posts for each idea
    const posts = []

    for (let i = 0; i < Math.min(ideas.length, quantity); i++) {
      const idea = ideas[i]
      logger.info({ index: i + 1, title: idea.title }, "Generating post")

      try {
        // Generate text content with optimized viral prompt
        const postPrompt = `You are an elite ${platform} content creator with a proven track record of viral posts and high engagement.

🎯 CRITICAL: Write EVERYTHING in ${languageName}. No exceptions.

═══════════════════════════════════════════════════════
📊 BRAND CONTEXT
═══════════════════════════════════════════════════════
Company: ${companyInfo.name}
Description: ${companyInfo.description}
Industry: ${companyInfo.industry}

═══════════════════════════════════════════════════════
💡 POST CONCEPT (Already validated for viral potential)
═══════════════════════════════════════════════════════
Title: ${idea.title}
Hook Strategy: ${idea.hook}
Content Type: ${idea.type}

═══════════════════════════════════════════════════════
🎨 CREATIVE PARAMETERS
═══════════════════════════════════════════════════════
Platform: ${platform}
Language: ${languageName} (MANDATORY)
Tone: ${toneInstructions[tone]}
Controversy Level: ${controversyLevel}/10 (${controversyInstructions})

═══════════════════════════════════════════════════════
🔥 VIRAL POST STRUCTURE (Follow this EXACTLY)
═══════════════════════════════════════════════════════

LINE 1 (THE HOOK) - Must stop the scroll:
• Use the hook strategy provided above
• Make it bold, specific, and emotional
• Include numbers/data if possible
• Create immediate curiosity or shock

PARAGRAPH 1 (AMPLIFY THE PROBLEM/OPPORTUNITY):
• Expand on the hook
• Make the reader feel the pain or desire
• Use "you" language to make it personal
• 2-3 sentences max

[Empty line for breathing room]

PARAGRAPH 2 (INSIGHT/VALUE):
• Deliver the core insight or solution
• Be specific and actionable (NO generic advice)
• Include insider knowledge or unique perspective
• 3-4 sentences

[Empty line]

PARAGRAPH 3 (PROOF/AUTHORITY):
• Add credibility through data, examples, or expertise
• Show why ${companyInfo.name} understands this deeply
• Make it industry-specific to ${companyInfo.industry}
• 2-3 sentences

[Empty line]

CLOSING (POWERFUL CTA):
• Clear, actionable call-to-action
• Create urgency or FOMO
• Make it easy to engage (question, challenge, or directive)
• 1-2 sentences

═══════════════════════════════════════════════════════
✅ ENGAGEMENT OPTIMIZATION CHECKLIST
═══════════════════════════════════════════════════════
Your post MUST include:
✓ Pattern interrupt in first line
✓ Emotional trigger (curiosity, fear, excitement, anger)
✓ Line breaks for readability (max 3-4 sentences per paragraph)
✓ Specific numbers/data points (NO vague claims)
✓ Personal "you" language
✓ One clear, actionable CTA at the end
✓ Professional formatting for ${platform}
✓ Authentic brand voice for ${companyInfo.name}

═══════════════════════════════════════════════════════
📱 PLATFORM-SPECIFIC OPTIMIZATION
═══════════════════════════════════════════════════════
${platform === "INSTAGRAM" ?
`• First 125 characters are CRITICAL (shown before "more")
• Use line breaks generously (easy scrolling)
• Optimal length: 150-300 words
• End with engaging question to drive comments` :
platform === "LINKEDIN" ?
`• Professional but authentic tone
• Optimal length: 150-250 words
• Include industry-specific insights
• End with thought-provoking question` :
platform === "X" ?
`• Punchy and direct
• Front-load the value
• Optimal length: 100-200 words
• Create shareability` :
`• Engaging and valuable
• Clear structure with breaks
• Optimal length: 150-300 words`}

═══════════════════════════════════════════════════════
🏷️ HASHTAG STRATEGY (Generate 8 strategic hashtags)
═══════════════════════════════════════════════════════
Mix these types:
• 2-3 HIGH-volume (100k+ posts) - for discovery
• 3-4 MID-volume (10k-100k) - for targeted reach
• 2-3 NICHE-specific (<10k) - for engaged community

Make them:
✓ Relevant to ${companyInfo.industry}
✓ Mix of broad + specific
✓ Actually used by your target audience
✓ NO generic spam tags

═══════════════════════════════════════════════════════
📋 OUTPUT FORMAT
═══════════════════════════════════════════════════════

POST:
[Your high-engagement post content here - following the structure above]

HASHTAGS:
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8

═══════════════════════════════════════════════════════

Now create a VIRAL-OPTIMIZED post that will maximize saves, shares, and comments:`

        const postResult = await textModel.generateContent(postPrompt)
        const postText = postResult.response.text()

        // Parse response
        const postMatch = postText.match(/POST:\s*([\s\S]*?)(?=HASHTAGS:|$)/i)
        const hashtagsMatch = postText.match(/HASHTAGS:\s*([\s\S]*)/i)

        const content = postMatch ? postMatch[1].trim() : postText.trim()
        const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : ""
        const hashtags = hashtagsText
          .split(/\s+/)
          .filter((h) => h.startsWith("#"))
          .map((h) => h.replace("#", ""))

        let imageUrl = null

        // Generate/fetch image based on source
        if (includeImages && imageSource !== "none") {
          try {
            if (imageSource === "unsplash") {
              // Fetch from Unsplash - use simple English terms for better results
              // Try specific industry term first
              let searchQuery = companyInfo.industry.toLowerCase()
              imageUrl = await fetchUnsplashImage(searchQuery)

              // If not found, try generic tech/business terms
              if (!imageUrl) {
                const genericTerms = ["business", "technology", "workspace", "office", "team", "innovation"]
                const randomTerm = genericTerms[Math.floor(Math.random() * genericTerms.length)]
                imageUrl = await fetchUnsplashImage(randomTerm)
              }

              logger.info({ query: searchQuery, found: !!imageUrl }, "Unsplash image fetch")
            } else if (imageSource === "unsplash-designed") {
              // Fetch from Unsplash and design over it with Canvas
              let searchQuery = companyInfo.industry.toLowerCase()
              let unsplashUrl = await fetchUnsplashImage(searchQuery)

              // If not found, try generic tech/business terms
              if (!unsplashUrl) {
                const genericTerms = ["business", "technology", "workspace", "office", "team", "innovation"]
                const randomTerm = genericTerms[Math.floor(Math.random() * genericTerms.length)]
                unsplashUrl = await fetchUnsplashImage(randomTerm)
              }

              if (unsplashUrl) {
                // Design over the Unsplash image
                const excerpt = content.substring(0, 120) // First 120 chars for the image
                imageUrl = await designOverUnsplashImage(unsplashUrl, excerpt, companyInfo.name)
                logger.info({ query: searchQuery, found: !!imageUrl }, "Unsplash designed image")
              } else {
                logger.warn({ query: searchQuery }, "No Unsplash image found for designing")
              }
            } else if (imageSource === "ai") {
              // Generate with DALL-E
              const dallePrompt = `A professional ${imageStyle} image for ${platform} social media post.
Theme: ${idea.title}
Company: ${companyInfo.name} (${companyInfo.industry})
Style: ${imageStyle}, ${tone} tone
The image should be visually striking and work well on ${platform}.
${idea.type.includes("stat") || idea.type.includes("data") ? "Include clear, readable statistics or data visualization." : "Focus on visual impact without text."}`

              imageUrl = await generateDalleImage(dallePrompt)
              logger.info({ found: !!imageUrl }, "DALL-E image generation")
            } else if (imageSource === "logo" && logoBase64) {
              // Generate with logo background + text
              const excerpt = content.substring(0, 150) // First 150 chars for the image
              imageUrl = await generateLogoImage(logoBase64, excerpt, companyInfo.name)
              logger.info({ found: !!imageUrl }, "Logo image generation")
            }

            if (!imageUrl) {
              logger.warn({ source: imageSource, index: i }, "Failed to get image, continuing without")
            }
          } catch (imageError: any) {
            logger.error({ error: imageError, index: i, source: imageSource }, "Failed to get image")
            // Continue without image
          }
        }

        posts.push({
          id: `post-${i + 1}`,
          title: idea.title,
          type: idea.type,
          content,
          hashtags,
          imageUrl,
          platform,
          metadata: {
            tone,
            controversyLevel,
            generatedAt: new Date().toISOString(),
          },
        })

        logger.info({ index: i + 1, hasImage: !!imageUrl }, "Post generated successfully")
      } catch (error: any) {
        logger.error({ error, index: i }, "Failed to generate post")
        // Continue with next post
      }
    }

    if (posts.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any posts" },
        { status: 500 }
      )
    }

    logger.info({ postsGenerated: posts.length }, "Batch generation completed")

    return NextResponse.json({
      success: true,
      posts,
      summary: {
        requested: quantity,
        generated: posts.length,
        withImages: posts.filter((p) => p.imageUrl).length,
        company: companyInfo.name,
      },
    })
  } catch (error: any) {
    logger.error({ error }, "Failed to generate batch posts")

    return NextResponse.json(
      { error: error.message || "Failed to generate posts" },
      { status: 500 }
    )
  }
}
