"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  Heart,
  Eye,
  TrendingDown,
  Sparkles,
  Calendar
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function PersonalAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/personal/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const weeklyData = [
    { day: "Lun", alcance: 1200, engagement: 95 },
    { day: "Mar", alcance: 1500, engagement: 120 },
    { day: "Mié", alcance: 1800, engagement: 145 },
    { day: "Jue", alcance: 2100, engagement: 180 },
    { day: "Vie", alcance: 2400, engagement: 210 },
    { day: "Sáb", alcance: 1900, engagement: 160 },
    { day: "Dom", alcance: 1600, engagement: 130 },
  ]

  const topPosts = [
    {
      id: 1,
      content: "5 consejos para aumentar tu productividad...",
      platform: "Instagram",
      likes: 245,
      comments: 28,
      shares: 12,
    },
    {
      id: 2,
      content: "Mi experiencia aprendiendo programación...",
      platform: "LinkedIn",
      likes: 189,
      comments: 34,
      shares: 8,
    },
    {
      id: 3,
      content: "Tutorial: Cómo empezar tu marca personal",
      platform: "YouTube",
      likes: 512,
      comments: 67,
      shares: 45,
    },
  ]

  const insights = [
    {
      text: "Tu audiencia responde mejor a contenido educativo",
      type: "positive",
    },
    {
      text: "Mejor día para publicar: Jueves",
      type: "tip",
    },
    {
      text: "Tu tasa de engagement aumentó 15% esta semana",
      type: "positive",
    },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Estadísticas
          </h1>
          <p className="text-muted-foreground mt-1">
            Tu crecimiento esta semana
          </p>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Alcance Total
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+15% esta semana</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Engagement
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.2%</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+2.1% esta semana</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nuevos Seguidores
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+342</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+28% esta semana</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vistas Totales
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8K</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+12% esta semana</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alcance Semanal</CardTitle>
              <CardDescription>
                Personas únicas alcanzadas esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alcance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Diario</CardTitle>
              <CardDescription>
                Interacciones totales por día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="engagement"
                    fill="hsl(var(--accent))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Mejores Publicaciones</CardTitle>
            <CardDescription>
              Tu contenido con mejor rendimiento esta semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">{post.platform}</Badge>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        🔄 {post.shares}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Insights Personalizados
            </CardTitle>
            <CardDescription>
              Recomendaciones basadas en tu desempeño
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-background"
              >
                <div className="mt-0.5">
                  {insight.type === "positive" && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  {insight.type === "tip" && (
                    <Calendar className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm">{insight.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
