import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { env } from "@/lib/env"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createLogger } from "@/lib/logger"
import {
  WINNING_CAROUSEL_STRUCTURES,
  getCarouselStructureByName,
  getRandomCarouselStructure,
  type CarouselSlide,
} from "@/lib/carousel-structures"

const logger = createLogger("api:ai:generate-carousel")

interface ProductInfo {
  name: string
  description: string
  shortDescription?: string
  category?: string
  price?: number
  currency?: string
  features?: string[]
  targetAudience?: string
  productUrl?: string
}

interface GenerateCarouselRequest {
  topic: string
  structureName?: string // Si no se especifica, se elige uno al azar
  companyInfo?: {
    name: string
    industry: string
    description: string
    targetAudience?: string
  }
  productInfo?: ProductInfo // Optional product information
  controversyLevel?: number // 1-10 scale
  targetAudience?: string // Override or supplement company targetAudience
  language?: string
  tone?: "professional" | "casual" | "provocative" | "inspirational"
  platform?: string
  includeImages?: boolean
}

interface CarouselResponse {
  structure: {
    name: string
    description: string
    slideCount: number
  }
  slides: Array<{
    slideNumber: number
    title?: string
    content: string
    imagePrompt?: string
    designNotes?: string
  }>
  caption: string
  hashtags: string[]
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body: GenerateCarouselRequest = await req.json()

    const {
      topic,
      structureName,
      companyInfo,
      productInfo,
      controversyLevel = 5,
      targetAudience,
      language = "es",
      tone = "professional",
      platform = "INSTAGRAM",
      includeImages = true
    } = body

    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Select carousel structure
    const structure = structureName
      ? getCarouselStructureByName(structureName)
      : getRandomCarouselStructure()

    if (!structure) {
      return NextResponse.json({ error: "Invalid structure name" }, { status: 400 })
    }

    logger.info({ structure: structure.name, topic }, "Generating carousel")

    // Initialize Gemini
    if (!env.GEMINI_API_KEY && !env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
    }

    const apiKey = env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY!
    const genAI = new GoogleGenerativeAI(apiKey)
    // Using gemini-2.5-flash (same as batch-posts for consistency)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Get template slides
    const templateSlides = structure.template(topic)

    // Build comprehensive prompt
    const languageMap: Record<string, string> = {
      es: "Spanish",
      en: "English",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
    }

    const toneDescriptions = {
      professional: "profesional, informativo y confiable",
      casual: "casual, amigable y conversacional",
      provocative: "provocativo, desafiante y que cuestiona el status quo",
      inspirational: "inspirador, motivacional y empoderador",
    }

    const companyContext = companyInfo
      ? `
Información de la empresa:
- Nombre: ${companyInfo.name}
- Industria: ${companyInfo.industry}
- Descripción: ${companyInfo.description}
${companyInfo.targetAudience ? `- Audiencia objetivo: ${companyInfo.targetAudience}` : ""}

Asegúrate de que el contenido sea relevante para esta empresa y su audiencia.
`
      : ""

    const productContext = productInfo
      ? `
INFORMACIÓN DEL PRODUCTO (MUY IMPORTANTE):
- Nombre: ${productInfo.name}
- Descripción: ${productInfo.description}
${productInfo.shortDescription ? `- Pitch corto: ${productInfo.shortDescription}` : ""}
${productInfo.category ? `- Categoría: ${productInfo.category}` : ""}
${productInfo.price && productInfo.currency ? `- Precio: ${productInfo.currency} ${productInfo.price}` : ""}
${productInfo.features && productInfo.features.length > 0 ? `- Características clave:\n${productInfo.features.map(f => `  * ${f}`).join("\n")}` : ""}
${productInfo.targetAudience ? `- Audiencia del producto: ${productInfo.targetAudience}` : ""}
${productInfo.productUrl ? `- URL: ${productInfo.productUrl}` : ""}

IMPORTANTE: El carrusel debe estar TOTALMENTE ENFOCADO en este producto. Usa sus características, beneficios y propuesta de valor para crear el contenido.
`
      : ""

    const audienceContext = targetAudience
      ? `\nAudiencia objetivo específica: ${targetAudience}`
      : ""

    const controversyContext = `
Nivel de controversia solicitado: ${controversyLevel}/10
${controversyLevel <= 3 ? "- Contenido conservador y seguro, sin opiniones divisivas" : ""}
${controversyLevel >= 4 && controversyLevel <= 6 ? "- Contenido moderado, puede incluir opiniones pero no extremas" : ""}
${controversyLevel >= 7 && controversyLevel <= 8 ? "- Contenido provocativo, desafía creencias comunes, genera debate" : ""}
${controversyLevel >= 9 ? "- Contenido altamente controversial, cuestiona el status quo agresivamente" : ""}
`

    const prompt = `Eres un experto en marketing de contenidos para Instagram y creación de carruseles virales.

${companyContext}
${productContext}
${audienceContext}
${controversyContext}

Tu tarea es generar un carrusel completo usando la estructura "${structure.name}":
${structure.description}

Tema del carrusel: "${topic}"
Idioma: ${languageMap[language] || "Spanish"}
Tono: ${toneDescriptions[tone]}
Plataforma: ${platform}

ESTRUCTURA DEL CARRUSEL (${structure.slideCount} slides):
${templateSlides.map((slide) => `
Slide ${slide.slideNumber}${slide.title ? ` - ${slide.title}` : ""}:
${slide.content}
${slide.designNotes ? `Notas de diseño: ${slide.designNotes}` : ""}
`).join("\n")}

INSTRUCCIONES ESPECÍFICAS:
1. Genera contenido ESPECÍFICO y ACCIONABLE para cada slide
2. El primer slide debe ser un HOOK PODEROSO que detenga el scroll
3. Cada slide debe tener entre 15-30 palabras (máximo 2 líneas de texto)
4. Usa lenguaje directo, sin rodeos
5. Incluye números y datos cuando sea posible
6. Termina con un CTA claro
7. ${includeImages ? "Genera un prompt de imagen descriptivo para cada slide que será usado con DALL-E o Unsplash" : "No incluyas prompts de imagen"}

FORMATO DE RESPUESTA (JSON):
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Título del slide (opcional)",
      "content": "Contenido conciso del slide",
      ${includeImages ? '"imagePrompt": "Prompt detallado para generar la imagen",' : ""}
      "designNotes": "Notas sobre diseño visual"
    }
  ],
  "caption": "Caption completo para el post (2-3 líneas que complementen el carrusel)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}

Genera un carrusel completo, profesional y altamente engaging sobre "${topic}".`

    logger.info({ promptLength: prompt.length }, "Sending request to Gemini")

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    logger.info({ responseLength: text.length }, "Received response from Gemini")

    // Parse JSON from response
    let carouselData: CarouselResponse
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = text.trim()

      // Remove markdown code block markers if present (more aggressive approach)
      // Handle cases like: ```json\n{...}\n``` or ```\n{...}\n```
      jsonText = jsonText.replace(/^```(?:json)?\s*/gm, "")  // Remove opening markers
      jsonText = jsonText.replace(/```\s*$/gm, "")           // Remove closing markers

      // Find the JSON object (first opening brace to last closing brace)
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }

      logger.info({ jsonPreview: jsonText.substring(0, 200) }, "Cleaned JSON text preview")

      carouselData = JSON.parse(jsonText)
    } catch (parseError) {
      logger.error({ error: parseError, text: text.substring(0, 500) }, "Failed to parse Gemini response")
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Validate that we have the correct number of slides
    if (carouselData.slides.length !== structure.slideCount) {
      logger.warn(
        { expected: structure.slideCount, actual: carouselData.slides.length },
        "Slide count mismatch"
      )
    }

    // Return carousel data
    return NextResponse.json({
      success: true,
      carousel: {
        structure: {
          name: structure.name,
          description: structure.description,
          slideCount: structure.slideCount,
        },
        slides: carouselData.slides,
        caption: carouselData.caption,
        hashtags: carouselData.hashtags || [],
      },
    })
  } catch (error: any) {
    logger.error({ error }, "Error generating carousel")
    return NextResponse.json(
      { error: error.message || "Failed to generate carousel" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAuth()

    // Return available structures
    return NextResponse.json({
      structures: WINNING_CAROUSEL_STRUCTURES.map((s) => ({
        name: s.name,
        description: s.description,
        slideCount: s.slideCount,
        purpose: s.purpose,
      })),
    })
  } catch (error: any) {
    logger.error({ error }, "Error fetching structures")
    return NextResponse.json({ error: error.message || "Failed to fetch structures" }, { status: 500 })
  }
}
