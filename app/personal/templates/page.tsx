"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Sparkles, Plus, Eye, Trash2, Copy, Edit, X } from "lucide-react"

interface Template {
  id: string
  name: string
  category: string
  html: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

export default function TemplatesPage() {
  console.log("🚀 TemplatesPage component loaded - Version 2.0 with console logs")

  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    category: "custom" as "quote" | "tip" | "announcement" | "product" | "custom",
    html: "",
    variables: ["TITLE", "CONTENT"],
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      console.log("🔄 Loading templates...")
      const response = await fetch("/api/personal/generate-templates")
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Templates loaded:", data.templates?.length, "templates")
        console.log("📄 First template HTML preview:", data.templates?.[0]?.html?.substring(0, 100))
        setTemplates(data.templates || [])
      } else {
        toast.error("Error al cargar las plantillas")
      }
    } catch (error) {
      console.error("Error loading templates:", error)
      toast.error("Error al cargar las plantillas")
    } finally {
      setLoading(false)
    }
  }

  const generateTemplates = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/personal/generate-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numberOfTemplates: 3 }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.templates.length} plantillas generadas!`)
        await loadTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al generar plantillas")
      }
    } catch (error) {
      console.error("Error generating templates:", error)
      toast.error("Error al generar plantillas")
    } finally {
      setGenerating(false)
    }
  }

  const createTemplate = async () => {
    if (!formData.name || !formData.html) {
      toast.error("Nombre y HTML son requeridos")
      return
    }

    try {
      const response = await fetch("/api/personal/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Plantilla creada!")
        setShowCreateModal(false)
        setFormData({ name: "", category: "custom", html: "", variables: ["TITLE", "CONTENT"] })
        await loadTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear plantilla")
      }
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Error al crear plantilla")
    }
  }

  const updateTemplate = async () => {
    if (!editingTemplate) return

    try {
      const response = await fetch("/api/personal/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTemplate.id,
          ...formData,
        }),
      })

      if (response.ok) {
        toast.success("Plantilla actualizada!")
        setShowEditModal(false)
        setEditingTemplate(null)
        setFormData({ name: "", category: "custom", html: "", variables: ["TITLE", "CONTENT"] })
        await loadTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar plantilla")
      }
    } catch (error) {
      console.error("Error updating template:", error)
      toast.error("Error al actualizar plantilla")
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return

    try {
      const response = await fetch(`/api/personal/templates?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Plantilla eliminada!")
        await loadTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar plantilla")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Error al eliminar plantilla")
    }
  }

  const duplicateTemplate = async (template: Template) => {
    try {
      const response = await fetch("/api/personal/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (copia)`,
          category: template.category,
          html: template.html,
          variables: template.variables,
        }),
      })

      if (response.ok) {
        toast.success("Plantilla duplicada!")
        await loadTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al duplicar plantilla")
      }
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast.error("Error al duplicar plantilla")
    }
  }

  const openEditModal = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      category: template.category as any,
      html: template.html,
      variables: template.variables,
    })
    setShowEditModal(true)
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "quote": return "💬"
      case "tip": return "💡"
      case "announcement": return "📢"
      case "product": return "🛍️"
      default: return "✨"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "quote": return "Cita"
      case "tip": return "Consejo"
      case "announcement": return "Anuncio"
      case "product": return "Producto"
      default: return "Personalizado"
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando plantillas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Plantillas de Posts
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestiona tus plantillas personalizadas para crear contenido más rápido
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="outline"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Plantilla
              </Button>
              <Button
                onClick={generateTemplates}
                disabled={generating}
                size="lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar con IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total de plantillas: {templates.length}</span>
            <span>•</span>
            <span>Máximo: 20 plantillas</span>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes plantillas aún</h3>
              <p className="text-muted-foreground mb-6">
                Genera tus primeras plantillas con IA o crea una manualmente
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowCreateModal(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Manualmente
                </Button>
                <Button onClick={generateTemplates} disabled={generating}>
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar con IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              console.log("🎨 Rendering template card:", template.name, "HTML length:", template.html?.length)
              return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryEmoji(template.category)}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {getCategoryLabel(template.category)}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Preview using scaled div */}
                  <div
                    className="bg-muted rounded-lg mb-4 overflow-hidden relative"
                    style={{
                      width: "100%",
                      paddingBottom: "100%", // Aspect ratio 1:1
                      position: "relative"
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        transform: "scale(0.3)",
                        transformOrigin: "top left",
                        width: "1080px",
                        height: "1080px"
                      }}
                      dangerouslySetInnerHTML={{
                        __html: template.html
                          .replace(/\{\{TITLE\}\}/g, "Título de ejemplo")
                          .replace(/\{\{CONTENT\}\}/g, "Contenido de ejemplo")
                      }}
                    />
                  </div>

                  {/* Variables */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="text-xs bg-secondary px-2 py-1 rounded font-mono"
                        >
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <Card
              className="max-w-6xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Preview */}
                  <div>
                    <p className="text-sm font-medium mb-2">Vista previa:</p>
                    <div className="border rounded-lg overflow-hidden bg-muted" style={{ width: "500px", height: "500px" }}>
                      <div
                        style={{
                          transform: "scale(0.46)",
                          transformOrigin: "top left",
                          width: "1080px",
                          height: "1080px"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedTemplate.html
                            .replace(/\{\{TITLE\}\}/g, "Título de ejemplo")
                            .replace(/\{\{CONTENT\}\}/g, "Contenido de ejemplo para demostración")
                        }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Categoría:</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryEmoji(selectedTemplate.category)}</span>
                        <span className="text-sm">{getCategoryLabel(selectedTemplate.category)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.variables.map((variable) => (
                          <span
                            key={variable}
                            className="text-xs bg-secondary px-2 py-1 rounded font-mono"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Código HTML:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                        <code>{selectedTemplate.html}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <Card
              className="max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Crear Plantilla Personalizada</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre de la plantilla</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Mi plantilla personalizada"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="custom">Personalizado</option>
                    <option value="quote">Cita</option>
                    <option value="tip">Consejo</option>
                    <option value="announcement">Anuncio</option>
                    <option value="product">Producto</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="html">Código HTML (1080x1080px)</Label>
                  <Textarea
                    id="html"
                    value={formData.html}
                    onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                    placeholder="<div style='width:1080px;height:1080px;...'>{{TITLE}}{{CONTENT}}</div>"
                    rows={15}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Usa {"{{TITLE}}"} y {"{{CONTENT}}"} como placeholders
                  </p>
                </div>

                {/* Live Preview */}
                {formData.html && (
                  <div>
                    <Label>Vista previa:</Label>
                    <div className="border rounded-lg overflow-hidden bg-muted mt-2 max-w-md mx-auto" style={{ width: "432px", height: "432px" }}>
                      <div
                        style={{
                          transform: "scale(0.4)",
                          transformOrigin: "top left",
                          width: "1080px",
                          height: "1080px"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: formData.html
                            .replace(/\{\{TITLE\}\}/g, "Título")
                            .replace(/\{\{CONTENT\}\}/g, "Contenido")
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={createTemplate}>
                    Crear Plantilla
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Template Modal */}
        {showEditModal && editingTemplate && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <Card
              className="max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editar Plantilla</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nombre de la plantilla</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-category">Categoría</Label>
                  <select
                    id="edit-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="custom">Personalizado</option>
                    <option value="quote">Cita</option>
                    <option value="tip">Consejo</option>
                    <option value="announcement">Anuncio</option>
                    <option value="product">Producto</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="edit-html">Código HTML</Label>
                  <Textarea
                    id="edit-html"
                    value={formData.html}
                    onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                    rows={15}
                    className="font-mono text-xs"
                  />
                </div>

                {/* Live Preview */}
                {formData.html && (
                  <div>
                    <Label>Vista previa:</Label>
                    <div className="border rounded-lg overflow-hidden bg-muted mt-2 max-w-md mx-auto" style={{ width: "432px", height: "432px" }}>
                      <div
                        style={{
                          transform: "scale(0.4)",
                          transformOrigin: "top left",
                          width: "1080px",
                          height: "1080px"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: formData.html
                            .replace(/\{\{TITLE\}\}/g, "Título")
                            .replace(/\{\{CONTENT\}\}/g, "Contenido")
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={updateTemplate}>
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
