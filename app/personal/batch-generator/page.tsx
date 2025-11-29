"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import {
  Sparkles,
  Loader2,
  Rocket,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  Send,
  ImageIcon,
  Image as ImagePlus,
  Upload,
  X as XIcon,
  Palette,
} from "lucide-react"
import { toast } from "sonner"
import { getPersonalBrandData } from "./actions"
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

const IMAGE_STYLES = [
  "modern and professional",
  "minimalist and clean",
  "bold and colorful",
  "tech-focused and futuristic",
]

export default function BatchGeneratorPage() {
  const [step, setStep] = useState<"config" | "generating" | "review">("config")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Configuration
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [description, setDescription] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [quantity, setQuantity] = useState(10)
  const [platform, setPlatform] = useState("INSTAGRAM")
  const [language, setLanguage] = useState("es")
  const [tone, setTone] = useState<"professional" | "casual" | "provocative" | "inspirational">(
    "professional"
  )
  const [controversyLevel, setControversyLevel] = useState([5])
  const [imageSource, setImageSource] = useState<"none" | "template" | "unsplash" | "unsplash-designed" | "ai" | "logo">("unsplash-designed")
  const [imageStyle, setImageStyle] = useState("modern and professional")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Templates
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [rotateTemplates, setRotateTemplates] = useState(false)

  // Generated posts
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([])
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())

  // Instagram account
  const [brandId, setBrandId] = useState<string | null>(null)
  const [socialAccountId, setSocialAccountId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [loadingAccount, setLoadingAccount] = useState(true)

  // Fetch Instagram account on mount - optimized
  useEffect(() => {
    let mounted = true

    getPersonalBrandData()
      .then((result) => {
        if (!mounted) return

        if (result.success) {
          setBrandId(result.brandId)
          if (result.instagramAccount) {
            setSocialAccountId(result.instagramAccount.id)
          }
        }
      })
      .catch((error) => console.error("Error fetching Instagram account:", error))
      .finally(() => {
        if (mounted) setLoadingAccount(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Load templates when imageSource is 'template'
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

  const renderTemplateToImage = async (title: string, content: string, templateId?: string): Promise<string | null> => {
    try {
      const templateToUse = templateId || selectedTemplateId
      if (!templateToUse) {
        return null
      }

      const response = await fetch("/api/personal/templates/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: templateToUse,
          variables: { TITLE: title, CONTENT: content },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to render template")
      }

      const { html } = await response.json()

      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html
      tempDiv.style.position = "absolute"
      tempDiv.style.left = "-9999px"
      tempDiv.style.top = "0"
      document.body.appendChild(tempDiv)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const dataUrl = await toPng(tempDiv.firstChild as HTMLElement, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
      })

      document.body.removeChild(tempDiv)

      return dataUrl
    } catch (error) {
      console.error("Error rendering template to image:", error)
      return null
    }
  }

  const handleGenerate = async () => {
    if (!companyName.trim() || !industry.trim() || !description.trim()) {
      toast.error("Por favor completa toda la información de la empresa")
      return
    }

    if (imageSource === "logo" && !logoPreview) {
      toast.error("Por favor sube tu logo para usar esta opción")
      return
    }

    setLoading(true)
    setStep("generating")
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 95))
      }, 500)

      const response = await fetch("/api/ai/generate-batch-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyInfo: {
            name: companyName,
            industry,
            description,
            targetAudience: targetAudience || undefined,
          },
          quantity,
          platform,
          language,
          includeImages: imageSource !== "none",
          imageSource,
          imageStyle,
          logoBase64: imageSource === "logo" ? logoPreview : undefined,
          controversyLevel: controversyLevel[0],
          tone,
        }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al generar contenido")
      }

      const data = await response.json()

      // If using templates, generate images locally
      let finalPosts = data.posts
      if (imageSource === "template" && selectedTemplateId) {
        const postsWithTemplateImages = []
        for (let i = 0; i < data.posts.length; i++) {
          const post = data.posts[i]
          const templateToUse = rotateTemplates && availableTemplates.length > 0
            ? availableTemplates[i % availableTemplates.length].id
            : selectedTemplateId

          const imageDataUrl = await renderTemplateToImage(
            post.title || "Post",
            post.content || "",
            templateToUse
          )

          postsWithTemplateImages.push({
            ...post,
            imageUrl: imageDataUrl || post.imageUrl,
          })

          setProgress(Math.min(60 + (i / data.posts.length) * 35, 95))
        }
        finalPosts = postsWithTemplateImages
      }

      setGeneratedPosts(finalPosts)
      setSelectedPosts(new Set(finalPosts.map((p: any) => p.id)))
      setProgress(100)

      // Save posts to database
      if (brandId && data.posts.length > 0) {
        try {
          const batchId = `batch-${Date.now()}`
          const saveResponse = await fetch("/api/ai/save-generated-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              brandId,
              batchId,
              posts: data.posts,
              language,
              tone,
              controversyLevel: controversyLevel[0],
            }),
          })

          if (saveResponse.ok) {
            const saveData = await saveResponse.json()
            console.log("Posts saved to database:", saveData)
            toast.success(`${saveData.saved} posts guardados en el historial`)
          } else {
            const errorData = await saveResponse.json()
            console.error("Failed to save posts:", errorData)
            toast.error("Error al guardar posts en el historial")
          }
        } catch (saveError) {
          console.error("Failed to save posts:", saveError)
          toast.error("Error al guardar posts en el historial")
        }
      } else {
        console.warn("No brandId or no posts to save")
      }

      setTimeout(() => {
        setStep("review")
        toast.success(
          `¡${data.posts.length} posts generados con éxito! ${data.summary.withImages} con imágenes.`
        )
      }, 500)
    } catch (error: any) {
      toast.error(error.message || "Error al generar contenido. Intenta de nuevo.")
      console.error(error)
      setStep("config")
    } finally {
      setLoading(false)
    }
  }

  const togglePostSelection = (id: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPosts(newSelected)
  }

  const handleDeletePost = (id: string) => {
    setGeneratedPosts(generatedPosts.filter((p) => p.id !== id))
    const newSelected = new Set(selectedPosts)
    newSelected.delete(id)
    setSelectedPosts(newSelected)
    toast.success("Post eliminado")
  }

  const handlePublishPost = async (post: any) => {
    if (!socialAccountId) {
      toast.error("No hay cuenta de Instagram conectada")
      return
    }

    if (!brandId) {
      toast.error("No se encontró el brandId")
      return
    }

    if (!post.imageUrl) {
      toast.error("Este post no tiene imagen. Solo se pueden publicar posts con imagen.")
      return
    }

    setPublishing(true)
    try {
      // Clean markdown formatting from content
      const cleanContent = post.content
        .replace(/\*\*/g, '') // Remove bold markdown
        .replace(/\*/g, '')   // Remove italic markdown
        .replace(/#{1,6}\s/g, '') // Remove heading markdown

      const caption = `${cleanContent}\n\n${post.hashtags?.map((tag: string) => `#${tag}`).join(" ") || ""}`

      const response = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          socialAccountId,
          type: "image",
          imageUrl: post.imageUrl,
          caption: caption.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al publicar")
      }

      const data = await response.json()
      toast.success("Post publicado exitosamente en Instagram")

      // Remove from selected posts
      const newSelected = new Set(selectedPosts)
      newSelected.delete(post.id)
      setSelectedPosts(newSelected)
    } catch (error: any) {
      toast.error(error.message || "Error al publicar el post")
      console.error(error)
    } finally {
      setPublishing(false)
    }
  }

  const handlePublishSelected = async () => {
    const selectedCount = selectedPosts.size
    if (selectedCount === 0) {
      toast.error("Selecciona al menos un post para publicar")
      return
    }

    if (!socialAccountId) {
      toast.error("No hay cuenta de Instagram conectada")
      return
    }

    const postsToPublish = generatedPosts.filter((p) => selectedPosts.has(p.id))
    const postsWithImages = postsToPublish.filter((p) => p.imageUrl)
    const postsWithoutImages = postsToPublish.filter((p) => !p.imageUrl)

    // Instagram requires images
    if (postsWithoutImages.length > 0) {
      toast.error(
        `${postsWithoutImages.length} post(s) seleccionado(s) no tienen imagen. Instagram requiere imágenes para publicar.`
      )
      return
    }

    if (postsWithImages.length === 0) {
      toast.error("No hay posts con imagen para publicar")
      return
    }

    setPublishing(true)
    let successCount = 0
    let failCount = 0

    for (const post of postsToPublish) {
      try {
        // Clean markdown formatting from content
        const cleanContent = post.content
          .replace(/\*\*/g, '') // Remove bold markdown
          .replace(/\*/g, '')   // Remove italic markdown
          .replace(/#{1,6}\s/g, '') // Remove heading markdown

        const caption = `${cleanContent}\n\n${post.hashtags?.map((tag: string) => `#${tag}`).join(" ") || ""}`

        const response = await fetch("/api/instagram/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId,
            socialAccountId,
            type: "image",
            imageUrl: post.imageUrl,
            caption: caption.trim(),
          }),
        })

        if (response.ok) {
          successCount++
          // Remove from selected
          const newSelected = new Set(selectedPosts)
          newSelected.delete(post.id)
          setSelectedPosts(newSelected)
        } else {
          failCount++
        }

        // Wait 2 seconds between posts to avoid rate limiting
        if (postsToPublish.indexOf(post) < postsToPublish.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (error) {
        failCount++
        console.error(`Error publishing post ${post.id}:`, error)
      }
    }

    setPublishing(false)

    if (successCount > 0 && failCount === 0) {
      toast.success(`${successCount} posts publicados exitosamente`)
    } else if (successCount > 0 && failCount > 0) {
      toast.error(`${successCount} posts publicados, ${failCount} fallaron`)
    } else {
      toast.error("Error al publicar los posts")
    }
  }

  // Configuration Step
  if (step === "config") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Rocket className="h-10 w-10 text-primary" />
              Generación Masiva
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Crea {quantity} posts completos de una vez para impulsar tu presencia
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información de tu Empresa</CardTitle>
              <CardDescription>
                Cuéntanos sobre tu negocio para generar contenido personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nombre de la Empresa *</Label>
                  <Input
                    id="company-name"
                    placeholder="Ej: Estela"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industria/Sector *</Label>
                  <Input
                    id="industry"
                    placeholder="Ej: Desarrollo de Software y Marketing Digital"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción de la Empresa *</Label>
                <Textarea
                  id="description"
                  placeholder="Ej: Agencia especializada en desarrollo de software a medida y estrategias de marketing digital para empresas tecnológicas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-audience">Audiencia Objetivo (Opcional)</Label>
                <Input
                  id="target-audience"
                  placeholder="Ej: Startups tecnológicas y empresas B2B"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Contenido</CardTitle>
              <CardDescription>Personaliza el estilo y tono de los posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Cantidad de Posts: {quantity}</Label>
                <Slider
                  value={[quantity]}
                  onValueChange={(v) => setQuantity(v[0])}
                  min={5}
                  max={30}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 10 posts para un lanzamiento completo
                </p>
              </div>

              <div className="space-y-2">
                <Label>Plataforma</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <Badge
                      key={p.id}
                      variant={platform === p.id ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => setPlatform(p.id)}
                    >
                      {p.emoji} {p.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <div className="flex flex-wrap gap-2">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tono</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id as any)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Controversia</Label>
                    <span className="text-sm font-medium">{controversyLevel[0]}/10</span>
                  </div>
                  <Slider
                    value={controversyLevel}
                    onValueChange={setControversyLevel}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Fuente de Imágenes</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Elige cómo quieres agregar imágenes a tus posts
                  </p>
                </div>

                <RadioGroup
                  value={imageSource}
                  onValueChange={(value: any) => setImageSource(value)}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="none" id="none" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="none" className="flex items-center gap-2 cursor-pointer">
                        <XIcon className="h-4 w-4" />
                        <span className="font-medium">Sin imágenes</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Genera solo el texto del post (no se podrá publicar en Instagram)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="template" id="template" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="template" className="flex items-center gap-2 cursor-pointer">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium">Usar Plantilla ⭐</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Plantillas HTML personalizadas con tu marca y colores
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="unsplash" id="unsplash" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="unsplash" className="flex items-center gap-2 cursor-pointer">
                        <ImageIcon className="h-4 w-4" />
                        <span className="font-medium">Unsplash (Fotos simples)</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Imágenes profesionales sin modificar (rápido y gratis)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="unsplash-designed" id="unsplash-designed" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="unsplash-designed" className="flex items-center gap-2 cursor-pointer">
                        <Palette className="h-4 w-4" />
                        <span className="font-medium">Unsplash Diseñadas ⭐</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fotos de Unsplash con diseño profesional: filtros, texto del post y branding
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="ai" id="ai" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="ai" className="flex items-center gap-2 cursor-pointer">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-medium">Generadas con IA (DALL-E)</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Imágenes únicas creadas específicamente para tu contenido (requiere OpenAI API)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="logo" id="logo" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="logo" className="flex items-center gap-2 cursor-pointer">
                        <ImagePlus className="h-4 w-4" />
                        <span className="font-medium">Logo + Texto</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Crea imágenes profesionales con tu logo de fondo y el texto del post
                      </p>
                    </div>
                  </div>
                </RadioGroup>

                {imageSource === "template" && (
                  <div className="space-y-3 pt-2">
                    <Label>Configuración de Plantillas</Label>
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
                      <>
                        <div className="space-y-2">
                          <Label>Selecciona una Plantilla</Label>
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="w-full border rounded-md p-2"
                          >
                            {availableTemplates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name} ({template.category})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={rotateTemplates}
                            onCheckedChange={setRotateTemplates}
                            id="rotate-templates"
                          />
                          <Label htmlFor="rotate-templates" className="cursor-pointer">
                            Rotar entre todas las plantillas
                          </Label>
                        </div>
                        {rotateTemplates && (
                          <p className="text-xs text-muted-foreground">
                            Cada post usará una plantilla diferente de forma rotativa
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {imageSource === "logo" && (
                  <div className="space-y-3 pt-2">
                    <Label>Sube tu Logo</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      {logoPreview ? (
                        <div className="space-y-3">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="max-h-32 mx-auto object-contain"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLogoFile(null)
                              setLogoPreview(null)
                            }}
                          >
                            Cambiar Logo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <Label
                              htmlFor="logo-upload"
                              className="cursor-pointer text-primary hover:underline"
                            >
                              Haz clic para subir
                            </Label>
                            <Input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setLogoFile(file)
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setLogoPreview(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG o SVG (máx. 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(imageSource === "unsplash" || imageSource === "ai") && (
                  <div className="space-y-2 pt-2">
                    <Label>Estilo de Imágenes</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {IMAGE_STYLES.map((style) => (
                        <button
                          key={style}
                          onClick={() => setImageStyle(style)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            imageStyle === style
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-sm capitalize">{style}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full">
            <Rocket className="h-5 w-5 mr-2" />
            Generar {quantity} Posts Completos
          </Button>
        </div>
      </div>
    )
  }

  // Generating Step
  if (step === "generating") {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Generando Contenido Mágico
            </CardTitle>
            <CardDescription>
              La IA está creando {quantity} posts únicos para {companyName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${progress > 20 ? "bg-green-500" : "bg-gray-300"}`} />
                <span className={progress > 20 ? "text-foreground" : "text-muted-foreground"}>
                  Analizando empresa e industria
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${progress > 40 ? "bg-green-500" : "bg-gray-300"}`} />
                <span className={progress > 40 ? "text-foreground" : "text-muted-foreground"}>
                  Generando ideas creativas
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${progress > 60 ? "bg-green-500" : "bg-gray-300"}`} />
                <span className={progress > 60 ? "text-foreground" : "text-muted-foreground"}>
                  Escribiendo copy optimizado
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${progress > 80 ? "bg-green-500" : "bg-gray-300"}`} />
                <span className={progress > 80 ? "text-foreground" : "text-muted-foreground"}>
                  Creando imágenes profesionales
                </span>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Consejo:</strong> Mientras esperas, prepara tu calendario de
                publicaciones. Puedes programar estos posts a lo largo de la próxima semana.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Review Step
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              {generatedPosts.length} Posts Generados
            </h1>
            <p className="text-muted-foreground mt-2">
              Revisa, edita y publica tu contenido
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("config")}>
                Generar Más
              </Button>
              <Button
                onClick={handlePublishSelected}
                disabled={selectedPosts.size === 0 || publishing || !socialAccountId}
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publicar Seleccionados ({selectedPosts.size})
                  </>
                )}
              </Button>
            </div>
            {!socialAccountId && (
              <p className="text-xs text-muted-foreground">
                Conecta tu cuenta de Instagram en <a href="/personal/instagram" className="text-primary underline">Instagram</a> para publicar
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedPosts.map((post) => (
            <Card
              key={post.id}
              className={`relative transition-all ${
                selectedPosts.has(post.id) ? "ring-2 ring-primary" : ""
              }`}
            >
              {post.imageUrl && (
                <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {post.type}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-4">{post.content}</p>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {post.hashtags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{post.hashtags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant={selectedPosts.has(post.id) ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => togglePostSelection(post.id)}
                  >
                    {selectedPosts.has(post.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Seleccionado
                      </>
                    ) : (
                      "Seleccionar"
                    )}
                  </Button>
                  {post.imageUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePublishPost(post)}
                      disabled={publishing || !socialAccountId}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Publicar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
