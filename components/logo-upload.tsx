"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"

export function LogoUpload() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadLogo()
  }, [])

  const loadLogo = async () => {
    try {
      const response = await fetch("/api/personal/upload-logo")
      if (response.ok) {
        const data = await response.json()
        setLogoUrl(data.logoUrl)
      }
    } catch (error) {
      console.error("Error loading logo:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo debe ser menor a 5MB")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("logo", file)

      const response = await fetch("/api/personal/upload-logo", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setLogoUrl(data.logoUrl)
        toast.success("Logo subido exitosamente")
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al subir el logo")
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast.error("Error al subir el logo")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar el logo?")) return

    setDeleting(true)

    try {
      const response = await fetch("/api/personal/upload-logo", {
        method: "DELETE",
      })

      if (response.ok) {
        setLogoUrl(null)
        toast.success("Logo eliminado")
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar el logo")
      }
    } catch (error) {
      console.error("Error deleting logo:", error)
      toast.error("Error al eliminar el logo")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Logo Preview */}
      {logoUrl && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Logo actual</Label>
            <div className="mt-2 flex items-start gap-4">
              <div className="border rounded-lg p-4 bg-muted/50 w-48 h-48 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground break-all">
                  {logoUrl}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Logo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Cambiar logo</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Sube un nuevo logo para reemplazar el actual
            </p>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload First Logo */}
      {!logoUrl && (
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes un logo aún</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sube un logo para usarlo en tus plantillas y contenido
            </p>
            <div className="max-w-md mx-auto">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="mb-3"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Seleccionar Logo
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos: PNG, JPG, SVG • Tamaño máximo: 5MB
            </p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2">💡 Consejos para tu logo</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Usa un fondo transparente (PNG) para mejor integración</li>
          <li>• Resolución recomendada: mínimo 500x500px</li>
          <li>• Formato cuadrado funciona mejor para redes sociales</li>
          <li>• El logo se usará en plantillas, carruseles y posts generados</li>
        </ul>
      </div>
    </div>
  )
}
