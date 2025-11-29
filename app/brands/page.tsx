import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight, LogOut } from "lucide-react"
import { getBrandsAction } from "./actions"
import { CreateBrandDialog } from "@/components/create-brand-dialog"
import { LogoutButton } from "@/components/logout-button"

export default async function BrandsPage() {
  const brands = await getBrandsAction()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-balance">
              Select a <span className="gradient-text">Brand</span>
            </h1>
            <p className="text-muted-foreground text-lg">Choose which brand you'd like to manage</p>
          </div>
          <LogoutButton />
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/dashboard/${brand.id}`}>
              <Card className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
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
                    <CardDescription className="mt-1">{brand.accountCount} connected accounts</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Badge variant="outline" className="text-xs">
                    {brand.role}
                  </Badge>
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
