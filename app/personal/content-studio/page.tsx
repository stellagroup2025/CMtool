"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Loader2,
  Rocket,
  CheckCircle2,
  ImageIcon,
  Palette,
  Settings,
  Layers,
  FileText,
  BarChart3,
  Zap,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { getPersonalBrandData } from "./actions"
import { WINNING_CAROUSEL_STRUCTURES } from "@/lib/carousel-structures"
import { toPng } from "html-to-image"

const PLATFORMS = [
  { id: "INSTAGRAM", name: "Instagram", emoji: "📸" },
  { id: "FACEBOOK", name: "Facebook", emoji: "👍" },
  { id: "X", name: "X", emoji: "🐦" },
  { id: "LINKEDIN", name: "LinkedIn", emoji: "💼" },
]

const TONES = [
  { id: "professional", label: "Profesional" },
  { id: "casual", label: "Casual" },
  { id: "provocative", label: "Provocativo" },
  { id: "inspirational", label: "Inspirador" },
]

const LANGUAGES = [
  { id: "es", label: "Español", emoji: "🇪🇸" },
  { id: "en", label: "English", emoji: "🇺🇸" },
  { id: "fr", label: "Français", emoji: "🇫🇷" },
  { id: "de", label: "Deutsch", emoji: "🇩🇪" },
  { id: "it", label: "Italiano", emoji: "🇮🇹" },
  { id: "pt", label: "Português", emoji: "🇵🇹" },
]

const CONTENT_TYPES = [
  { id: "post", label: "Publicación Simple", description: "Un solo post con imagen y texto" },
  { id: "carousel", label: "Carrusel", description: "Múltiples slides con estructura definida" },
]

const IMAGE_SOURCES = [
  { id: "none", label: "Sin imagen", description: "Solo texto" },
  { id: "template", label: "Usar Plantilla", description: "Plantilla HTML personalizada" },
  { id: "unsplash", label: "Unsplash Simple", description: "Foto directa de Unsplash" },
  { id: "unsplash-designed", label: "Unsplash Diseñado", description: "Foto con overlay de marca" },
  { id: "ai", label: "IA Generada", description: "Imagen generada con IA" },
  { id: "gradient", label: "Gradiente", description: "Fondo de gradiente con texto" },
]

const IMAGE_STYLES = [
  "modern and professional",
  "minimalist and clean",
  "bold and colorful",
  "tech-focused and futuristic",
]

export default function ContentStudioPage() {
  const [step, setStep] = useState<"config" | "generating" | "review">("config")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // === CONFIGURACIÓN BÁSICA ===
  const [contentType, setContentType] = useState<"post" | "carousel">("post")
  const [quantity, setQuantity] = useState(1)
  const [platform, setPlatform] = useState("INSTAGRAM")
  const [language, setLanguage] = useState("es")
  const [tone, setTone] = useState<"professional" | "casual" | "provocative" | "inspirational">("professional")

  // === ANÁLISIS DE SECTOR ===
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [description, setDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState("")

  // === CONFIGURACIÓN DE CONTENIDO ===
  const [controversyLevel, setControversyLevel] = useState([5])
  const [carouselStructure, setCarouselStructure] = useState<string>("")

  // === CONFIGURACIÓN DE IMÁGENES ===
  const [imageSource, setImageSource] = useState<"none" | "template" | "unsplash" | "unsplash-designed" | "ai" | "gradient">("unsplash-designed")
  const [imageStyle, setImageStyle] = useState("modern and professional")

  // === PLANTILLAS ===
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")

  // === DATOS GENERADOS ===
  const [generatedContent, setGeneratedContent] = useState<any[]>([])
  const [selectedContent, setSelectedContent] = useState<Set<string>>(new Set())
  const [publishingItems, setPublishingItems] = useState<Set<string>>(new Set())
  const [publishedItems, setPublishedItems] = useState<Set<string>>(new Set())

  // === INSTAGRAM ACCOUNT ===
  const [brandId, setBrandId] = useState<string | null>(null)
  const [brandName, setBrandName] = useState<string>("")
  const [socialAccountId, setSocialAccountId] = useState<string | null>(null)
  const [loadingAccount, setLoadingAccount] = useState(true)

  // Cargar datos de la marca
  useEffect(() => {
    let mounted = true

    getPersonalBrandData()
      .then((result) => {
        if (!mounted) return

        if (result.success) {
          setBrandId(result.brandId)
          setBrandName(result.brandName || "")
          setCompanyName(result.brandName || "")
          if (result.instagramAccount) {
            setSocialAccountId(result.instagramAccount.id)
          }
        } else {
          toast.error(result.error || "Error al cargar datos de la marca")
        }
      })
      .catch((error) => {
        if (!mounted) return
        console.error("Error loading brand data:", error)
        toast.error("Error al cargar datos de la marca")
      })
      .finally(() => {
        if (mounted) {
          setLoadingAccount(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  // Cargar plantillas cuando imageSource es 'template'
  useEffect(() => {
    if (imageSource === "template") {
      loadTemplates()
    }
  }, [imageSource])

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/personal/generate-templates")
      if (response.ok) {
        const data = await response.json()
        setAvailableTemplates(data.templates || [])
        if (data.templates && data.templates.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(data.templates[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading templates:", error)
      toast.error("Error al cargar plantillas")
    }
  }

  const renderTemplateToImage = async (title: string, content: string): Promise<string | null> => {
    try {
      console.log("🎨 renderTemplateToImage called with:", { title, content, selectedTemplateId })

      if (!selectedTemplateId) {
        console.error("❌ No selectedTemplateId")
        return null
      }

      // Get populated HTML from API
      console.log("📡 Fetching template render from API...")
      const response = await fetch("/api/personal/templates/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          variables: {
            TITLE: title,
            CONTENT: content,
          },
        }),
      })

      if (!response.ok) {
        console.error("❌ Template render API failed:", response.status)
        throw new Error("Failed to render template")
      }

      const { html } = await response.json()
      console.log("✅ Got HTML from API, length:", html?.length)

      // Create temporary element
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html
      tempDiv.style.position = "absolute"
      tempDiv.style.left = "-9999px"
      tempDiv.style.top = "0"
      document.body.appendChild(tempDiv)
      console.log("📄 Temporary element created and added to DOM")

      // Wait for fonts and images to load
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log("⏱️ Waited for fonts/images")

      // Convert to image
      console.log("🖼️ Converting to PNG...")
      const dataUrl = await toPng(tempDiv.firstChild as HTMLElement, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
      })
      console.log("✅ Image generated, data URL length:", dataUrl?.length)

      // Cleanup
      document.body.removeChild(tempDiv)
      console.log("🧹 Cleaned up temporary element")

      return dataUrl
    } catch (error) {
      console.error("❌ Error rendering template to image:", error)
      return null
    }
  }

  const handleGenerate = async () => {
    if (!companyName.trim() || !industry.trim()) {
      toast.error("Por favor completa nombre de empresa e industria")
      return
    }

    if (contentType === "carousel" && !carouselStructure) {
      toast.error("Por favor selecciona una estructura de carrusel")
      return
    }

    setLoading(true)
    setProgress(0)
    setStep("generating")

    try {
      if (contentType === "post") {
        await generatePosts()
      } else {
        await generateCarousels()
      }
    } catch (error: any) {
      console.error("Error generating content:", error)
      toast.error(error.message || "Error al generar contenido")
      setStep("config")
    } finally {
      setLoading(false)
      setProgress(100)
    }
  }

  const generatePosts = async () => {
    const companyInfo = {
      name: companyName,
      industry,
      description,
      targetAudience,
    }

    setProgress(20)

    const response = await fetch("/api/ai/generate-batch-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyInfo,
        quantity,
        platform,
        language,
        tone,
        controversyLevel: controversyLevel[0],
        imageSource,
        imageStyle,
        includeImages: imageSource !== "none",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al generar publicaciones")
    }

    const data = await response.json()
    setProgress(60)

    // Generar imágenes si es necesario
    if (imageSource !== "none" && data.posts) {
      const postsWithImages = await generateImagesForPosts(data.posts)
      setGeneratedContent(postsWithImages)
    } else {
      setGeneratedContent(data.posts || [])
    }

    setProgress(100)
    setStep("review")
    toast.success(`${data.posts?.length || 0} publicaciones generadas exitosamente`)
  }

  const generateCarousels = async () => {
    const companyInfo = {
      name: companyName,
      industry,
      description,
      targetAudience,
    }

    const carousels = []

    for (let i = 0; i < quantity; i++) {
      setProgress(((i + 1) / quantity) * 90)

      // Generar carrusel
      const response = await fetch("/api/ai/generate-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `${industry} - Post ${i + 1}`,
          structureName: carouselStructure,
          companyInfo,
          language,
          tone,
          platform,
          includeImages: imageSource !== "none",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al generar carrusel")
      }

      const data = await response.json()

      if (!data.success || !data.carousel) {
        throw new Error("Respuesta inválida del servidor")
      }

      const carousel = data.carousel

      // Generar imágenes para el carrusel
      let imageUrls: string[] = []
      if (imageSource !== "none" && carousel.slides) {
        console.log("🖼️ Requesting carousel images with imageSource:", imageSource)
        const imageResponse = await fetch("/api/ai/generate-carousel-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slides: carousel.slides,
            companyInfo,
            imageSource,
            imageStyle,
          }),
        })

        console.log("📡 Image response status:", imageResponse.status)

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          console.log("✅ Image data received:", imageData)
          imageUrls = imageData.imageUrls || []
          console.log("🎨 Image URLs count:", imageUrls.length)
        } else {
          const errorData = await imageResponse.json().catch(() => ({}))
          console.error("❌ Image generation failed:", errorData)
        }
      } else {
        console.log("⚠️ Skipping image generation:", { imageSource, hasSlides: !!carousel.slides })
      }

      carousels.push({
        id: `carousel-${Date.now()}-${i}`,
        type: "CAROUSEL",
        title: `Carrusel: ${carousel.structure.name}`,
        content: carousel.caption,
        hashtags: carousel.hashtags,
        platform,
        metadata: {
          structure: carousel.structure.name,
          slides: carousel.slides,
          imageUrls,
        },
      })
    }

    setGeneratedContent(carousels)
    setProgress(100)
    setStep("review")
    toast.success(`${carousels.length} carruseles generados exitosamente`)
  }

  const generateImagesForPosts = async (posts: any[]) => {
    console.log("🖼️ generateImagesForPosts called with imageSource:", imageSource, "posts:", posts.length)
    const postsWithImages = []

    for (const post of posts) {
      // Si se seleccionó plantilla, usar renderTemplateToImage
      if (imageSource === "template") {
        console.log("📝 Processing post with template:", post.title)
        const imageDataUrl = await renderTemplateToImage(
          post.title || "Post",
          post.content || ""
        )

        if (imageDataUrl) {
          console.log("✅ Image URL generated for post:", post.title)
          postsWithImages.push({
            ...post,
            imageUrl: imageDataUrl,
          })
        } else {
          postsWithImages.push(post)
        }
      } else {
        // Lógica original para otras fuentes de imagen
        const imageResponse = await fetch("/api/ai/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: post.content,
            companyName,
            imageSource,
            imageStyle,
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          postsWithImages.push({
            ...post,
            imageUrl: imageData.imageUrl,
          })
        } else {
          postsWithImages.push(post)
        }
      }
    }

    return postsWithImages
  }

  const handleSaveToHistory = async () => {
    if (!brandId || generatedContent.length === 0) {
      toast.error("No hay contenido para guardar")
      return
    }

    try {
      const response = await fetch("/api/ai/save-generated-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          batchId: `content-studio-${Date.now()}`,
          posts: generatedContent,
          language,
          tone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar")
      }

      toast.success("Contenido guardado en el historial")
    } catch (error: any) {
      console.error("Error saving content:", error)
      toast.error(error.message || "Error al guardar contenido")
    }
  }

  const handlePublishItem = async (item: any, index: number) => {
    if (!socialAccountId || !brandId) {
      toast.error("No hay cuenta de Instagram conectada")
      return
    }

    const itemId = item.id || `item-${index}`

    if (publishedItems.has(itemId)) {
      toast.info("Este contenido ya fue publicado")
      return
    }

    setPublishingItems(prev => new Set(prev).add(itemId))

    try {
      if (contentType === "carousel") {
        // Publish carousel
        const response = await fetch("/api/instagram/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "carousel",
            brandId,
            socialAccountId,
            items: item.metadata?.imageUrls?.map((url: string) => ({ imageUrl: url })) || [],
            caption: item.content,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al publicar")
        }

        toast.success("¡Carrusel publicado exitosamente!")
      } else {
        // Publish single post
        const response = await fetch("/api/instagram/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "image",
            brandId,
            socialAccountId,
            imageUrl: item.imageUrl,
            caption: item.content,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al publicar")
        }

        toast.success("¡Post publicado exitosamente!")
      }

      setPublishedItems(prev => new Set(prev).add(itemId))
    } catch (error: any) {
      console.error("Error publishing:", error)
      toast.error(error.message || "Error al publicar")
    } finally {
      setPublishingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  if (loadingAccount) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          Content Studio
        </h1>
        <p className="text-muted-foreground">
          Panel definitivo de generación de contenido - Posts y Carruseles con configuración completa
        </p>
      </div>

      {step === "config" && (
        <div className="space-y-6">
          {/* Tipo de Contenido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tipo de Contenido
              </CardTitle>
              <CardDescription>Selecciona qué quieres generar</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CONTENT_TYPES.map((type) => (
                    <div key={type.id} className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent" onClick={() => setContentType(type.id as any)}>
                      <RadioGroupItem value={type.id} id={type.id} />
                      <div className="flex-1">
                        <Label htmlFor={type.id} className="text-base font-medium cursor-pointer">
                          {type.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Cantidad de {contentType === "post" ? "Posts" : "Carruseles"}</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[quantity]}
                      onValueChange={(v) => setQuantity(v[0])}
                      min={1}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">
                      {quantity}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.emoji} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Idioma</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.emoji} {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tono</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nivel de Controversia</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={controversyLevel}
                      onValueChange={setControversyLevel}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">
                      {controversyLevel[0]}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de Sector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análisis de Sector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nombre de la Empresa *</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mi Empresa S.A."
                  />
                </div>

                <div>
                  <Label>Industria / Sector *</Label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="ej: Marketing Digital, SaaS, E-commerce"
                  />
                </div>

                <div>
                  <Label>Descripción de la Empresa</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe brevemente tu empresa, productos o servicios..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Audiencia Objetivo</Label>
                  <Input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="ej: Emprendedores, CMOs, Startups"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración de Carrusel (solo si es carousel) */}
            {contentType === "carousel" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Estructura del Carrusel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={carouselStructure} onValueChange={setCarouselStructure}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una estructura..." />
                    </SelectTrigger>
                    <SelectContent>
                      {WINNING_CAROUSEL_STRUCTURES.map((structure) => (
                        <SelectItem key={structure.name} value={structure.name}>
                          <div>
                            <div className="font-medium">{structure.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {structure.slideCount} slides - {structure.purpose}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {carouselStructure && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {WINNING_CAROUSEL_STRUCTURES.find((s) => s.name === carouselStructure)?.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Configuración de Imágenes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Fuente de Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Origen de las Imágenes</Label>
                  <Select value={imageSource} onValueChange={(v) => setImageSource(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_SOURCES.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          <div>
                            <div className="font-medium">{source.label}</div>
                            <div className="text-xs text-muted-foreground">{source.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {imageSource === "template" && (
                  <div>
                    <Label>Selecciona una Plantilla</Label>
                    {availableTemplates.length === 0 ? (
                      <div className="p-4 border rounded-lg bg-muted text-center">
                        <p className="text-sm text-muted-foreground mb-2">No tienes plantillas aún</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("/personal/templates", "_blank")}
                        >
                          Crear Plantillas
                        </Button>
                      </div>
                    ) : (
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Elige una plantilla" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <span>{template.name}</span>
                                <span className="text-xs text-muted-foreground">({template.category})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {imageSource !== "none" && imageSource !== "gradient" && imageSource !== "template" && (
                  <div>
                    <Label>Estilo de Imagen</Label>
                    <Select value={imageStyle} onValueChange={setImageStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_STYLES.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={handleGenerate} size="lg" disabled={loading}>
              <Sparkles className="h-5 w-5 mr-2" />
              Generar {quantity} {contentType === "post" ? "Post" + (quantity > 1 ? "s" : "") : "Carrusel" + (quantity > 1 ? "es" : "")}
            </Button>
          </div>
        </div>
      )}

      {step === "generating" && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Generando contenido...</h3>
                <p className="text-muted-foreground">
                  Creando {quantity} {contentType === "post" ? "publicaciones" : "carruseles"} increíbles
                </p>
              </div>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground">{progress}% completado</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  <CheckCircle2 className="h-5 w-5 inline mr-2 text-green-500" />
                  Contenido Generado ({generatedContent.length})
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("config")}>
                    Nueva Generación
                  </Button>
                  <Button onClick={handleSaveToHistory}>
                    Guardar en Historial
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedContent.map((item, index) => (
                  <Card key={item.id || index} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        {contentType === "post" ? `Post ${index + 1}` : item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {item.metadata?.imageUrls?.[0] || item.imageUrl ? (
                        <img
                          src={item.metadata?.imageUrls?.[0] || item.imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : null}
                      <p className="text-sm line-clamp-3">{item.content}</p>
                      {item.hashtags && (
                        <div className="flex flex-wrap gap-1">
                          {item.hashtags.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {contentType === "carousel" && item.metadata?.slides && (
                        <Badge variant="outline">
                          {item.metadata.slides.length} slides
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handlePublishItem(item, index)}
                        disabled={
                          publishingItems.has(item.id || `item-${index}`) ||
                          publishedItems.has(item.id || `item-${index}`) ||
                          !socialAccountId
                        }
                      >
                        {publishingItems.has(item.id || `item-${index}`) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Publicando...
                          </>
                        ) : publishedItems.has(item.id || `item-${index}`) ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Publicado
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Publicar en Instagram
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
