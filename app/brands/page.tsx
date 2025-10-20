"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, TrendingUp, MessageSquare, Users } from "lucide-react"
import { mockBrands } from "@/lib/mock-data"
import type { Brand } from "@/lib/mock-data"

export default function BrandsPage() {
  const router = useRouter()
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId)
    // Navigate to dashboard for selected brand
    router.push(`/dashboard/${brandId}`)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-balance">
            Select a <span className="gradient-text">Brand</span>
          </h1>
          <p className="text-muted-foreground text-lg">Choose which brand you'd like to manage</p>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBrands.map((brand: Brand) => (
            <Card
              key={brand.id}
              className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
              onClick={() => handleBrandSelect(brand.id)}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <Avatar className="h-16 w-16 rounded-xl">
                    <AvatarImage src={brand.logo || "/placeholder.svg"} alt={brand.name} />
                    <AvatarFallback className="rounded-xl bg-muted text-xl">{brand.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{brand.name}</CardTitle>
                  <CardDescription className="mt-1">{brand.accounts.length} connected accounts</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Connected Networks */}
                <div className="flex flex-wrap gap-2">
                  {brand.accounts.map((account) => (
                    <Badge key={account.id} variant="secondary" className="bg-muted/50 hover:bg-muted">
                      {account.network}
                    </Badge>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs">Reach</span>
                    </div>
                    <p className="text-sm font-semibold">{(brand.metrics.reach / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs">Growth</span>
                    </div>
                    <p className="text-sm font-semibold text-accent">+{brand.metrics.growth}%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="text-xs">Pending</span>
                    </div>
                    <p className="text-sm font-semibold">{brand.metrics.pendingDMs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Brand */}
        <Card className="border-dashed border-2 border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold">Add New Brand</p>
              <p className="text-sm text-muted-foreground">Connect a new brand to manage</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
