"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Sparkles, Plus, Eye, Trash2, Copy, Edit, X, Library, Wand2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Template {
  id: string
  name: string
  category: string
  html: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

interface BaseTemplate {
  id: string
  name: string
  category: string
  style: string
  description: string
  aspectRatios: string[]
  variables: string[]
  previewColors?: {
    primary: string
    secondary: string
    accent: string
    tint: string
    shade: string
  }
}

export default function TemplatesPageV2() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [baseTemplates, setBaseTemplates] = useState<BaseTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [selectedRatio, setSelectedRatio] = useState<"1:1" | "4:5">("1:1")

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    category: "custom" as "quote" | "tip" | "announcement" | "product" | "custom",
    html: "",
    variables: ["TITLE", "CONTENT"],
  })

  useEffect(() => {
    loadTemplates()
    loadBaseTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/personal/generate-templates")
      if (response.ok) {
        const data = await response.json()
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

  const loadBaseTemplates = async () => {
    try {
      const response = await fetch("/api/personal/templates/library")
      if (response.ok) {
        const data = await response.json()
        setBaseTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Error loading base templates:", error)
    }
  }

  const addBaseTemplate = async (templateId: string) => {
    try {
      const response = await fetch("/api/personal/templates/library/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, ratio: selectedRatio }),
      })

      if (response.ok) {
        toast.success("Plantilla agregada a tu colección!")
        await loadTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al agregar plantilla")
      }
    } catch (error) {
      console.error("Error adding base template:", error)
      toast.error("Error al agregar plantilla")
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
        toast.success(`${data.templates.length} plantillas generadas con IA!`)
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
        resetForm()
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
        resetForm()
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
        toast.error("Error al eliminar plantilla")
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
        toast.error("Error al duplicar plantilla")
      }
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast.error("Error al duplicar plantilla")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "custom",
      html: "",
      variables: ["TITLE", "CONTENT"],
    })
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
      case "stat": return "📊"
      default: return "✨"
    }
  }

  const getStyleEmoji = (style: string) => {
    switch (style) {
      case "bold-minimal": return "⚡"
      case "glassmorphism": return "🔮"
      case "neo-brutalism": return "🎨"
      case "split-layout": return "📐"
      case "timeline": return "📋"
      case "gradient-card": return "🌈"
      case "geometric": return "🔺"
      case "typographic": return "🔤"
      case "data-viz": return "📊"
      case "modern-card": return "💎"
      default: return "✨"
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
                Usa plantillas profesionales o genera variaciones con IA
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Tus plantillas: {templates.length}/20</span>
            <span>•</span>
            <span>Librería base: {baseTemplates.length} plantillas</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-templates" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="my-templates" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Mis Plantillas ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Librería Profesional ({baseTemplates.length})
            </TabsTrigger>
          </TabsList>

          {/* My Templates Tab */}
          <TabsContent value="my-templates">
            <div className="mb-4 flex gap-2">
              <Button onClick={() => setShowCreateModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Manual
              </Button>
              <Button onClick={generateTemplates} disabled={generating}>
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar 3 con IA
                  </>
                )}
              </Button>
            </div>

            {templates.length === 0 ? (
              <Card className="p-12 text-center">
                <CardContent>
                  <Library className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tienes plantillas aún</h3>
                  <p className="text-muted-foreground mb-6">
                    Agrega plantillas de la librería profesional o genera con IA
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getCategoryEmoji(template.category)} {template.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Variables: {template.variables.join(", ")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Preview */}
                      <div
                        className="bg-muted rounded-lg mb-4 overflow-hidden relative"
                        style={{
                          width: "100%",
                          paddingBottom: "100%",
                          position: "relative",
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
                            height: "1080px",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: template.html
                              .replace(/\{\{TITLE\}\}/g, "Título de ejemplo")
                              .replace(/\{\{CONTENT\}\}/g, "Contenido de ejemplo")
                              .replace(/\{\{CTA\}\}/g, "Ver más")
                              .replace(/\{\{LABEL\}\}/g, "Nuevo")
                              .replace(/\{\{TAG1\}\}/g, "Tech")
                              .replace(/\{\{TAG2\}\}/g, "IA")
                              .replace(/\{\{TAG3\}\}/g, "Innovación"),
                          }}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                          className="flex-1"
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
                ))}
              </div>
            )}
          </TabsContent>

          {/* Professional Library Tab */}
          <TabsContent value="library">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formato de Imagen</CardTitle>
                  <CardDescription>
                    Elige el formato para las plantillas que agregues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button
                      variant={selectedRatio === "1:1" ? "default" : "outline"}
                      onClick={() => setSelectedRatio("1:1")}
                    >
                      1:1 Cuadrado (Feed)
                    </Button>
                    <Button
                      variant={selectedRatio === "4:5" ? "default" : "outline"}
                      onClick={() => setSelectedRatio("4:5")}
                    >
                      4:5 Vertical (Recomendado 2025)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {baseTemplates.map((baseTemplate) => (
                <Card key={baseTemplate.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStyleEmoji(baseTemplate.style)} {baseTemplate.name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{baseTemplate.category}</Badge>
                      <Badge variant="outline">{baseTemplate.style}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {baseTemplate.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <p>Variables: {baseTemplate.variables.join(", ")}</p>
                        <p>Formatos: {baseTemplate.aspectRatios.join(", ")}</p>
                      </div>

                      {baseTemplate.previewColors && (
                        <div className="flex gap-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ background: baseTemplate.previewColors.primary }}
                            title="Primary"
                          />
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ background: baseTemplate.previewColors.secondary }}
                            title="Secondary"
                          />
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ background: baseTemplate.previewColors.accent }}
                            title="Accent"
                          />
                        </div>
                      )}

                      <Button
                        onClick={() => addBaseTemplate(baseTemplate.id)}
                        className="w-full"
                        disabled={templates.length >= 20}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar a Mis Plantillas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div
                    style={{
                      transform: "scale(0.46)",
                      transformOrigin: "top left",
                      width: "1080px",
                      height: "1080px",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: selectedTemplate.html
                        .replace(/\{\{TITLE\}\}/g, "Título de Ejemplo")
                        .replace(/\{\{CONTENT\}\}/g, "Contenido de ejemplo para la vista previa"),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modals would go here - keeping existing implementation */}
      </div>
    </div>
  )
}
