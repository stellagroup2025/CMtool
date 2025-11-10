import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Briefcase, ArrowRight } from "lucide-react"
import { getClientsAction } from "@/app/clients/actions"
import { getBrandsAction } from "@/app/brands/actions"

export default async function MainDashboardPage() {
  const [clients, brands] = await Promise.all([
    getClientsAction(),
    getBrandsAction(),
  ])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-balance">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestiona tus clientes y brands desde un solo lugar
          </p>
        </div>

        {/* Main Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clientes Card */}
          <Link href="/clients">
            <Card className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <CardTitle className="text-3xl">Clientes</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Gestiona tus clientes, presupuestos y contratos
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-muted-foreground">Total clientes</span>
                    <span className="text-2xl font-bold">{clients.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-muted-foreground">Brands asociadas</span>
                    <span className="text-lg font-semibold">
                      {clients.reduce((sum, c) => sum + c.brandCount, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-muted-foreground">Contratos activos</span>
                    <span className="text-lg font-semibold text-primary">
                      {clients.reduce((sum, c) => sum + c.activeContractCount, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Brands Card */}
          <Link href="/brands">
            <Card className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <CardTitle className="text-3xl">Brands</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Accede a tus brands y gestiona sus redes sociales
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-muted-foreground">Total brands</span>
                    <span className="text-2xl font-bold">{brands.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-muted-foreground">Cuentas conectadas</span>
                    <span className="text-lg font-semibold">
                      {brands.reduce((sum, b) => sum + b.accountCount, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-sm text-muted-foreground">Con cliente asignado</span>
                    <span className="text-lg font-semibold text-primary">
                      {brands.filter((b) => b.clientId).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Brands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{brands.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {brands.reduce((sum, b) => sum + b.accountCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contratos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {clients.reduce((sum, c) => sum + c.activeContractCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity or Quick Actions could go here */}
      </div>
    </div>
  )
}
