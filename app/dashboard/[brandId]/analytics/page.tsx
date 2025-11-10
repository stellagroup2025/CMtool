"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, Heart, MessageSquare, Eye, Share2, ArrowUpRight, Loader2 } from "lucide-react"
import { AnalyticsCharts } from "./components/analytics-charts"
import { ExportButton } from "./components/export-button"
import { ComparisonStats } from "./components/comparison-stats"
import { getAnalyticsDataAction } from "./actions"
import { subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"

export default function AnalyticsPage() {
  const params = useParams()
  const brandId = params.brandId as string

  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState<Date>(new Date())

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      let newStartDate: Date
      let newEndDate = new Date()

      switch (timeRange) {
        case "7d":
          newStartDate = subDays(newEndDate, 7)
          break
        case "30d":
          newStartDate = subDays(newEndDate, 30)
          break
        case "90d":
          newStartDate = subDays(newEndDate, 90)
          break
        case "this-month":
          newStartDate = startOfMonth(newEndDate)
          newEndDate = endOfMonth(newEndDate)
          break
        case "last-month":
          newStartDate = startOfMonth(subMonths(newEndDate, 1))
          newEndDate = endOfMonth(subMonths(newEndDate, 1))
          break
        default:
          newStartDate = subDays(newEndDate, 30)
      }

      setStartDate(newStartDate)
      setEndDate(newEndDate)
      const analyticsData = await getAnalyticsDataAction(brandId, newStartDate, newEndDate)
      setData(analyticsData)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [brandId, timeRange])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Analytics</h1>
          <p className="text-muted-foreground mt-1">Métricas y rendimiento de redes sociales</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton brandId={brandId} startDate={startDate} endDate={endDate} />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="this-month">Este mes</SelectItem>
              <SelectItem value="last-month">Mes pasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Stats */}
      <ComparisonStats brandId={brandId} startDate={startDate} endDate={endDate} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seguidores Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalFollowers.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.summary.followerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.summary.followerGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{data.summary.followerGrowth >= 0 ? '+' : ''}{data.summary.followerGrowth} nuevos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Posts Publicados</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPosts}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>En el período seleccionado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Promedio</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.avgEngagement.toFixed(2)}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{data.summary.totalLikes.toLocaleString()} likes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alcance Total</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalReach >= 1000000
                ? `${(data.summary.totalReach / 1000000).toFixed(1)}M`
                : data.summary.totalReach >= 1000
                ? `${(data.summary.totalReach / 1000).toFixed(1)}K`
                : data.summary.totalReach}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{data.summary.totalComments.toLocaleString()} comentarios</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Accounts Overview */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Cuentas Sociales</CardTitle>
          <CardDescription>Rendimiento por plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.socialAccounts.map((account: any) => (
              <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {account.platform}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{account.username || account.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.followers.toLocaleString()} seguidores
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Gráficas de Rendimiento</CardTitle>
          <CardDescription>Visualización de métricas en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsCharts
            dailyMetrics={data.dailyMetrics}
            platformMetrics={data.platformMetrics}
          />
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      {data.topPosts.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Posts por Engagement</CardTitle>
                <CardDescription>Los mejores contenidos del período seleccionado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPosts.slice(0, 5).map((post: any, index: number) => (
                <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm flex-1">{post.content}</p>
                      <Badge variant="secondary" className="capitalize">
                        {post.platform}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Heart className="h-3.5 w-3.5" />
                          <span className="text-xs">Likes</span>
                        </div>
                        <p className="text-sm font-semibold">{post.likes.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-xs">Comentarios</span>
                        </div>
                        <p className="text-sm font-semibold">{post.comments.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Share2 className="h-3.5 w-3.5" />
                          <span className="text-xs">Shares</span>
                        </div>
                        <p className="text-sm font-semibold">{post.shares || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-xs">Engagement</span>
                        </div>
                        <p className="text-sm font-semibold">{post.engagement.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
