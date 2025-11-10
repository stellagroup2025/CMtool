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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Trash2 } from "lucide-react"
import { createQuoteAction } from "@/app/clients/quote-actions"
import { getClientsListAction } from "@/app/clients/actions"
import { useRouter } from "next/navigation"

interface QuoteFormDialogProps {
  clientId?: string
  trigger?: React.ReactNode
}

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export function QuoteFormDialog({ clientId, trigger }: QuoteFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [selectedClientId, setSelectedClientId] = useState(clientId || "")
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    validUntil: "",
    notes: "",
  })

  const [items, setItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const [tax, setTax] = useState(21) // IVA default 21%
  const [discount, setDiscount] = useState(0)

  // Load clients list when dialog opens (only if clientId not provided)
  useEffect(() => {
    if (open && !clientId) {
      getClientsListAction().then(setClients)
    }
  }, [open, clientId])

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = (subtotal * tax) / 100
    const discountAmount = (subtotal * discount) / 100
    return subtotal + taxAmount - discountAmount
  }

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }

    // Recalculate total for this item
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = calculateItemTotal(newItems[index].quantity, newItems[index].unitPrice)
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      alert("Por favor selecciona un cliente")
      return
    }

    setLoading(true)

    try {
      const subtotal = calculateSubtotal()
      const total = calculateTotal()

      await createQuoteAction({
        clientId: selectedClientId,
        title: formData.title,
        description: formData.description || undefined,
        items,
        subtotal,
        tax,
        discount,
        total,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
        notes: formData.notes || undefined,
      })

      setOpen(false)
      setFormData({
        title: "",
        description: "",
        validUntil: "",
        notes: "",
      })
      setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }])
      setTax(21)
      setDiscount(0)
      setSelectedClientId(clientId || "")
      router.refresh()
    } catch (error) {
      console.error("Error creating quote:", error)
      alert("Error al crear el presupuesto")
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
            Nuevo Presupuesto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nuevo Presupuesto
          </DialogTitle>
          <DialogDescription>Crea un nuevo presupuesto para el cliente</DialogDescription>
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
              <Label htmlFor="title">Título del Presupuesto *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Servicios de Marketing Digital Q1 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del presupuesto..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Válido Hasta</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Conceptos</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3 w-3 mr-1" />
                Añadir Concepto
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start p-4 border rounded-lg">
                  <div className="col-span-5">
                    <Label htmlFor={`description-${index}`} className="text-xs">
                      Descripción *
                    </Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Ej: Gestión de redes sociales"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`} className="text-xs">
                      Cantidad *
                    </Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`unitPrice-${index}`} className="text-xs">
                      Precio Unit. *
                    </Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <div className="h-10 flex items-center font-semibold">
                      €{item.total.toFixed(2)}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="h-10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cálculos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Cálculos</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax">IVA (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Descuento (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">€{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA ({tax}%):</span>
                <span className="font-medium">€{((calculateSubtotal() * tax) / 100).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Descuento ({discount}%):</span>
                  <span className="font-medium">-€{((calculateSubtotal() * discount) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>€{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales o condiciones..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Presupuesto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
