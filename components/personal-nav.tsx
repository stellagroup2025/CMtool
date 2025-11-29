"use client"

import { Sparkles, Home, Calendar, MessageSquare, TrendingUp, Settings, Instagram, Wand2, Rocket, History, Layers, Zap, UserCog, FileImage, Package } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/personal/dashboard", icon: Home, label: "Inicio" },
  { href: "/personal/instagram", icon: Instagram, label: "Instagram" },
  { href: "/personal/content-studio", icon: Zap, label: "Content Studio" },
  { href: "/personal/carousel-generator", icon: Layers, label: "Carruseles" },
  { href: "/personal/batch-generator", icon: Rocket, label: "Generación Masiva" },
  { href: "/personal/products", icon: Package, label: "Productos" },
  { href: "/personal/templates", icon: FileImage, label: "Plantillas" },
  { href: "/personal/history", icon: History, label: "Historial" },
  { href: "/personal/ai-generator", icon: Wand2, label: "IA Generator" },
  { href: "/personal/create", icon: Sparkles, label: "Crear" },
  { href: "/personal/calendar", icon: Calendar, label: "Calendario" },
  { href: "/personal/inbox", icon: MessageSquare, label: "Mensajes" },
  { href: "/personal/analytics", icon: TrendingUp, label: "Estadísticas" },
  { href: "/personal/onboarding", icon: UserCog, label: "Configuración Inicial" },
] as const

export function PersonalNavSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <aside className="w-64 border-r border-border bg-card hidden lg:block relative flex-shrink-0">
      <div className="h-full overflow-x-hidden">
        <div className="p-6">
          <Link href="/personal/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Modo Personal</span>
          </Link>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = mounted && (pathname === item.href || pathname?.startsWith(item.href + "/"))
            return (
              <Link key={item.href} href={item.href} prefetch={true} className="block">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 text-base transition-all duration-150"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-6 w-full px-3 space-y-1">
          <Link href="/personal/settings">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 !bg-transparent hover:!bg-transparent focus-visible:!ring-0 active:!bg-transparent"
            >
              <Settings className="h-5 w-5" />
              Configuración
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}

export function PersonalNavMobile() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-50">
      <div className="flex justify-around p-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = mounted && (pathname === item.href || pathname?.startsWith(item.href + "/"))
          return (
            <Link key={item.href} href={item.href} prefetch={true}>
              <Button
                variant="ghost"
                size="icon"
                className={`h-12 w-12 transition-colors ${isActive ? 'text-primary' : ''}`}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
