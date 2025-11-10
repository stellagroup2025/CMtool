"use client"

import { useState, useEffect } from "react"
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
import { Plus, FileSignature } from "lucide-react"
import { createContractAction } from "@/app/clients/contract-actions"
import { getClientsListAction } from "@/app/clients/actions"
import { useRouter } from "next/navigation"

interface ContractFormDialogProps {
  clientId?: string
  trigger?: React.ReactNode
}

export function ContractFormDialog({ clientId, trigger }: ContractFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [selectedClientId, setSelectedClientId] = useState(clientId || "")
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    value: "",
    billingCycle: "monthly",
    terms: "",
    notes: "",
  })

  // Load clients list when dialog opens (only if clientId not provided)
  useEffect(() => {
    if (open && !clientId) {
      getClientsListAction().then(setClients)
    }
  }, [open, clientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      alert("Por favor selecciona un cliente")
      return
    }

    setLoading(true)

    try {
      await createContractAction({
        clientId: selectedClientId,
        title: formData.title,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        value: parseFloat(formData.value),
        billingCycle: formData.billingCycle || undefined,
        terms: formData.terms || undefined,
        notes: formData.notes || undefined,
      })

      setOpen(false)
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        value: "",
        billingCycle: "monthly",
        terms: "",
        notes: "",
      })
      setSelectedClientId(clientId || "")
      router.refresh()
    } catch (error) {
      console.error("Error creating contract:", error)
      alert("Error al crear el contrato")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contrato
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Nuevo Contrato
          </DialogTitle>
          <DialogDescription>Crea un nuevo contrato para el cliente</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente selection (only if not provided) */}
          {!clientId && (
            <div className="space-y-2">
              <Label htmlFor="clientSelect">Cliente *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Información Básica</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Título del Contrato *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Servicios de Gestión de Redes Sociales"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del contrato..."
                rows={2}
              />
            </div>
          </div>

          {/* Fechas y facturación */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Fechas y Facturación</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Finalización</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Dejar vacío para contratos indefinidos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor del Contrato (€) *</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="1000.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCycle">Ciclo de Facturación</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="biannual">Semestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="one-time">Pago Único</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Términos y Condiciones</h3>

            <div className="space-y-2">
              <Label htmlFor="terms">Términos del Contrato</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Términos y condiciones del contrato..."
                rows={4}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Internas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas internas sobre el contrato..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Estas notas son privadas y no se mostrarán al cliente
            </p>
          </div>

          {/* Valor total destacado */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Valor Total del Contrato:</span>
              <span className="text-2xl font-bold">
                €{formData.value ? parseFloat(formData.value).toFixed(2) : "0.00"}
              </span>
            </div>
            {formData.billingCycle && formData.billingCycle !== "one-time" && (
              <p className="text-xs text-muted-foreground mt-2">
                Facturación: {formData.billingCycle === "monthly" && "Mensual"}
                {formData.billingCycle === "quarterly" && "Trimestral"}
                {formData.billingCycle === "biannual" && "Semestral"}
                {formData.billingCycle === "yearly" && "Anual"}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Contrato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
