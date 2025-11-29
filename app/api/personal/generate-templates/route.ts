import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createLogger } from "@/lib/logger"
import prisma from "@/lib/prisma"
import { randomUUID } from "crypto"

const logger = createLogger("api:personal:generate-templates")

interface Template {
  id: string
  name: string
  category: "quote" | "tip" | "announcement" | "product" | "custom"
  html: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

// POST /api/personal/generate-templates
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { numberOfTemplates = 3 } = body

    // Get user data for context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        industry: true,
        companyDescription: true,
        brandPersonality: true,
        brandColors: true,
        logoUrl: true,
      },
    })

    // Also get personal brand logo as fallback
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.brandColors || user.brandColors.length < 2) {
      return NextResponse.json(
        { error: "Brand colors are required. Please complete onboarding first." },
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
        { error: "AI service not configured" },
        { status: 503 }
      )
    }

    logger.info({ numberOfTemplates }, "Generating templates with AI")

    // Use Gemini API to generate templates
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Generate expanded color palette
    const colors = {
      primary: user.brandColors[0] || "#050505",
      secondary: user.brandColors[1] || "#C2C2C2",
      accent: user.brandColors[0]?.toLowerCase().startsWith("#0") || user.brandColors[0]?.toLowerCase().startsWith("#1")
        ? "#3B82F6"  // Tech blue for dark themes
        : "#22D3EE", // Mint cyber for light themes
      tint: user.brandColors[0]?.toLowerCase().startsWith("#0") ? "#1A1A1A" : "#F5F5F5",
      shade: "#9A9A9A",
    }

    const prompt = `You are an elite Instagram visual designer specializing in viral, conversion-focused post templates.

🎯 MISSION:
Create ${numberOfTemplates} STUNNING, scroll-stopping Instagram templates for ${user.industry || "professional"} brand.
These must look like they came from a top-tier design agency in 2025.

📊 BRAND CONTEXT:
Industry: ${user.industry || "general"}
Description: ${user.companyDescription || "N/A"}
Personality: ${user.brandPersonality?.join(", ") || "professional, innovative, confident"}

🎨 COLOR PALETTE (USE THESE EXACT VALUES):
• Primary: ${colors.primary} (main background or text)
• Secondary: ${colors.secondary} (complementary elements)
• Accent: ${colors.accent} (highlights, CTAs, key elements)
• Tint: ${colors.tint} (subtle backgrounds)
• Shade: ${colors.shade} (borders, dividers, subtle lines)

🔥 DESIGN TRENDS TO USE (pick different ones per template):

1. **Cyber Minimalism**
   - Ultra-clean with ONE bold accent color
   - Radial gradients: radial-gradient(circle at 10% 20%, ${colors.accent}30, transparent 70%)
   - Typography as hero: 80-96px weight 900
   - Thin geometric lines (1-2px) as accents
   - Example: Black bg + neon accent + massive white text

2. **Soft Glassmorphism**
   - Frosted glass cards: background: rgba(255,255,255,0.08); backdrop-filter: blur(12px);
   - Multiple layers with slight transparency
   - Subtle noise texture if possible
   - Rounded corners (24-32px)
   - Floating shadows: box-shadow: 0 20px 60px rgba(0,0,0,0.4);

3. **Neo-Brutalism**
   - Thick borders (5-8px solid ${colors.primary})
   - Offset shadows: box-shadow: 8px 8px 0 ${colors.primary};
   - Bold geometric shapes (squares, circles)
   - High contrast colors
   - Playful but structured

4. **Data Viz Style**
   - Big numbers/percentages: 120-160px font
   - Progress bars or decorative lines
   - Grid-based layout
   - Monospace fonts for numbers
   - Clean, dashboard aesthetic

5. **Split Asymmetric**
   - Two-column grid: 60/40 or 40/60 split
   - Different backgrounds per column
   - Vertical divider line (1-2px)
   - One side: big visual, other: content

6. **Gradient Hero**
   - Smooth multi-stop gradients
   - Linear or conic: conic-gradient(from 180deg, ${colors.accent}, ${colors.primary})
   - Centered content card
   - Deep shadows and elevation

✅ MANDATORY REQUIREMENTS:

**Layout:**
- Canvas: width:1080px; aspect-ratio:1/1; (NOT height:1080px)
- Safe padding: MINIMUM 80px on ALL sides
- Centered content when possible
- Use flexbox or grid for perfect alignment

**Typography:**
- Import Google Fonts: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Poppins:wght@400;600;700;800&display=swap');
- Title: 64-88px, weight 800-900, line-height 1.0-1.1
- Content: 32-42px, weight 400-600, line-height 1.35-1.5
- Use letter-spacing: -0.02em for large text

**Colors:**
- Use ${colors.primary} as main background OR text
- ${colors.accent} for key elements (must be visible!)
- ${colors.secondary} for secondary text/elements
- ALL colors must appear in each template
- Ensure WCAG AA contrast (3:1 minimum for large text)

**Visual Details (MUST HAVE AT LEAST 2):**
- Geometric shapes (circles, squares, rectangles) as decoration
- Radial or linear gradients
- Border-radius for modern feel (16px-32px)
- Subtle decorative lines/dividers
- Small UI elements (badges, chips, tags)
- Box shadows for depth

**Logo Integration ${logoUrl ? "(REQUIRED)" : "(Optional)"}:**${logoUrl ? `
- Brand logo available at: ${logoUrl}
- MUST include logo in BOTTOM-RIGHT corner (Instagram shows page counter top-right)
- Logo size: 80-120px width (maintain aspect ratio with object-fit: contain)
- Logo container: position: absolute; bottom: 40-60px; right: 40-60px;
- Ensure logo is visible with proper contrast (add subtle drop shadow if needed)
- Example: <img src="${logoUrl}" alt="Logo" style="position: absolute; bottom: 40px; right: 40px; width: 100px; height: 100px; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));" />` : `
- No logo available yet
- Leave space in bottom-right corner for future logo placement`}

**Variables:**
- ALWAYS include {{TITLE}} and {{CONTENT}}
- Use {{CTA}}, {{LABEL}}, {{TAG1}}, {{TAG2}} where appropriate
- Variables should be the ONLY dynamic text

**Quality Checks:**
- Would this stop someone scrolling? (If no, redesign)
- Is the hierarchy clear? (Title > Content > Details)
- Are all brand colors used tastefully?
- Would this look premium next to top brands?

📐 OUTPUT FORMAT:

Return ONLY valid JSON (NO markdown, NO explanations):

[
  {
    "name": "Concise, descriptive name",
    "category": "quote|tip|announcement|product|stat|custom",
    "html": "<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@800;900&display=swap');</style><div style='width:1080px;aspect-ratio:1/1;background:${colors.primary};font-family:Inter,sans-serif;padding:80px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;'>...</div>",
    "variables": ["TITLE", "CONTENT"]
  }
]

🚨 CRITICAL:
- Each template MUST be visually DISTINCT
- NO placeholder images - only CSS
- Perfect center alignment
- Modern, 2025-ready aesthetic
- Return ONLY the JSON array

Generate ${numberOfTemplates} templates now:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let templatesText = response.text().trim()

    // Remove markdown code blocks if present
    templatesText = templatesText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    logger.info({ templatesText }, "Raw AI response")

    // Parse the JSON response
    let generatedTemplates: any[]
    try {
      generatedTemplates = JSON.parse(templatesText)
    } catch (parseError) {
      logger.error({ parseError, templatesText }, "Failed to parse AI response")
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }

    // Transform to our template format
    const templates: Template[] = generatedTemplates.map((template) => ({
      id: randomUUID(),
      name: template.name,
      category: template.category,
      html: template.html,
      variables: template.variables || ["TITLE", "CONTENT"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // Get existing templates from database
    const userWithTemplates = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { templates: true },
    })

    const existingTemplates = (userWithTemplates?.templates as any[]) || []

    // Check if adding new templates would exceed the limit
    const totalAfterAdd = existingTemplates.length + templates.length
    if (totalAfterAdd > 20) {
      logger.warn(
        { existing: existingTemplates.length, new: templates.length, total: totalAfterAdd },
        "Would exceed template limit"
      )
      return NextResponse.json(
        {
          error: `Cannot add ${templates.length} templates. You have ${existingTemplates.length} templates. Maximum is 20. Delete ${totalAfterAdd - 20} templates first.`,
        },
        { status: 400 }
      )
    }

    // Add new templates at the BEGINNING (most recent first)
    const allTemplates = [...templates, ...existingTemplates]

    // Update user with new templates
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        templates: allTemplates as any,
      },
    })

    logger.info({ count: templates.length }, "Templates generated and saved")

    return NextResponse.json({ templates, total: allTemplates.length })
  } catch (error: any) {
    logger.error({ error }, "Failed to generate templates")

    return NextResponse.json(
      { error: error.message || "Failed to generate templates" },
      { status: 500 }
    )
  }
}

// GET /api/personal/generate-templates - Get all user templates
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        templates: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const templates = (user as any).templates || []

    return NextResponse.json({ templates, total: templates.length })
  } catch (error: any) {
    logger.error({ error }, "Failed to fetch templates")

    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 }
    )
  }
}
