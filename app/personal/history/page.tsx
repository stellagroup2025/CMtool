"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  History,
  Search,
  Filter,
  Calendar,
  Send,
  TrendingUp,
  Image as ImageIcon,
  Globe,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getPersonalBrandData } from "./actions"

const PLATFORMS = ["INSTAGRAM", "FACEBOOK", "X", "LINKEDIN"]
const LANGUAGES = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
]

export default function HistoryPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [socialAccountId, setSocialAccountId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [publishedFilter, setPublishedFilter] = useState<string>("all")

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    withImages: 0,
    byPlatform: {} as Record<string, number>,
    byLanguage: {} as Record<string, number>,
  })

  // Fetch Instagram account and posts
  useEffect(() => {
    async function fetchData() {
      try {
        // Get Instagram account via server action
        const result = await getPersonalBrandData()

        if (result.success) {
          setBrandId(result.brandId)
          if (result.instagramAccount) {
            setSocialAccountId(result.instagramAccount.id)
            console.log("Instagram account found:", result.instagramAccount.id)
          } else {
            console.log("No Instagram account connected")
          }

          // Fetch posts
          const postsRes = await fetch(`/api/ai/save-generated-posts?brandId=${result.brandId}`)
          if (postsRes.ok) {
            const postsData = await postsRes.json()
            setPosts(postsData.posts)
            calculateStats(postsData.posts)
          }
        } else {
          console.error("Error fetching brand data:", result.error)
          toast.error("Error al cargar el historial")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar el historial")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate statistics
  const calculateStats = (postsList: any[]) => {
    const total = postsList.length
    const published = postsList.filter((p) => p.isPublished).length
    const withImages = postsList.filter((p) => p.imageUrl).length

    const byPlatform: Record<string, number> = {}
    const byLanguage: Record<string, number> = {}

    postsList.forEach((post) => {
      byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1
      byLanguage[post.language] = (byLanguage[post.language] || 0) + 1
    })

    setStats({ total, published, withImages, byPlatform, byLanguage })
  }

  // Apply filters
  useEffect(() => {
    let filtered = posts

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.contentType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter((p) => p.platform === platformFilter)
    }

    // Language filter
    if (languageFilter !== "all") {
      filtered = filtered.filter((p) => p.language === languageFilter)
    }

    // Published filter
    if (publishedFilter === "published") {
      filtered = filtered.filter((p) => p.isPublished)
    } else if (publishedFilter === "unpublished") {
      filtered = filtered.filter((p) => !p.isPublished)
    }

    setFilteredPosts(filtered)
  }, [posts, searchTerm, platformFilter, languageFilter, publishedFilter])

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
      toast.error("Este post no tiene imagen")
      return
    }

    if (post.isPublished) {
      toast.error("Este post ya fue publicado")
      return
    }

    setPublishing(post.id)
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

      toast.success("Post publicado exitosamente en Instagram")

      // Update post status in local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, isPublished: true, publishedAt: new Date() } : p
        )
      )
    } catch (error: any) {
      toast.error(error.message || "Error al publicar el post")
      console.error(error)
    } finally {
      setPublishing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <History className="h-10 w-10 text-primary" />
            Historial de Posts Generados
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Todos tus posts generados con IA
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Generados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Publicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Con Imágenes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.withImages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? Math.round((stats.withImages / stats.total) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Plataformas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.byPlatform).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{platform}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Título, contenido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Plataforma</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma</label>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="unpublished">No publicados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredPosts.length} de {posts.length} posts
              </p>
              {(searchTerm || platformFilter !== "all" || languageFilter !== "all" || publishedFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setPlatformFilter("all")
                    setLanguageFilter("all")
                    setPublishedFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay posts</h3>
              <p className="text-muted-foreground">
                {posts.length === 0
                  ? "Aún no has generado ningún post"
                  : "No se encontraron posts con estos filtros"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="relative">
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {post.contentType}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {post.platform}
                        </Badge>
                        {post.language && (
                          <Badge variant="secondary" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            {post.language.toUpperCase()}
                          </Badge>
                        )}
                        {post.isPublished && (
                          <Badge className="text-xs bg-green-600">Publicado</Badge>
                        )}
                      </div>
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

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(post.createdAt), "PPP", { locale: es })}
                  </div>

                  {post.imageUrl && !post.isPublished && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handlePublishPost(post)}
                      disabled={publishing === post.id || !socialAccountId}
                    >
                      {publishing === post.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publicar Ahora
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
