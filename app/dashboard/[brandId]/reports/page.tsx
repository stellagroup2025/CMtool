"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, Eye, Download, Clock } from "lucide-react"
import { getReportsAction } from "./actions"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ReportsPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [brandId])

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await getReportsAction(brandId)
      setReports(data)
    } catch (error) {
      console.error("Error loading reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      GENERATING: { variant: "secondary", label: "Generando" },
      COMPLETED: { variant: "default", label: "Completado" },
      FAILED: { variant: "destructive", label: "Fallido" },
      SCHEDULED: { variant: "outline", label: "Programado" },
    }
    const config = variants[status] || variants.COMPLETED
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Genera y gestiona reportes de métricas y rendimiento
          </p>
        </div>
        <Link href={`/dashboard/${brandId}/reports/generate`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                reports.filter((r) => {
                  const createdDate = new Date(r.createdAt)
                  const now = new Date()
                  return (
                    createdDate.getMonth() === now.getMonth() &&
                    createdDate.getFullYear() === now.getFullYear()
                  )
                }).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Programados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === "SCHEDULED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/dashboard/${brandId}/reports/${report.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.reportNumber}
                    </CardDescription>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(report.startDate), "d MMM", { locale: es })} -{" "}
                    {format(new Date(report.endDate), "d MMM yyyy", { locale: es })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Generado {format(new Date(report.createdAt), "d 'de' MMM, yyyy", { locale: es })}
                  </span>
                </div>

                {report.data && (
                  <div className="pt-2 border-t grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Posts</div>
                      <div className="font-semibold">{report.data.totalPosts || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Engagement</div>
                      <div className="font-semibold">
                        {report.data.avgEngagement?.toFixed(1) || 0}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/${brandId}/reports/${report.id}`)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay reportes</h3>
            <p className="text-muted-foreground text-center mb-6">
              Genera tu primer reporte para analizar el rendimiento de tus redes sociales
            </p>
            <Link href={`/dashboard/${brandId}/reports/generate`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generar Primer Reporte
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
