"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Target } from "lucide-react"
import { createLeadAction } from "@/app/clients/lead-actions"
import { useRouter } from "next/navigation"

interface LeadFormDialogProps {
  trigger?: React.ReactNode
  clientId?: string
}

export function LeadFormDialog({ trigger, clientId }: LeadFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    source: "OTHER",
    estimatedValue: "",
    probability: "50",
    expectedCloseDate: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createLeadAction({
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        source: formData.source,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        probability: parseInt(formData.probability),
        expectedCloseDate: formData.expectedCloseDate
          ? new Date(formData.expectedCloseDate)
          : undefined,
        notes: formData.notes || undefined,
        clientId: clientId || undefined,
      })

      setOpen(false)
      setFormData({
        companyName: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        source: "OTHER",
        estimatedValue: "",
        probability: "50",
        expectedCloseDate: "",
        notes: "",
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating lead:", error)
      alert("Error al crear el prospecto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Prospecto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Nuevo Prospecto / Lead
          </DialogTitle>
          <DialogDescription>
            Añade un nuevo prospecto para hacer seguimiento de oportunidades de negocio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la empresa */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Información de la Empresa</h3>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la Empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ej: Empresa XYZ S.L."
                required
              />
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Información de Contacto</h3>

            <div className="space-y-2">
              <Label htmlFor="contactName">Nombre del Contacto *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="juan@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Detalles de oportunidad */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Detalles de la Oportunidad</h3>

            <div className="space-y-2">
              <Label htmlFor="source">Fuente del Prospecto</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBSITE">Sitio Web</SelectItem>
                  <SelectItem value="REFERRAL">Referido</SelectItem>
                  <SelectItem value="SOCIAL_MEDIA">Redes Sociales</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="COLD_CALL">Llamada en Frío</SelectItem>
                  <SelectItem value="EVENT">Evento</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Valor Estimado (€)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  placeholder="5000.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">Probabilidad de Cierre (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Fecha Esperada de Cierre</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre el prospecto..."
              rows={3}
            />
          </div>

          {/* Valor potencial destacado */}
          {formData.estimatedValue && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valor Potencial:</span>
                <span className="text-2xl font-bold">
                  €{parseFloat(formData.estimatedValue).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">Probabilidad de cierre:</span>
                <span className="text-sm font-medium">{formData.probability}%</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">Valor ponderado:</span>
                <span className="text-sm font-semibold text-primary">
                  €
                  {(
                    (parseFloat(formData.estimatedValue) * parseInt(formData.probability)) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Prospecto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
