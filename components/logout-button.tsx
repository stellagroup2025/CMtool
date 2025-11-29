"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      toast.success("Cerrando sesión...")
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      toast.error("Error al cerrar sesión")
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="w-full justify-start gap-3 !bg-transparent hover:!bg-transparent !border-transparent focus-visible:!ring-0 active:!bg-transparent"
    >
      <LogOut className="h-4 w-4" />
      Cerrar Sesión
    </Button>
  )
}
