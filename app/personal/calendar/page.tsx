"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "bg-gradient-to-r from-pink-500 to-orange-500",
  FACEBOOK: "bg-blue-600",
  X: "bg-black",
  TIKTOK: "bg-black",
  LINKEDIN: "bg-blue-700",
  YOUTUBE: "bg-red-600",
}

const PLATFORM_EMOJI: Record<string, string> = {
  INSTAGRAM: "📸",
  FACEBOOK: "👍",
  X: "🐦",
  TIKTOK: "🎵",
  LINKEDIN: "💼",
  YOUTUBE: "📹",
}

export default function PersonalCalendarPage() {
  const router = useRouter()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const weekStart = startOfWeek(currentWeek, { locale: es })
      const response = await fetch(`/api/personal/calendar?weekStart=${weekStart.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Error al cargar el calendario")
    } finally {
      setLoading(false)
    }
  }, [currentWeek])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handlePreviousWeek = useCallback(() => {
    setCurrentWeek((prev) => addDays(prev, -7))
  }, [])

  const handleNextWeek = useCallback(() => {
    setCurrentWeek((prev) => addDays(prev, 7))
  }, [])

  const handleToday = useCallback(() => {
    setCurrentWeek(new Date())
  }, [])

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta publicación?")) return

    try {
      const response = await fetch(`/api/personal/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Publicación eliminada")
        fetchPosts()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }, [fetchPosts])

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(startOfWeek(currentWeek, { locale: es }), i)
  })

  const getPostsForDay = (day: Date) => {
    return posts.filter((post) =>
      post.scheduledAt && isSameDay(parseISO(post.scheduledAt), day)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "text-blue-500"
      case "PUBLISHED":
        return "text-green-500"
      case "FAILED":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Clock className="h-4 w-4" />
      case "PUBLISHED":
        return <CheckCircle2 className="h-4 w-4" />
      case "FAILED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8 text-primary" />
              Calendario de Publicaciones
            </h1>
            <p className="text-muted-foreground mt-1">
              Organiza tu contenido de la semana
            </p>
          </div>
          <Button onClick={() => router.push("/personal/create")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nueva publicación
          </Button>
        </div>

        {/* Week Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="text-center">
                <h2 className="text-xl font-bold">
                  {format(weekDays[0], "d 'de' MMMM", { locale: es })} -{" "}
                  {format(weekDays[6], "d 'de' MMMM yyyy", { locale: es })}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="mt-1"
                >
                  Hoy
                </Button>
              </div>

              <Button variant="outline" onClick={handleNextWeek}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly View */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayPosts = getPostsForDay(day)
            const isCurrentDay = isToday(day)

            return (
              <Card
                key={index}
                className={`${
                  isCurrentDay
                    ? "border-primary border-2 bg-primary/5"
                    : "border-border/50"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase">
                      {format(day, "EEE", { locale: es })}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isCurrentDay ? "text-primary" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {dayPosts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-xs">Sin publicaciones</p>
                    </div>
                  ) : (
                    dayPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <div className="space-y-2">
                          {/* Time */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getStatusIcon(post.status)}
                              <span>
                                {format(parseISO(post.scheduledAt), "HH:mm")}
                              </span>
                            </div>
                            <div
                              className={`text-xs ${getStatusColor(post.status)}`}
                            >
                              {post.status === "SCHEDULED" && "Programado"}
                              {post.status === "PUBLISHED" && "Publicado"}
                              {post.status === "FAILED" && "Falló"}
                            </div>
                          </div>

                          {/* Content Preview */}
                          <p className="text-sm line-clamp-2">
                            {post.items?.[0]?.content || "Sin contenido"}
                          </p>

                          {/* Platforms */}
                          <div className="flex flex-wrap gap-1">
                            {post.items?.map((item: any, idx: number) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs px-2 py-0"
                              >
                                {PLATFORM_EMOJI[item.platform]} {item.platform}
                              </Badge>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 flex-1"
                              onClick={() =>
                                router.push(`/personal/edit/${post.id}`)
                              }
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add Post Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => router.push("/personal/create")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recommendations */}
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">💡 Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Tu mejor día para publicar es <strong>jueves a las 18:00</strong>
            </p>
            <p>
              • Te faltan <strong>{7 - posts.length} publicaciones</strong> para
              alcanzar tu meta semanal
            </p>
            <p>
              • Considera espaciar tus publicaciones uniformemente durante la
              semana
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
