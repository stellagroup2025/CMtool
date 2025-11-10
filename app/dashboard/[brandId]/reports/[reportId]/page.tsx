"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Mail, Trash2 } from "lucide-react"
import { ReportPreview } from "../components/report-preview"
import { getReportDetailAction, deleteReportAction } from "../actions"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string
  const reportId = params.reportId as string

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    setLoading(true)
    try {
      const data = await getReportDetailAction(reportId, brandId)
      setReport(data)
    } catch (error) {
      console.error("Error loading report:", error)
      alert("Error al cargar el reporte")
      router.push(`/dashboard/${brandId}/reports`)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  })

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`reporte-${report.reportNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error al generar el PDF")
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este reporte?")) return

    try {
      await deleteReportAction(reportId, brandId)
      router.push(`/dashboard/${brandId}/reports`)
    } catch (error) {
      console.error("Error deleting report:", error)
      alert("Error al eliminar el reporte")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Cargando reporte...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Reporte no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${brandId}/reports`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{report.reportNumber}</h1>
            <p className="text-muted-foreground">{report.title}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="outline" disabled>
            <Mail className="h-4 w-4 mr-2" />
            Enviar por Email
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div ref={reportRef}>
        <ReportPreview report={report} />
      </div>
    </div>
  )
}
