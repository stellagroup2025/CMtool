"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReportCharts } from "./report-charts"
import { TrendingUp, TrendingDown, ArrowRight, Instagram, Facebook, Twitter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ReportPreviewProps {
  report: {
    title: string
    startDate: string
    endDate: string
    data: {
      totalPosts: number
      publishedPosts: number
      scheduledPosts: number
      avgEngagement: number
      totalReach: number
      totalImpressions: number
      followerGrowth: number
      followerCount: number
      postsByPlatform: Record<string, number>
      topPosts: Array<{
        id: string
        content: string
        platform: string
        likes: number
        comments: number
        engagement: number
      }>
      worstPosts: Array<{
        id: string
        content: string
        platform: string
        likes: number
        comments: number
        engagement: number
      }>
      dailyMetrics: Array<{
        date: string
        followers: number
        posts: number
        engagement: number
        reach: number
      }>
      comparisonPreviousMonth?: {
        postsChange: number
        engagementChange: number
        followersChange: number
        reachChange: number
      }
    }
  }
}

const platformIcons: Record<string, any> = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  X: Twitter,
}

export function ReportPreview({ report }: ReportPreviewProps) {
  const { data } = report
  const comparison = data.comparisonPreviousMonth

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES").format(Math.round(num))
  }

  const formatPercent = (num: number) => {
    return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`
  }

  return (
    <div className="space-y-8 bg-white p-8 rounded-lg" id="report-preview">
      {/* Header */}
      <div className="text-center space-y-2 border-b pb-6">
        <h1 className="text-3xl font-bold">{report.title}</h1>
        <p className="text-muted-foreground">
          {format(new Date(report.startDate), "d 'de' MMMM", { locale: es })} -{" "}
          {format(new Date(report.endDate), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Resumen Ejecutivo</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPosts}</div>
              {comparison && (
                <div className="flex items-center text-sm mt-1">
                  {comparison.postsChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      comparison.postsChange >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatPercent(comparison.postsChange)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Seguidores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.followerCount)}</div>
              <div className="flex items-center text-sm mt-1">
                {data.followerGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={data.followerGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                  {data.followerGrowth >= 0 ? "+" : ""}
                  {formatNumber(data.followerGrowth)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Engagement Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.avgEngagement.toFixed(2)}%</div>
              {comparison && (
                <div className="flex items-center text-sm mt-1">
                  {comparison.engagementChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      comparison.engagementChange >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatPercent(comparison.engagementChange)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alcance Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.totalReach)}</div>
              {comparison && (
                <div className="flex items-center text-sm mt-1">
                  {comparison.reachChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      comparison.reachChange >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatPercent(comparison.reachChange)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Análisis de Métricas</h2>
        <ReportCharts data={data} />
      </div>

      {/* Top Posts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Mejores Publicaciones</h2>
        <div className="space-y-3">
          {data.topPosts.map((post, idx) => {
            const Icon = platformIcons[post.platform] || Instagram
            return (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="font-bold">
                        #{idx + 1}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{post.platform}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold">{formatNumber(post.likes)}</div>
                        <div className="text-muted-foreground text-xs">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{formatNumber(post.comments)}</div>
                        <div className="text-muted-foreground text-xs">Comentarios</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-primary">{post.engagement.toFixed(2)}%</div>
                        <div className="text-muted-foreground text-xs">Engagement</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-sm text-muted-foreground">
        <p>
          Reporte generado el {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
        <p className="mt-1">CMTool - Gestión de Redes Sociales</p>
      </div>
    </div>
  )
}
