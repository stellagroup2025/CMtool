"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function ResetModeTemp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/reset-mode", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success("¡Modo reseteado correctamente!")
      } else {
        toast.error(data.error || "Error al resetear modo")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    window.location.href = "/api/auth/signout"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Resetear Modo de Usuario
          </CardTitle>
          <CardDescription>
            Página temporal para resetear tu modo y poder seleccionar Modo Personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success ? (
            <>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Pasos a seguir:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Haz clic en "Resetear Modo"</li>
                      <li>Cierra sesión</li>
                      <li>Vuelve a iniciar sesión con Google</li>
                      <li>Selecciona "Modo Personal"</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleReset}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Reseteando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Resetear Modo
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-500 mb-1">
                      ¡Modo reseteado exitosamente!
                    </p>
                    <p className="text-muted-foreground">
                      Ahora cierra sesión y vuelve a iniciar sesión para seleccionar el Modo Personal.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                Cerrar Sesión
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Después de cerrar sesión, vuelve a <code>/login</code>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
