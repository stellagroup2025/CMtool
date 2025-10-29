"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  PenSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  Bell,
  Search,
  LogOut,
  Instagram,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import type React from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Instagram", href: "/instagram", icon: Instagram },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Create Post", href: "/create", icon: PenSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface DashboardLayoutClientProps {
  children: React.ReactNode
  brand: {
    id: string
    name: string
    logo: string | null
    socialAccounts: any[]
    pendingConversations: number
  }
}

export function DashboardLayoutClient({ children, brand }: DashboardLayoutClientProps) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const brandId = params.brandId as string

  const isActive = (href: string) => {
    const fullPath = `/dashboard/${brandId}${href === "/dashboard" ? "" : href}`
    return pathname === fullPath
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Brand Header */}
          <div className="border-b border-border p-6 space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/brands")}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              All Brands
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarImage src={brand.logo || "/placeholder.svg"} alt={brand.name} />
                <AvatarFallback className="rounded-xl bg-muted">{brand.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{brand.name}</p>
                <p className="text-xs text-muted-foreground">{brand.socialAccounts.length} accounts</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Button
                  key={item.name}
                  variant={active ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    active
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => router.push(`/dashboard/${brandId}${item.href === "/dashboard" ? "" : item.href}`)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                  {item.name === "Inbox" && brand.pendingConversations > 0 && (
                    <Badge className="ml-auto bg-primary text-primary-foreground">
                      {brand.pendingConversations}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || "/placeholder-user.jpg"} alt="User" />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name || session?.user?.email}</p>
                <p className="text-xs text-muted-foreground">Account</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-6">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search posts, messages, analytics..." className="pl-10 bg-muted/50 border-border" />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {brand.pendingConversations > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
