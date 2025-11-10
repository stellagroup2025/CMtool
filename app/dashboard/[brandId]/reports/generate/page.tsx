"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, FileText, ArrowLeft } from "lucide-react"
import { generateReportAction } from "../actions"
import { useParams, useRouter } from "next/navigation"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import Link from "next/link"

export default function GenerateReportPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [period, setPeriod] = useState("last-month")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const handleGenerate = async () => {
    setLoading(true)
    try {
      let startDate: Date
      let endDate: Date

      if (period === "custom") {
        if (!customStartDate || !customEndDate) {
          alert("Por favor selecciona un rango de fechas")
          setLoading(false)
          return
        }
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate)
      } else {
        const now = new Date()
        switch (period) {
          case "this-month":
            startDate = startOfMonth(now)
            endDate = endOfMonth(now)
            break
          case "last-month":
            startDate = startOfMonth(subMonths(now, 1))
            endDate = endOfMonth(subMonths(now, 1))
            break
          case "last-3-months":
            startDate = startOfMonth(subMonths(now, 3))
            endDate = endOfMonth(subMonths(now, 1))
            break
          default:
            startDate = startOfMonth(subMonths(now, 1))
            endDate = endOfMonth(subMonths(now, 1))
        }
      }

      const report = await generateReportAction(
        brandId,
        startDate,
        endDate,
        title || undefined
      )

      router.push(`/dashboard/${brandId}/reports/${report.id}`)
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Error al generar el reporte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${brandId}/reports`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Generar Reporte</h1>
          <p className="text-muted-foreground">Crea un nuevo reporte de métricas y rendimiento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Reporte</CardTitle>
          <CardDescription>Define el período y los parámetros del reporte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del Reporte (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reporte Mensual de Octubre 2025"
            />
            <p className="text-xs text-muted-foreground">
              Si no especificas un título, se generará automáticamente
            </p>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">Este mes</SelectItem>
                <SelectItem value="last-month">Mes pasado</SelectItem>
                <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {period === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h3 className="font-semibold text-sm">El reporte incluirá:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Resumen ejecutivo de métricas</li>
              <li>✓ Gráficas de crecimiento y engagement</li>
              <li>✓ Top 5 mejores publicaciones</li>
              <li>✓ Posts por plataforma</li>
              <li>✓ Comparativa con período anterior</li>
              <li>✓ Análisis de alcance e impresiones</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
