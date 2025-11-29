"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Calendar,
  Send,
  Loader2,
  Copy,
  RefreshCw,
  ArrowLeft,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"

const CONTENT_TYPES = [
  { id: "achievement", label: "Logro reciente", icon: "🏆", prompt: "un logro o éxito reciente" },
  { id: "tip", label: "Consejo/Tip", icon: "💡", prompt: "un consejo útil para tu audiencia" },
  { id: "story", label: "Historia personal", icon: "📖", prompt: "una historia personal inspiradora" },
  { id: "question", label: "Pregunta", icon: "❓", prompt: "una pregunta interesante para tu audiencia" },
  { id: "tutorial", label: "Tutorial/Cómo hacer", icon: "📚", prompt: "un tutorial paso a paso" },
  { id: "behind", label: "Detrás de escenas", icon: "🎬", prompt: "algo detrás de escenas de tu trabajo" },
]

const PLATFORMS_CONFIG = {
  INSTAGRAM: { name: "Instagram", emoji: "📸", maxChars: 2200, color: "from-pink-500 to-orange-500" },
  FACEBOOK: { name: "Facebook", emoji: "👍", maxChars: 63206, color: "from-blue-600 to-blue-400" },
  X: { name: "X", emoji: "🐦", maxChars: 280, color: "from-black to-gray-700" },
  TIKTOK: { name: "TikTok", emoji: "🎵", maxChars: 2200, color: "from-black to-pink-500" },
  LINKEDIN: { name: "LinkedIn", emoji: "💼", maxChars: 3000, color: "from-blue-700 to-blue-500" },
  YOUTUBE: { name: "YouTube", emoji: "📹", maxChars: 5000, color: "from-red-600 to-red-400" },
}

export default function PersonalCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<"type" | "generate" | "customize" | "schedule">("type")
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [userInput, setUserInput] = useState("")
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({})
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId)
    setStep("generate")
  }

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast.error("Por favor describe tu idea")
      return
    }

    setLoading(true)
    try {
      const contentType = CONTENT_TYPES.find(t => t.id === selectedType)
      const response = await fetch("/api/personal/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: selectedType,
          userInput,
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : Object.keys(PLATFORMS_CONFIG),
        }),
      })

      if (!response.ok) throw new Error("Error al generar contenido")

      const data = await response.json()
      setGeneratedContent(data.content)
      setStep("customize")
      toast.success("¡Contenido generado con éxito!")
    } catch (error) {
      toast.error("Error al generar contenido. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (platform: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/personal/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: selectedType,
          userInput,
          platforms: [platform],
          regenerate: true,
        }),
      })

      if (!response.ok) throw new Error("Error al regenerar")

      const data = await response.json()
      setGeneratedContent(prev => ({ ...prev, ...data.content }))
      toast.success("Contenido regenerado")
    } catch (error) {
      toast.error("Error al regenerar")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error("Por favor selecciona fecha y hora")
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Por favor selecciona al menos una plataforma")
      return
    }

    setLoading(true)
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`)

      const response = await fetch("/api/personal/schedule-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedContent,
          platforms: selectedPlatforms,
          scheduledAt,
        }),
      })

      if (!response.ok) throw new Error("Error al programar")

      toast.success("¡Publicación programada con éxito!")
      router.push("/personal/calendar")
    } catch (error) {
      toast.error("Error al programar la publicación")
    } finally {
      setLoading(false)
    }
  }

  const handlePublishNow = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Por favor selecciona al menos una plataforma")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/personal/publish-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedContent,
          platforms: selectedPlatforms,
        }),
      })

      if (!response.ok) throw new Error("Error al publicar")

      toast.success("¡Publicación enviada con éxito!")
      router.push("/personal/dashboard")
    } catch (error) {
      toast.error("Error al publicar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step === "type") router.back()
              else if (step === "generate") setStep("type")
              else if (step === "customize") setStep("generate")
              else if (step === "schedule") setStep("customize")
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Crear Contenido
            </h1>
            <p className="text-muted-foreground">La IA te ayudará a crear contenido perfecto</p>
          </div>
        </div>

        {/* Step 1: Select Content Type */}
        {step === "type" && (
          <Card>
            <CardHeader>
              <CardTitle>¿Qué quieres compartir hoy?</CardTitle>
              <CardDescription>Selecciona el tipo de contenido que quieres crear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSelectType(type.id)}
                    className="p-6 rounded-lg border-2 border-border hover:border-primary transition-all text-center group"
                  >
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Generate with AI */}
        {step === "generate" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Cuéntame tu idea
              </CardTitle>
              <CardDescription>
                La IA creará contenido optimizado basado en tu idea
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="idea">Describe tu idea</Label>
                <Textarea
                  id="idea"
                  placeholder={`Ejemplo: "Hoy logré mi primera venta de $1000 después de 3 meses de trabajo duro..."`}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Cuantos más detalles, mejor será el contenido generado
                </p>
              </div>

              <div className="space-y-2">
                <Label>Plataformas (opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PLATFORMS_CONFIG).map(([key, config]) => (
                    <Badge
                      key={key}
                      variant={selectedPlatforms.includes(key) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1"
                      onClick={() => {
                        setSelectedPlatforms(prev =>
                          prev.includes(key)
                            ? prev.filter(p => p !== key)
                            : [...prev, key]
                        )
                      }}
                    >
                      {config.emoji} {config.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Si no seleccionas ninguna, se generará para todas
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generando contenido...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generar con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Customize Content */}
        {step === "customize" && Object.keys(generatedContent).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tu contenido generado</CardTitle>
              <CardDescription>
                Revisa y personaliza el contenido para cada plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(generatedContent)[0]}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  {Object.keys(generatedContent).map((platform) => {
                    const config = PLATFORMS_CONFIG[platform as keyof typeof PLATFORMS_CONFIG]
                    return (
                      <TabsTrigger key={platform} value={platform}>
                        {config.emoji} {config.name}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {Object.entries(generatedContent).map(([platform, content]) => {
                  const config = PLATFORMS_CONFIG[platform as keyof typeof PLATFORMS_CONFIG]
                  return (
                    <TabsContent key={platform} value={platform} className="space-y-4">
                      <div className="relative">
                        <Textarea
                          value={content}
                          onChange={(e) => {
                            setGeneratedContent(prev => ({
                              ...prev,
                              [platform]: e.target.value
                            }))
                          }}
                          rows={10}
                          className="pr-20"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopy(content)}
                            title="Copiar"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRegenerate(platform)}
                            disabled={loading}
                            title="Regenerar"
                          >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {content.length} / {config.maxChars} caracteres
                        </span>
                        {content.length > config.maxChars && (
                          <span className="text-destructive">¡Excede el límite!</span>
                        )}
                      </div>
                    </TabsContent>
                  )
                })}
              </Tabs>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setStep("schedule")}
                  size="lg"
                  className="flex-1"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Programar
                </Button>
                <Button
                  onClick={handlePublishNow}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Publicar ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Schedule */}
        {step === "schedule" && (
          <Card>
            <CardHeader>
              <CardTitle>Programar publicación</CardTitle>
              <CardDescription>Elige cuándo quieres que se publique tu contenido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Selecciona plataformas</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(generatedContent).map((platform) => {
                      const config = PLATFORMS_CONFIG[platform as keyof typeof PLATFORMS_CONFIG]
                      return (
                        <Badge
                          key={platform}
                          variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                          className="cursor-pointer px-4 py-2"
                          onClick={() => {
                            setSelectedPlatforms(prev =>
                              prev.includes(platform)
                                ? prev.filter(p => p !== platform)
                                : [...prev, platform]
                            )
                          }}
                        >
                          {config.emoji} {config.name}
                          {selectedPlatforms.includes(platform) && (
                            <CheckCircle2 className="ml-2 h-3 w-3" />
                          )}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent mb-2">💡 Sugerencia</p>
                  <p className="text-sm text-muted-foreground">
                    Tu audiencia es más activa entre las 18:00 - 21:00 horas
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSchedule}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Programando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 mr-2" />
                    Programar publicación
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
