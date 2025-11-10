import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { getBrandsAction } from "./actions"
import { CreateBrandDialog } from "@/components/create-brand-dialog"

export default async function BrandsPage() {
  const brands = await getBrandsAction()

  // Get initials from brand name (max 2 characters)
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/)
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-balance">
              <span className="gradient-text">Brands</span>
            </h1>
            <p className="text-muted-foreground text-lg">Selecciona una brand para gestionar</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/dashboard/${brand.id}`}>
              <Card className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Avatar className="h-16 w-16 rounded-xl">
                      <AvatarImage src={brand.logo || undefined} alt={brand.name} />
                      <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-xl font-semibold">
                        {getInitials(brand.name)}
                      </AvatarFallback>
                    </Avatar>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{brand.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {brand.accountCount} connected accounts
                      {brand.client && ` · ${brand.client.name}`}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {brand.role}
                    </Badge>
                    {brand.client && (
                      <Badge variant="secondary" className="text-xs">
                        Cliente: {brand.client.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Add New Brand */}
        <CreateBrandDialog />
      </div>
    </div>
  )
}
