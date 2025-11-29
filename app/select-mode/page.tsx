"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, Check } from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect } from "react"

const MODES = [
  {
    id: "personal",
    title: "Modo Personal",
    description: "Para creadores individuales y marca personal",
    icon: Sparkles,
    features: [
      "Dashboard simplificado e intuitivo",
      "Generador de contenido con IA",
      "Calendario semanal simplificado",
      "Inbox unificado con respuestas IA",
      "Analytics básico y accionable",
      "Sin complejidad de equipos",
    ],
    color: "from-purple-500 to-pink-500",
    target: "/personal/onboarding",
  },
  {
    id: "agency",
    title: "Modo Agencia",
    description: "Para equipos, agencias y múltiples clientes",
    icon: Users,
    features: [
      "Gestión de múltiples marcas",
      "Control de roles y permisos",
      "Colaboración en equipo",
      "Dashboard avanzado",
      "Analytics detallados",
      "Reportes personalizados",
    ],
    color: "from-blue-500 to-cyan-500",
    target: "/brands",
  },
]

export default function SelectModePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  // Check if user already has a mode set
  useEffect(() => {
    const checkUserMode = async () => {
      try {
        const response = await fetch("/api/user/me")
        if (response.ok) {
          const userData = await response.json()
          if (userData.mode) {
            // User already has a mode, redirect them
            if (userData.mode === "PERSONAL") {
              router.push("/personal/dashboard")
            } else {
              router.push("/brands")
            }
            return
          }
        }
      } catch (error) {
        console.error("Error checking user mode:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUserMode()
  }, [router])

  const handleSelectMode = async (modeId: string, target: string) => {
    setSelectedMode(modeId)
    setLoading(true)

    try {
      // Update user mode in database
      const response = await fetch("/api/user/update-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: modeId.toUpperCase() }),
      })

      if (!response.ok) throw new Error("Error updating mode")

      const data = await response.json()

      toast.success(
        modeId === "personal"
          ? "¡Bienvenido al Modo Personal!"
          : "¡Bienvenido al Modo Agencia!"
      )

      // Force a full page reload to refresh the session with new mode
      setTimeout(() => {
        window.location.href = target
      }, 800)
    } catch (error) {
      toast.error("Error al seleccionar modo")
      setLoading(false)
      setSelectedMode(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando tu cuenta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            ¡Bienvenido! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            ¿Cómo te gustaría usar la plataforma?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            No te preocupes, podrás cambiar de modo más adelante
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {MODES.map((mode) => (
            <Card
              key={mode.id}
              className={`border-2 transition-all duration-300 cursor-pointer ${
                selectedMode === mode.id
                  ? "border-primary shadow-xl scale-105"
                  : "border-border hover:border-primary/50 hover:shadow-lg"
              }`}
              onClick={() => !loading && handleSelectMode(mode.id, mode.target)}
            >
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${mode.color}`}
                  >
                    <mode.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{mode.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {mode.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectMode(mode.id, mode.target)
                  }}
                >
                  {loading && selectedMode === mode.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Cargando...
                    </>
                  ) : (
                    <>Seleccionar {mode.title}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            ¿Tienes dudas?{" "}
            <a
              href="#"
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault()
                toast.info("Puedes contactarnos en soporte@ejemplo.com")
              }}
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
