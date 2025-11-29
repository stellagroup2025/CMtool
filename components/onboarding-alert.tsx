"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X, ArrowRight } from "lucide-react"

export function OnboardingAlert() {
  const router = useRouter()
  const pathname = usePathname()
  const [showAlert, setShowAlert] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      // Don't show on onboarding page itself
      if (pathname === "/personal/onboarding") {
        setLoading(false)
        return
      }

      const response = await fetch("/api/personal/dashboard")
      if (response.ok) {
        const data = await response.json()

        // Show alert if onboarding is not completed and user hasn't dismissed it
        if (data.onboardingCompleted === false && !dismissed) {
          setShowAlert(true)
        }
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShowAlert(false)
  }

  const handleComplete = () => {
    router.push("/personal/onboarding")
  }

  if (loading || !showAlert || pathname === "/personal/onboarding") {
    return null
  }

  return (
    <div className="w-full px-6 pt-6">
      <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <AlertTitle className="text-amber-900 dark:text-amber-100 pr-8">
          Completa tu configuracion inicial
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Para obtener contenido mas personalizado y relevante, completa tu perfil con informacion sobre tu negocio, audiencia y estilo de marca.
        </AlertDescription>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={handleComplete}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Completar ahora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/20"
          >
            Recordar despues
          </Button>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        </button>
      </Alert>
    </div>
  )
}
