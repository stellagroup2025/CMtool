"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Info,
  Send,
  Download,
  Trash2,
  Package,
  Target,
  Zap,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { getPersonalBrandData } from "./actions"
import { toPng } from "html-to-image"
import { addLogoToImage } from "@/lib/add-logo-to-image"
import { useBackgroundTasks } from "@/contexts/background-tasks-context"

interface CarouselStructure {
  name: string
  description: string
  slideCount: number
  purpose: string
}

interface CarouselSlide {
  slideNumber: number
  title?: string
  content: string
  imagePrompt?: string
  designNotes?: string
}

interface GeneratedCarousel {
  structure: {
    name: string
    description: string
    slideCount: number
  }
  slides: CarouselSlide[]
  caption: string
  hashtags: string[]
  imageUrls?: string[] // Generated image URLs for each slide
}

const TONES = [
  { id: "professional", label: "Profesional" },
  { id: "casual", label: "Casual" },
  { id: "provocative", label: "Provocativo" },
  { id: "inspirational", label: "Inspirador" },
]

const LANGUAGES = [
  { id: "es", label: "Español", emoji: "🇪🇸" },
  { id: "en", label: "English", emoji: "🇺🇸" },
]

// Helper: Get topic suggestions based on industry
function getTopicSuggestions(industry: string | null): string[] {
  if (!industry) {
    return [
      "5 consejos para mejorar tu productividad",
      "Tendencias que debes conocer este año",
      "Errores comunes y cómo evitarlos"
    ]
  }

  const suggestions: Record<string, string[]> = {
    "Tecnología": [
      "5 herramientas de IA que cambiarán tu negocio en 2025",
      "Cómo proteger tus datos en la era digital",
      "Tendencias tecnológicas que debes conocer este año"
    ],
    "Marketing": [
      "5 estrategias de marketing digital para aumentar ventas",
      "Cómo crear contenido viral en redes sociales",
      "Secretos del email marketing que funcionan"
    ],
    "Salud y Bienestar": [
      "5 hábitos saludables para transformar tu vida",
      "Rutinas de ejercicio para personas ocupadas",
      "Consejos de nutrición basados en ciencia"
    ],
    "Educación": [
      "Técnicas de estudio que realmente funcionan",
      "Cómo motivar a tus estudiantes en el aula digital",
      "Herramientas educativas innovadoras para 2025"
    ],
    "Finanzas": [
      "5 estrategias de ahorro que todos deberían conocer",
      "Inversiones inteligentes para principiantes",
      "Cómo mejorar tu salud financiera este año"
    ],
    "E-commerce": [
      "Estrategias para aumentar tus ventas online",
      "Cómo optimizar tu tienda para conversiones",
      "Tendencias de e-commerce que dominarán 2025"
    ],
    "Consultoría": [
      "Cómo construir tu marca personal como consultor",
      "Estrategias para conseguir más clientes",
      "Herramientas esenciales para consultores modernos"
    ],
    "Fotografía": [
      "5 técnicas de iluminación para fotos profesionales",
      "Cómo editar fotos como un experto",
      "Tendencias en fotografía para este año"
    ],
    "Diseño": [
      "Principios de diseño que todo creador debe conocer",
      "Tendencias de diseño que dominarán 2025",
      "Cómo mejorar tu portfolio de diseño"
    ],
    "Gastronomía": [
      "Recetas rápidas y saludables para días ocupados",
      "Técnicas de cocina profesional para casa",
      "Tendencias gastronómicas que debes probar"
    ]
  }

  return suggestions[industry] || [
    `5 consejos de ${industry} que debes conocer`,
    `Cómo mejorar en ${industry} este año`,
    `Errores comunes en ${industry} y cómo evitarlos`
  ]
}

// Helper: Get a single topic suggestion
function getTopicSuggestion(industry: string | null): string {
  const suggestions = getTopicSuggestions(industry)
  return suggestions[0]
}

export default function CarouselGeneratorPage() {
  console.log("🎠 CarouselGeneratorPage NUEVA VERSION con plantillas cargada!")

  const { addTask, updateTask } = useBackgroundTasks()

  const [structures, setStructures] = useState<CarouselStructure[]>([])
  const [loadingStructures, setLoadingStructures] = useState(true)
  const [selectedStructure, setSelectedStructure] = useState<string>("")
  const [topic, setTopic] = useState("")
  const [language, setLanguage] = useState("es")
  const [tone, setTone] = useState<"professional" | "casual" | "provocative" | "inspirational">("professional")
  const [generating, setGenerating] = useState(false)
  const [generatingImages, setGeneratingImages] = useState(false)
  const [generatedCarousel, setGeneratedCarousel] = useState<GeneratedCarousel | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imageSource, setImageSource] = useState<"unsplash" | "unsplash-edited" | "template">("unsplash")
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [brandData, setBrandData] = useState<{ brandId: string; brandName: string; industry: string | null; companyDescription: string | null; logoUrl: string | null; instagramAccountId: string | null } | null>(null)

  // Template states
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [rotateTemplates, setRotateTemplates] = useState(false)

  // NEW: Product, controversy level, and target audience states
  const [products, setProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("none")
  const [controversyLevel, setControversyLevel] = useState<number>(5)
  const [targetAudience, setTargetAudience] = useState<string>("")
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Fetch brand data
  useEffect(() => {
    getPersonalBrandData()
      .then((data) => {
        if (data && data.success) {
          setBrandData({
            brandId: data.brandId,
            brandName: data.brandName,
            industry: data.industry || null,
            companyDescription: data.companyDescription || null,
            logoUrl: data.logoUrl || null,
            instagramAccountId: data.instagramAccount?.id || null,
          })
        } else {
          console.error("Error fetching brand data:", data?.error)
          toast.error("Error al cargar datos de la cuenta")
        }
      })
      .catch((error) => {
        console.error("Exception fetching brand data:", error)
        toast.error("Error al cargar datos de la cuenta")
      })

    // Check if there's a loaded carousel from background tasks
    const loadedCarouselStr = sessionStorage.getItem('loadedCarousel')
    if (loadedCarouselStr) {
      try {
        const loadedCarousel = JSON.parse(loadedCarouselStr)
        setGeneratedCarousel(loadedCarousel)
        setCurrentSlide(0)
        sessionStorage.removeItem('loadedCarousel') // Clean up
        toast.success("Carrusel cargado desde tareas completadas")
      } catch (error) {
        console.error("Error loading carousel from storage:", error)
      }
    }
  }, [])

  // Fetch available structures
  useEffect(() => {
    fetch("/api/ai/generate-carousel")
      .then((res) => res.json())
      .then((data) => {
        setStructures(data.structures || [])
        setLoadingStructures(false)
      })
      .catch((error) => {
        console.error("Error fetching structures:", error)
        toast.error("Error al cargar las estructuras")
        setLoadingStructures(false)
      })
  }, [])

  // Load templates when imageSource is "template"
  useEffect(() => {
    if (imageSource === "template") {
      loadTemplates()
    }
  }, [imageSource])

  // Load products on component mount
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch("/api/personal/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        console.error("Failed to load products")
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Helper function to wrap text for canvas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = ""

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/personal/generate-templates")
      if (response.ok) {
        const data = await response.json()
        setAvailableTemplates(data.templates || [])
        if (data.templates?.length > 0) {
          setSelectedTemplateId(data.templates[0].id)
        }
      } else {
        toast.error("Error al cargar las plantillas")
      }
    } catch (error) {
      console.error("Error loading templates:", error)
      toast.error("Error al cargar las plantillas")
    }
  }

  const renderTemplateToImage = async (
    title: string,
    content: string,
    templateId?: string,
    slideNumber?: number
  ): Promise<string | null> => {
    try {
      const templateToUse = templateId || selectedTemplateId
      if (!templateToUse) return null

      // Extract meaningful content from the slide
      // Split content by periods, newlines, or semicolons to get points
      const contentPoints = content.split(/[.\n;]+/).filter(p => p.trim().length > 0)

      // For title, use the provided title or extract the first sentence
      const mainTitle = title || contentPoints[0]?.substring(0, 60) || "Contenido"

      // For content/subtitle, use remaining text or the full content
      const mainContent = title ? content : (contentPoints.slice(1).join(". ") || content)

      // Extract bullet points if available
      const point1 = contentPoints[0]?.trim().substring(0, 100) || mainContent.substring(0, 100)
      const point2 = contentPoints[1]?.trim().substring(0, 100) || (mainContent.length > 100 ? mainContent.substring(100, 200) : "")
      const point3 = contentPoints[2]?.trim().substring(0, 100) || ""

      // Get populated HTML from API with ALL variables properly filled
      const response = await fetch("/api/personal/templates/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: templateToUse,
          variables: {
            // Main content variables
            TITLE: mainTitle,
            CONTENT: mainContent.substring(0, 200), // Limit to prevent overflow
            CTA: "Desliza para ver más →",

            // Label and categorization
            LABEL: slideNumber === 1 ? "Nuevo" : `Paso ${slideNumber || 1}`,
            CATEGORY: topic.split(" ")[0] || "Contenido",

            // Tags for glassmorphism and similar templates
            TAG1: slideNumber === 1 ? "Inicio" : "Tip",
            TAG2: "Info",
            TAG3: "Importante",

            // Big number for split layouts
            BIG_NUMBER: slideNumber ? `${slideNumber}` : "1",
            BIG_LABEL: "PASO",

            // Bullet points for timeline templates
            POINT1: point1 || mainTitle,
            POINT2: point2 || mainContent.substring(0, 100),
            POINT3: point3 || (mainContent.length > 100 ? mainContent.substring(100, 200) : "Más información"),

            // Date for updates
            DATE: new Date().toLocaleDateString("es-ES", { month: "short", day: "numeric" }),

            // Metrics for data viz templates
            METRIC1: "85%",
            LABEL1: "Efectividad",
            METRIC2: "2.5x",
            LABEL2: "ROI",
            METRIC3: "10K+",
            LABEL3: "Alcance",
          },
        }),
      })

      if (!response.ok) {
        console.error("Error rendering template")
        return null
      }

      const { html } = await response.json()

      console.log("📄 Rendered HTML preview:", html.substring(0, 200))

      // Create temporary DOM element
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html
      tempDiv.style.position = "absolute"
      tempDiv.style.left = "-9999px"
      tempDiv.style.top = "0"
      document.body.appendChild(tempDiv)

      // Find the actual content div (skip <style> tags)
      // The HTML structure is: <style>...</style><div>content</div>
      // So we need to find the first DIV element, not the first child
      const contentDiv = tempDiv.querySelector("div")

      if (!contentDiv) {
        console.error("❌ No content div found in template HTML")
        document.body.removeChild(tempDiv)
        return null
      }

      console.log("✅ Found content div, rendering to image...")

      // Wait for fonts to load
      // Check if there are any @import font declarations and wait for them
      try {
        await document.fonts.ready
        console.log("✅ Fonts loaded")
      } catch (e) {
        console.warn("⚠️ Font loading check failed, continuing anyway")
      }

      // Additional wait for any async font loading
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Convert to PNG using the content div (not the style tag)
      const dataUrl = await toPng(contentDiv as HTMLElement, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: false, // Ensure fonts are embedded
      })

      // Cleanup
      document.body.removeChild(tempDiv)

      return dataUrl
    } catch (error) {
      console.error("Error converting template to image:", error)
      return null
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Por favor ingresa un tema para el carrusel")
      return
    }

    // Crear tarea en segundo plano
    const taskId = addTask({
      type: "generate-carousel",
      title: `Generando carrusel: ${topic}`,
      description: selectedStructure || "Estructura automática",
      status: "running",
      progress: 0,
    })

    setGenerating(true)

    try {
      // Step 1: Generate carousel content
      updateTask(taskId, { progress: 10, description: "Generando contenido con IA..." })

      // Get selected product info if any
      const selectedProduct = selectedProductId && selectedProductId !== "none"
        ? products.find((p) => p.id === selectedProductId)
        : null

      const productInfo = selectedProduct
        ? {
            name: selectedProduct.name,
            description: selectedProduct.description,
            shortDescription: selectedProduct.shortDescription,
            category: selectedProduct.category,
            price: selectedProduct.price,
            currency: selectedProduct.currency,
            features: selectedProduct.features,
            targetAudience: selectedProduct.targetAudience,
            productUrl: selectedProduct.productUrl,
          }
        : undefined

      const response = await fetch("/api/ai/generate-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          structureName: selectedStructure || undefined,
          productInfo,
          controversyLevel,
          targetAudience: targetAudience || undefined,
          language,
          tone,
          includeImages: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al generar carrusel")
      }

      const data = await response.json()
      const carousel = data.carousel

      updateTask(taskId, { progress: 30, description: "Contenido generado. Creando imágenes..." })

      setGenerating(false)
      setGeneratingImages(true)
      toast.success(`¡Carrusel generado! Generando imágenes...`)

      // Step 2: Generate images for carousel slides
      try {
        let imageUrls: string[] = []

        if (imageSource === "unsplash-edited") {
          // Generate edited Unsplash images with text overlay + logo
          updateTask(taskId, { progress: 40, description: "Obteniendo imágenes de Unsplash..." })
          const dataUrls: string[] = []

          for (let i = 0; i < carousel.slides.length; i++) {
            const slide = carousel.slides[i]

            // Update progress for each slide
            const slideProgress = 40 + Math.floor((i / carousel.slides.length) * 30)
            updateTask(taskId, {
              progress: slideProgress,
              description: `Procesando slide ${i + 1}/${carousel.slides.length}...`
            })

            // Fetch Unsplash image
            const unsplashQuery = slide.imagePrompt || topic
            let unsplashUrl: string | null = null

            try {
              const unsplashResponse = await fetch(
                `https://api.unsplash.com/photos/random?query=${encodeURIComponent(unsplashQuery)}&orientation=squarish&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "tsFhWw9eyQ5iIiumx-J7tiwDalo4_cGbSB-3NzkQyNg"}`
              )
              if (unsplashResponse.ok) {
                const unsplashData = await unsplashResponse.json()
                unsplashUrl = unsplashData.urls?.regular
              }
            } catch (error) {
              console.error("Error fetching Unsplash:", error)
            }

            if (!unsplashUrl) {
              // Fallback to gradient if Unsplash fails
              dataUrls.push("")
              continue
            }

            // Create canvas with Unsplash image + text overlay
            const canvas = document.createElement("canvas")
            canvas.width = 1080
            canvas.height = 1080
            const ctx = canvas.getContext("2d")

            if (!ctx) {
              dataUrls.push("")
              continue
            }

            // Load Unsplash image
            const img = new Image()
            img.crossOrigin = "anonymous"

            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                // Draw image (cover fit)
                const imgAspect = img.width / img.height
                const canvasAspect = 1
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0

                if (imgAspect > canvasAspect) {
                  drawHeight = 1080
                  drawWidth = drawHeight * imgAspect
                  offsetX = -(drawWidth - 1080) / 2
                } else {
                  drawWidth = 1080
                  drawHeight = drawWidth / imgAspect
                  offsetY = -(drawHeight - 1080) / 2
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

                // Add dark overlay for text visibility
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
                ctx.fillRect(0, 0, 1080, 1080)

                // Add text
                ctx.fillStyle = "#FFFFFF"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"

                // Title
                if (slide.title) {
                  ctx.font = "bold 72px Inter, sans-serif"
                  const titleLines = wrapText(ctx, slide.title, 900)
                  titleLines.forEach((line, index) => {
                    ctx.fillText(line, 540, 400 + index * 80)
                  })
                }

                // Content
                ctx.font = "500 36px Inter, sans-serif"
                const contentLines = wrapText(ctx, slide.content, 900)
                const startY = slide.title ? 600 : 480
                contentLines.forEach((line, index) => {
                  ctx.fillText(line, 540, startY + index * 48)
                })

                resolve()
              }
              img.onerror = reject
              img.src = unsplashUrl!
            })

            // Get base64 data URL
            let dataUrl = canvas.toDataURL("image/png")

            // Add logo overlay if available
            if (brandData?.logoUrl) {
              try {
                dataUrl = await addLogoToImage(dataUrl, brandData.logoUrl, "bottom-right", 100, 40)
              } catch (error) {
                console.error("Error adding logo:", error)
              }
            }

            dataUrls.push(dataUrl)
          }

          // Upload to Cloudinary
          updateTask(taskId, { progress: 70, description: "Subiendo imágenes a Cloudinary..." })
          toast.info("Subiendo imágenes editadas a Cloudinary...")

          try {
            const uploadResponse = await fetch("/api/upload/data-urls", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                dataUrls: dataUrls.filter(url => url !== ""),
                fileNamePrefix: `carousel-unsplash-${topic.replace(/\s+/g, "-")}`,
              }),
            })

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              imageUrls = uploadData.urls
            } else {
              throw new Error("Upload failed")
            }
          } catch (error) {
            console.error("Error uploading:", error)
            toast.error("Error al subir imágenes")
            imageUrls = dataUrls
          }

          updateTask(taskId, { progress: 85, description: "Finalizando..." })

          carousel.imageUrls = imageUrls
          setGeneratedCarousel(carousel)
          setCurrentSlide(0)
          toast.success(`¡Carrusel con ${imageUrls.length} imágenes de Unsplash editadas!`)
        } else if (imageSource === "template" && selectedTemplateId) {
          // Generate images locally with templates
          updateTask(taskId, { progress: 40, description: "Generando imágenes con plantillas..." })
          const dataUrls: string[] = []

          for (let i = 0; i < carousel.slides.length; i++) {
            const slide = carousel.slides[i]

            // Update progress for each slide
            const slideProgress = 40 + Math.floor((i / carousel.slides.length) * 30)
            updateTask(taskId, {
              progress: slideProgress,
              description: `Renderizando slide ${i + 1}/${carousel.slides.length}...`
            })

            // Determine which template to use
            const templateToUse = rotateTemplates && availableTemplates.length > 0
              ? availableTemplates[i % availableTemplates.length].id
              : selectedTemplateId

            // Use slide title and content from the AI-generated carousel
            // NEVER use generic placeholders like "Slide X"
            let imageDataUrl = await renderTemplateToImage(
              slide.title || "",  // Pass empty string if no title, function will extract from content
              slide.content || "",
              templateToUse,
              i + 1  // Pass slide number
            )

            // Add logo overlay if available (bottom-right to avoid Instagram page counter)
            if (imageDataUrl && brandData?.logoUrl) {
              try {
                imageDataUrl = await addLogoToImage(imageDataUrl, brandData.logoUrl, "bottom-right", 100, 40)
                console.log(`✅ Logo agregado al slide ${i + 1} (bottom-right)`)
              } catch (error) {
                console.error(`Error agregando logo al slide ${i + 1}:`, error)
                // Continue with original image if logo fails
              }
            }

            if (imageDataUrl) {
              dataUrls.push(imageDataUrl)
            } else {
              dataUrls.push("")
            }
          }

          // Upload data URLs to Cloudinary to get public HTTPS URLs
          updateTask(taskId, { progress: 70, description: "Subiendo imágenes a Cloudinary..." })
          console.log("📤 Subiendo imágenes a Cloudinary...", { count: dataUrls.length })
          toast.info("Subiendo imágenes a Cloudinary...")

          try {
            const uploadResponse = await fetch("/api/upload/data-urls", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                dataUrls: dataUrls.filter(url => url !== ""),
                fileNamePrefix: `carousel-${topic.replace(/\s+/g, "-")}`,
              }),
            })

            if (!uploadResponse.ok) {
              throw new Error("Error al subir imágenes a Cloudinary")
            }

            const uploadData = await uploadResponse.json()
            imageUrls = uploadData.urls

            console.log("✅ Imágenes subidas a Cloudinary:", imageUrls)
          } catch (uploadError: any) {
            console.error("Error subiendo a Cloudinary:", uploadError)
            toast.error("Error al subir imágenes. Usando data URLs locales (no funcionarán en Instagram).")
            imageUrls = dataUrls // Fallback to data URLs (won't work for Instagram)
          }

          updateTask(taskId, { progress: 85, description: "Finalizando..." })

          carousel.imageUrls = imageUrls
          setGeneratedCarousel(carousel)
          setCurrentSlide(0)
          toast.success(`¡Carrusel completo con ${imageUrls.length} imágenes generadas y subidas!`)
        } else {
          // Original API-based image generation
          updateTask(taskId, { progress: 40, description: "Generando imágenes en el servidor..." })

          const imagesResponse = await fetch("/api/ai/generate-carousel-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slides: carousel.slides,
              companyInfo: {
                name: brandData?.brandName || "Tu Marca",
                industry: topic,
              },
              imageSource,
            }),
          })

          if (!imagesResponse.ok) {
            throw new Error("Error al generar imágenes")
          }

          updateTask(taskId, { progress: 70, description: "Procesando imágenes..." })

          const imagesData = await imagesResponse.json()

          // Map image URLs to carousel
          imageUrls = imagesData.images
            .sort((a: any, b: any) => a.slideNumber - b.slideNumber)
            .map((img: any) => img.imageUrl)

          updateTask(taskId, { progress: 85, description: "Finalizando..." })

          carousel.imageUrls = imageUrls
          setGeneratedCarousel(carousel)
          setCurrentSlide(0)
          toast.success(`¡Carrusel completo con ${imagesData.summary.generated} imágenes generadas!`)
        }

        // Auto-save to history
        if (brandData) {
          try {
            updateTask(taskId, { progress: 90, description: "Guardando en historial..." })
            console.log("=== Auto-guardando carrusel en historial ===")
            console.log("brandData:", brandData)
            console.log("topic:", topic)

            const saveResponse = await fetch("/api/ai/save-generated-posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                brandId: brandData.brandId,
                batchId: `carousel-${Date.now()}`,
                posts: [{
                  id: `carousel-${Date.now()}`,
                  title: `Carrusel: ${topic}`,
                  type: "CAROUSEL",
                  content: carousel.caption,
                  hashtags: carousel.hashtags,
                  imageUrl: imageUrls[0] || null,
                  platform: "INSTAGRAM",
                  metadata: {
                    structure: carousel.structure.name,
                    slides: carousel.slides,
                    imageUrls,
                    language,
                    tone,
                  },
                }],
                language,
                tone,
              }),
            })

            if (saveResponse.ok) {
              const savedData = await saveResponse.json()
              console.log("✅ Carrusel guardado automáticamente:", savedData)
              toast.success("Carrusel guardado en el historial")
            } else {
              const errorData = await saveResponse.json()
              console.error("❌ Error al auto-guardar:", errorData)
            }
          } catch (saveError) {
            console.error("❌ Excepción al auto-guardar:", saveError)
          }
        } else {
          console.warn("⚠️ No hay brandData, no se puede auto-guardar")
        }

        // Marcar tarea como completada y guardar el resultado
        updateTask(taskId, {
          status: "completed",
          progress: 100,
          description: "Carrusel generado exitosamente",
          result: {
            carousel: {
              ...carousel,
              imageUrls
            },
            topic
          }
        })
      } catch (imageError: any) {
        // Even if images fail, show the carousel without images
        setGeneratedCarousel(carousel)
        setCurrentSlide(0)
        toast.warning("Carrusel generado, pero hubo un error al generar las imágenes")
        console.error(imageError)

        // Marcar tarea como completada con advertencia
        updateTask(taskId, {
          status: "completed",
          progress: 100,
          description: "Generado (sin imágenes)"
        })
      }
    } catch (error: any) {
      toast.error(error.message || "Error al generar el carrusel")
      console.error(error)

      // Marcar tarea como error
      updateTask(taskId, {
        status: "error",
        error: error.message || "Error al generar el carrusel"
      })
    } finally {
      setGenerating(false)
      setGeneratingImages(false)
    }
  }

  const handlePrevSlide = () => {
    if (!generatedCarousel) return
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : generatedCarousel.slides.length - 1))
  }

  const handleNextSlide = () => {
    if (!generatedCarousel) return
    setCurrentSlide((prev) => (prev < generatedCarousel.slides.length - 1 ? prev + 1 : 0))
  }

  const handleDeleteSlide = (slideIndex: number) => {
    if (!generatedCarousel) return

    // No permitir eliminar si solo queda 1 slide
    if (generatedCarousel.slides.length <= 1) {
      toast.error("No puedes eliminar el único slide restante")
      return
    }

    // Crear nuevos arrays sin el slide eliminado
    const newSlides = generatedCarousel.slides.filter((_, idx) => idx !== slideIndex)
    const newImageUrls = generatedCarousel.imageUrls?.filter((_, idx) => idx !== slideIndex) || []

    // Actualizar el carrusel
    setGeneratedCarousel({
      ...generatedCarousel,
      slides: newSlides,
      imageUrls: newImageUrls,
    })

    // Ajustar currentSlide si es necesario
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1)
    } else if (currentSlide === slideIndex && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }

    toast.success("Slide eliminado")
  }

  const handleSaveToHistory = async () => {
    if (!generatedCarousel) {
      toast.error("No hay carrusel generado para guardar")
      return
    }

    if (!brandData) {
      toast.error("No se pudo obtener información de la marca")
      return
    }

    setSaving(true)

    try {
      console.log("Guardando carrusel en historial...", {
        brandId: brandData.brandId,
        topic,
        slidesCount: generatedCarousel.slides.length,
        imagesCount: generatedCarousel.imageUrls?.length || 0,
      })

      const saveResponse = await fetch("/api/ai/save-generated-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: brandData.brandId,
          batchId: `carousel-${Date.now()}`,
          posts: [{
            id: `carousel-${Date.now()}`,
            title: `Carrusel: ${topic}`,
            type: "CAROUSEL",
            content: generatedCarousel.caption,
            hashtags: generatedCarousel.hashtags,
            imageUrl: generatedCarousel.imageUrls?.[0] || null,
            platform: "INSTAGRAM",
            metadata: {
              structure: generatedCarousel.structure.name,
              slides: generatedCarousel.slides,
              imageUrls: generatedCarousel.imageUrls || [],
              language,
              tone,
            },
          }],
          language,
          tone,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        console.error("Error al guardar en historial:", errorData)
        throw new Error(errorData.error || "Error al guardar")
      }

      const savedData = await saveResponse.json()
      console.log("Carrusel guardado exitosamente:", savedData)
      toast.success("¡Carrusel guardado en el historial!")
    } catch (error: any) {
      console.error("Excepción al guardar:", error)
      toast.error(error.message || "Error al guardar en el historial")
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!generatedCarousel || !generatedCarousel.imageUrls || generatedCarousel.imageUrls.length === 0) {
      toast.error("No hay imágenes generadas para publicar")
      return
    }

    if (!brandData || !brandData.instagramAccountId) {
      toast.error("No hay cuenta de Instagram conectada")
      return
    }

    // Crear tarea en segundo plano
    const taskId = addTask({
      type: "publish-instagram",
      title: "Publicando en Instagram",
      description: `${generatedCarousel.slides.length} slides`,
      status: "running",
      progress: 0,
    })

    setPublishing(true)

    try {
      updateTask(taskId, { progress: 20, description: "Preparando publicación..." })

      // Transform image URLs to the format expected by the API
      const items = generatedCarousel.imageUrls.map((url) => ({
        imageUrl: url,
      }))

      updateTask(taskId, { progress: 50, description: "Subiendo a Instagram..." })

      const response = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "carousel",
          brandId: brandData.brandId,
          socialAccountId: brandData.instagramAccountId,
          items,
          caption: generatedCarousel.caption,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Error al publicar:", error)
        throw new Error(error.error || "Error al publicar")
      }

      updateTask(taskId, {
        status: "completed",
        progress: 100,
        description: "Publicado exitosamente"
      })

      toast.success("¡Carrusel publicado exitosamente en Instagram!")
    } catch (error: any) {
      updateTask(taskId, {
        status: "error",
        error: error.message || "Error al publicar"
      })

      toast.error(error.message || "Error al publicar el carrusel")
      console.error("Error completo:", error)
    } finally {
      setPublishing(false)
    }
  }

  if (loadingStructures) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (generatedCarousel) {
    const currentSlideData = generatedCarousel.slides[currentSlide]

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Layers className="h-8 w-8 text-primary" />
                Carrusel Generado
              </h1>
              <p className="text-muted-foreground mt-1">
                Estructura: {generatedCarousel.structure.name}
              </p>
            </div>
            <Button variant="outline" onClick={() => setGeneratedCarousel(null)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Generar Nuevo
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slide Viewer */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Slide {currentSlide + 1} de {generatedCarousel.slides.length}
                    </CardTitle>
                    <Badge variant="secondary">{generatedCarousel.structure.name}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Slide Content */}
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden relative">
                    {generatingImages ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Generando imágenes...</p>
                      </div>
                    ) : generatedCarousel.imageUrls && generatedCarousel.imageUrls[currentSlide] ? (
                      <img
                        src={generatedCarousel.imageUrls[currentSlide]}
                        alt={`Slide ${currentSlide + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                        {currentSlideData.title && (
                          <h2 className="text-2xl font-bold mb-4">{currentSlideData.title}</h2>
                        )}
                        <p className="text-lg leading-relaxed">{currentSlideData.content}</p>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={handlePrevSlide}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Anterior
                    </Button>

                    <div className="flex gap-1">
                      {generatedCarousel.slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentSlide
                              ? "bg-primary w-8"
                              : "bg-muted w-2"
                          }`}
                        />
                      ))}
                    </div>

                    <Button variant="outline" onClick={handleNextSlide}>
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  {/* Design Notes */}
                  {currentSlideData.designNotes && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Notas de diseño:</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentSlideData.designNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Prompt */}
                  {currentSlideData.imagePrompt && (
                    <div className="bg-accent/10 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Prompt de imagen:</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentSlideData.imagePrompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Details Panel */}
            <div className="space-y-4">
              {/* Caption */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Caption</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{generatedCarousel.caption}</p>
                </CardContent>
              </Card>

              {/* Hashtags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hashtags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {generatedCarousel.hashtags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Slides Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Todos los Slides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {generatedCarousel.slides.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`relative w-full rounded-lg border transition-all ${
                        idx === currentSlide
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <button
                        onClick={() => setCurrentSlide(idx)}
                        className="w-full text-left p-3"
                      >
                        <div className="flex items-start gap-2 pr-8">
                          <span className="font-bold text-primary">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            {slide.title && (
                              <p className="font-medium text-sm truncate">{slide.title}</p>
                            )}
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {slide.content}
                            </p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSlide(idx)
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar slide"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleSaveToHistory}
                  disabled={saving || !brandData}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Guardar en Historial
                    </>
                  )}
                </Button>
                <Button
                  className="w-full"
                  onClick={handlePublish}
                  disabled={
                    publishing ||
                    generatingImages ||
                    !generatedCarousel.imageUrls ||
                    generatedCarousel.imageUrls.length === 0 ||
                    !brandData ||
                    !brandData.instagramAccountId
                  }
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : !brandData || !brandData.instagramAccountId ? (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Conecta Instagram primero
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar en Instagram
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Generation Form
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Layers className="h-10 w-10 text-primary" />
            Generador de Carruseles
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Crea carruseles virales con estructuras probadas para máximo engagement
          </p>
        </div>

        {/* Topic Input */}
        <Card>
          <CardHeader>
            <CardTitle>Tema del Carrusel</CardTitle>
            <CardDescription>
              {brandData?.industry ? (
                <>
                  Tu sector: <Badge variant="outline" className="ml-1">{brandData.industry}</Badge>
                  {" "}- ¿Sobre qué tema específico quieres crear el carrusel?
                </>
              ) : (
                "¿Sobre qué quieres crear tu carrusel?"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={
                brandData?.industry
                  ? `Ej: ${getTopicSuggestion(brandData.industry)}`
                  : "Ej: 5 estrategias de marketing digital para 2025"
              }
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-lg"
            />

            {brandData?.industry && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">💡 Sugerencias para {brandData.industry}:</Label>
                <div className="flex flex-wrap gap-2">
                  {getTopicSuggestions(brandData.industry).map((suggestion, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setTopic(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Structure Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Estructura del Carrusel</CardTitle>
            <CardDescription>
              Selecciona una estructura probada o deja que la IA elija la mejor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedStructure} onValueChange={setSelectedStructure}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="" id="random" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="random" className="font-medium cursor-pointer">
                      🎲 Dejar que la IA elija la mejor estructura
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recomendado: La IA seleccionará la estructura más efectiva para tu tema
                    </p>
                  </div>
                </div>

                {structures.map((structure) => (
                  <div
                    key={structure.name}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
                  >
                    <RadioGroupItem value={structure.name} id={structure.name} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={structure.name} className="font-medium cursor-pointer">
                        {structure.name}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {structure.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {structure.slideCount} slides
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {structure.purpose}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Language */}
              <div className="space-y-2">
                <Label>Idioma</Label>
                <div className="flex gap-2">
                  {LANGUAGES.map((lang) => (
                    <Badge
                      key={lang.id}
                      variant={language === lang.id ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => setLanguage(lang.id)}
                    >
                      {lang.emoji} {lang.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label>Tono</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id as any)}
                      className={`p-2 rounded-lg border-2 text-center transition-all ${
                        tone === t.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium text-sm">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Producto (Opcional)
            </CardTitle>
            <CardDescription>
              Selecciona un producto para crear contenido enfocado específicamente en él
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin producto (contenido general)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin producto (contenido general)</SelectItem>
                  {products.filter(p => p.isActive).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                      {product.category && ` - ${product.category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  No tienes productos creados aún
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/personal/products", "_blank")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Producto
                </Button>
              </div>
            )}

            {selectedProductId && selectedProductId !== "none" && products.find(p => p.id === selectedProductId) && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm">
                  {products.find(p => p.id === selectedProductId)?.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {products.find(p => p.id === selectedProductId)?.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Configuración Avanzada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Controversy Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Nivel de Controversia
                </Label>
                <Badge variant="secondary">{controversyLevel}/10</Badge>
              </div>
              <Slider
                value={[controversyLevel]}
                onValueChange={(value) => setControversyLevel(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservador</span>
                <span>Moderado</span>
                <span>Provocativo</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {controversyLevel <= 3 && "Contenido seguro y conservador"}
                {controversyLevel >= 4 && controversyLevel <= 6 && "Opiniones moderadas, sin extremos"}
                {controversyLevel >= 7 && controversyLevel <= 8 && "Contenido provocativo que genera debate"}
                {controversyLevel >= 9 && "Altamente controversial, cuestiona el status quo"}
              </p>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Audiencia Objetivo (Opcional)
              </Label>
              <Textarea
                placeholder="Ej: Emprendedores entre 25-40 años interesados en marketing digital..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Especifica tu audiencia objetivo para personalizar aún más el contenido
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image Source Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🖼️ Fuente de Imágenes</CardTitle>
            <CardDescription>Elige cómo generar las imágenes para las diapositivas</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={imageSource} onValueChange={(value: any) => setImageSource(value)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="unsplash" id="unsplash" />
                  <div className="flex-1">
                    <Label htmlFor="unsplash" className="font-medium cursor-pointer">
                      📷 Fotos de Unsplash
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Imágenes profesionales relacionadas con el tema
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="unsplash-edited" id="unsplash-edited" />
                  <div className="flex-1">
                    <Label htmlFor="unsplash-edited" className="font-medium cursor-pointer">
                      🖼️ Unsplash Editadas
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fotos de Unsplash con texto overlay y logo
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all">
                  <RadioGroupItem value="template" id="template" />
                  <div className="flex-1">
                    <Label htmlFor="template" className="font-medium cursor-pointer">
                      ✨ Usar Plantilla ⭐
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Plantilla HTML personalizada
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {/* Template Selection */}
            {imageSource === "template" && (
              <div className="mt-4 space-y-3">
                {availableTemplates.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      No tienes plantillas aún
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open("/personal/templates", "_blank")}
                    >
                      Crear Plantillas
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="template-select" className="text-sm font-medium">
                        Selecciona una Plantilla
                      </Label>
                      <select
                        id="template-select"
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      >
                        {availableTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="rotate-templates"
                        checked={rotateTemplates}
                        onChange={(e) => setRotateTemplates(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="rotate-templates" className="text-sm cursor-pointer">
                        Rotar entre todas las plantillas
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rotateTemplates
                        ? "Cada diapositiva usará una plantilla diferente"
                        : "Todas las diapositivas usarán la misma plantilla"}
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button onClick={handleGenerate} disabled={generating || generatingImages || !topic.trim()} size="lg" className="w-full">
          {generating || generatingImages ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {generating ? "Generando carrusel..." : "Generando imágenes..."}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generar Carrusel con IA
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
