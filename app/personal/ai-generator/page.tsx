"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Copy,
  RefreshCw,
  Send,
  Flame,
  Heart,
  Zap,
  Brain,
} from "lucide-react"
import { toast } from "sonner"

const PLATFORMS = [
  { id: "INSTAGRAM", name: "Instagram", emoji: "📸", color: "from-pink-500 to-orange-500" },
  { id: "FACEBOOK", name: "Facebook", emoji: "👍", color: "from-blue-600 to-blue-400" },
  { id: "X", name: "X", emoji: "🐦", color: "from-black to-gray-700" },
  { id: "LINKEDIN", name: "LinkedIn", emoji: "💼", color: "from-blue-700 to-blue-500" },
  { id: "TIKTOK", name: "TikTok", emoji: "🎵", color: "from-black to-pink-500" },
]

const TONES = [
  { id: "professional", label: "Profesional", icon: Brain, description: "Experto y creíble" },
  { id: "casual", label: "Casual", icon: Heart, description: "Amigable y cercano" },
  { id: "provocative", label: "Provocativo", icon: Flame, description: "Audaz y desafiante" },
  { id: "inspirational", label: "Inspirador", icon: Zap, description: "Motivacional" },
]

const IMAGE_STYLES = [
  "modern and professional",
  "minimalist and clean",
  "bold and colorful",
  "dark and moody",
  "bright and energetic",
  "elegant and sophisticated",
  "playful and fun",
  "tech-focused and futuristic",
]

export default function AIGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [platform, setPlatform] = useState("INSTAGRAM")
  const [tone, setTone] = useState<"professional" | "casual" | "provocative" | "inspirational">(
    "professional"
  )
  const [controversyLevel, setControversyLevel] = useState([5])
  const [includeImage, setIncludeImage] = useState(true)
  const [imageStyle, setImageStyle] = useState("modern and professional")
  const [generatedPost, setGeneratedPost] = useState<any>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor describe tu idea")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/generate-complete-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platform,
          includeImage,
          imageStyle,
          controversyLevel: controversyLevel[0],
          tone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al generar contenido")
      }

      const data = await response.json()
      setGeneratedPost(data.post)
      toast.success("¡Contenido generado con éxito!")
    } catch (error: any) {
      toast.error(error.message || "Error al generar contenido. Intenta de nuevo.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  const handleRegenerate = () => {
    setGeneratedPost(null)
    handleGenerate()
  }

  const getControversyLabel = (level: number) => {
    if (level <= 3) return "Seguro y consensuado"
    if (level <= 6) return "Equilibrado y reflexivo"
    return "Audaz y controvertido"
  }

  const getControversyColor = (level: number) => {
    if (level <= 3) return "text-green-600"
    if (level <= 6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            Generador IA Completo
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Genera posts completos con imagen y copy optimizado en segundos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Post</CardTitle>
              <CardDescription>Define cómo quieres que sea tu contenido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Tu Idea o Tema</Label>
                <Textarea
                  id="prompt"
                  placeholder="Ej: Lanzamiento de nuestra nueva herramienta de IA para automatizar marketing en redes sociales"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <Badge
                      key={p.id}
                      variant={platform === p.id ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm"
                      onClick={() => setPlatform(p.id)}
                    >
                      {p.emoji} {p.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label>Tono</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id as any)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          tone === t.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{t.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Controversy Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Nivel de Controversia</Label>
                  <span className={`text-sm font-medium ${getControversyColor(controversyLevel[0])}`}>
                    {controversyLevel[0]}/10 - {getControversyLabel(controversyLevel[0])}
                  </span>
                </div>
                <Slider
                  value={controversyLevel}
                  onValueChange={setControversyLevel}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {controversyLevel[0] <= 3
                    ? "Contenido seguro que no generará debate"
                    : controversyLevel[0] <= 6
                    ? "Perspectivas interesantes pero equilibradas"
                    : "Contenido audaz que puede generar debate (lovers + haters = audiencia)"}
                </p>
              </div>

              {/* Image Generation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-image">Generar Imagen</Label>
                  <Switch
                    id="include-image"
                    checked={includeImage}
                    onCheckedChange={setIncludeImage}
                  />
                </div>

                {includeImage && (
                  <div className="space-y-2">
                    <Label htmlFor="image-style">Estilo de Imagen</Label>
                    <Select value={imageStyle} onValueChange={setImageStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_STYLES.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generando contenido mágico...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generar Post Completo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                {generatedPost
                  ? "Tu contenido generado está listo"
                  : "El contenido generado aparecerá aquí"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedPost ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Configura tu post y haz clic en "Generar"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image */}
                  {generatedPost.imageUrl && (
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                      <img
                        src={generatedPost.imageUrl}
                        alt="Generated content"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Copy</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(generatedPost.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={generatedPost.content}
                      readOnly
                      rows={8}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {generatedPost.content.length} caracteres
                    </p>
                  </div>

                  {/* Hashtags */}
                  {generatedPost.hashtags && generatedPost.hashtags.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Hashtags</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleCopy(generatedPost.hashtags.map((h: string) => `#${h}`).join(" "))
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {generatedPost.hashtags.map((hashtag: string) => (
                          <Badge key={hashtag} variant="secondary">
                            #{hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleRegenerate} variant="outline" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerar
                    </Button>
                    <Button className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Publicar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
