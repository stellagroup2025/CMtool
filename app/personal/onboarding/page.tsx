"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { INDUSTRIES, BRAND_PERSONALITIES } from "@/lib/onboarding-constants"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companyDescription: "",
    targetAudience: "",
    brandPersonality: [] as string[],
    brandColors: [] as string[],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [generatingTemplates, setGeneratingTemplates] = useState(false)

  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      const response = await fetch("/api/personal/dashboard")
      if (response.ok) {
        const data = await response.json()

        // If onboarding is already completed, load the data
        if (data.onboardingCompleted) {
          setFormData({
            companyName: data.name || "",
            industry: data.industry || "",
            companyDescription: data.companyDescription || "",
            targetAudience: data.targetAudience || "",
            brandPersonality: data.brandPersonality || [],
            brandColors: data.brandColors || [],
          })
          setIsEditing(true)
        }
      }
    } catch (error) {
      console.error("Error loading existing data:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const progress = (currentStep / 5) * 100

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          industry: formData.industry,
          companyDescription: formData.companyDescription,
          targetAudience: formData.targetAudience,
          brandPersonality: formData.brandPersonality,
          brandColors: formData.brandColors,
          objective: "grow",
          industryOther: "",
          logoUrl: "",
          templates: [],
        }),
      })

      if (!response.ok) {
        throw new Error("Error al completar el onboarding")
      }

      toast.success(isEditing ? "Configuracion actualizada!" : "Onboarding completado!")
      router.push("/personal/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error completing onboarding:", error)
      toast.error("Error al completar el onboarding")
    } finally {
      setLoading(false)
    }
  }

  const canProceedStep1 = formData.companyName.trim() !== "" && formData.industry !== ""
  const canProceedStep2 = formData.companyDescription.trim() !== ""
  const canProceedStep3 = formData.targetAudience.trim() !== ""
  const canProceedStep4 = formData.brandPersonality.length > 0
  const canProceedStep5 = formData.brandColors.length >= 2 && formData.brandColors.length <= 5

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Configuracion Inicial</h1>
          </div>
          <p className="text-muted-foreground">
            Ayudanos a conocer tu negocio para generar contenido personalizado
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Paso 1</span>
            <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Paso 2</span>
            <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Paso 3</span>
            <span className={currentStep >= 4 ? "text-primary font-medium" : ""}>Paso 4</span>
            <span className={currentStep >= 5 ? "text-primary font-medium" : ""}>Paso 5</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Informacion Basica"}
              {currentStep === 2 && "Descripcion de tu Negocio"}
              {currentStep === 3 && "Tu Audiencia"}
              {currentStep === 4 && "Personalidad de Marca"}
              {currentStep === 5 && "Colores de tu Marca"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="companyName">Nombre de tu Empresa</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Ej: Mi Empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industria</Label>
                  <select
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Selecciona una industria</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.emoji} {ind.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div>
                <Label htmlFor="description">Describe tu negocio</Label>
                <Textarea
                  id="description"
                  value={formData.companyDescription}
                  onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                  placeholder="Describe que hace tu empresa, tus servicios o productos..."
                  rows={6}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <Label htmlFor="audience">Tu Audiencia Objetivo</Label>
                <Textarea
                  id="audience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="Describe a quien van dirigidos tus productos o servicios..."
                  rows={6}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <Label>Personalidad de tu Marca (selecciona al menos una)</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {BRAND_PERSONALITIES.map((personality) => (
                    <button
                      key={personality.value}
                      type="button"
                      onClick={() => {
                        const current = formData.brandPersonality
                        if (current.includes(personality.value)) {
                          setFormData({
                            ...formData,
                            brandPersonality: current.filter((p) => p !== personality.value),
                          })
                        } else {
                          setFormData({
                            ...formData,
                            brandPersonality: [...current, personality.value],
                          })
                        }
                      }}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.brandPersonality.includes(personality.value)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{personality.icon}</div>
                      <div className="font-medium">{personality.label}</div>
                      <div className="text-sm text-muted-foreground">{personality.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <Label>Colores de tu Marca (selecciona entre 2 y 5 colores)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Estos colores se usarán para crear tus plantillas de posts personalizadas
                </p>

                <div className="space-y-4">
                  {/* Color picker */}
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      className="w-20 h-10 cursor-pointer"
                      onChange={(e) => {
                        const newColor = e.target.value
                        if (formData.brandColors.length < 5 && !formData.brandColors.includes(newColor)) {
                          setFormData({
                            ...formData,
                            brandColors: [...formData.brandColors, newColor],
                          })
                        }
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Haz clic para agregar un color
                    </span>
                  </div>

                  {/* Lista de colores seleccionados */}
                  {formData.brandColors.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Colores seleccionados ({formData.brandColors.length}/5)</Label>
                      <div className="flex flex-wrap gap-3">
                        {formData.brandColors.map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 border rounded-lg bg-card"
                          >
                            <div
                              className="w-10 h-10 rounded border"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-sm font-mono">{color}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  brandColors: formData.brandColors.filter((_, i) => i !== index),
                                })
                              }}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.brandColors.length < 2 && (
                    <p className="text-sm text-amber-600">
                      Necesitas seleccionar al menos 2 colores para continuar
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3) ||
                    (currentStep === 4 && !canProceedStep4)
                  }
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceedStep5 || loading}
                >
                  {loading ? "Guardando..." : isEditing ? "Actualizar" : "Completar"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
