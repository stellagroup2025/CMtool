"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Calendar,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Users,
  Heart,
  Lightbulb,
  Clock,
  CheckCircle2
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PersonalDashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/personal/dashboard")
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  // Mock data for demonstration
  const weekProgress = 3
  const weekGoal = userData?.contentFrequency || 5
  const progressPercentage = (weekProgress / weekGoal) * 100

  const tipOfTheDay = "Tu audiencia es más activa entre las 6-9 PM. ¡Programa tus posts en ese horario!"

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              ¡Hola, {userData?.name || "Creador"}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Aquí tienes todo lo que necesitas para hoy
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Modo Personal
          </Badge>
        </div>

        {/* Weekly Progress Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Tu progreso esta semana</h3>
                <p className="text-sm text-muted-foreground">
                  {weekProgress} de {weekGoal} publicaciones
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
                <p className="text-xs text-muted-foreground">completado</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {weekGoal - weekProgress > 0
                ? `¡Quedan ${weekGoal - weekProgress} publicaciones para alcanzar tu meta!`
                : "¡Felicidades! Cumpliste tu meta semanal 🎉"}
            </p>
          </CardContent>
        </Card>

        {/* Tip of the Day */}
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="rounded-full bg-accent/20 p-2 h-fit">
                <Lightbulb className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">💡 Consejo del día</h4>
                <p className="text-sm text-muted-foreground">{tipOfTheDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main 4 Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Create Content */}
          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Crear Contenido</CardTitle>
                    <CardDescription>Con ayuda de IA</CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/personal/create")}
                className="w-full"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear publicación
              </Button>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Ideas sugeridas:</p>
                <div className="space-y-1">
                  <button className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors">
                    💪 Comparte un logro reciente
                  </button>
                  <button className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors">
                    📚 Enseña algo nuevo que aprendiste
                  </button>
                  <button className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors">
                    ❓ Haz una pregunta a tu audiencia
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Calendar */}
          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Calendario</CardTitle>
                    <CardDescription>Próximas publicaciones</CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/personal/calendar")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Ver calendario
              </Button>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Post sobre networking</p>
                    <p className="text-xs text-muted-foreground">Hoy, 6:00 PM</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Tutorial rápido</p>
                    <p className="text-xs text-muted-foreground">Mañana, 10:00 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Inbox */}
          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-3 relative">
                    <MessageSquare className="h-6 w-6 text-purple-500" />
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <div>
                    <CardTitle>Mensajes</CardTitle>
                    <CardDescription>Responde a tu audiencia</CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/personal/inbox")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Ver mensajes
              </Button>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="rounded-full bg-gradient-to-br from-pink-500 to-orange-500 h-8 w-8 flex items-center justify-center text-white text-xs font-bold">
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Juan Díaz</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Hola! Me encantó tu último post...
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">Instagram</Badge>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 h-8 w-8 flex items-center justify-center text-white text-xs font-bold">
                    ML
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">María López</p>
                    <p className="text-xs text-muted-foreground truncate">
                      ¿Puedes hacer más contenido sobre...
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">X</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Analytics */}
          <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Estadísticas</CardTitle>
                    <CardDescription>Tu crecimiento</CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/personal/analytics")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Ver estadísticas
              </Button>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">Alcance</span>
                  </div>
                  <p className="text-xl font-bold">12.5K</p>
                  <p className="text-xs text-green-500">+15% esta semana</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Heart className="h-3 w-3" />
                    <span className="text-xs">Engagement</span>
                  </div>
                  <p className="text-xl font-bold">8.2%</p>
                  <p className="text-xs text-green-500">+2.1% esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Atajos para las tareas más comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Conectar red social
              </Button>
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Generar ideas IA
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Programar semana
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
