import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  FileText,
  FileSignature,
  Briefcase,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { getClientsAction } from "./actions"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { QuoteFormDialog } from "@/components/quote-form-dialog"
import { ContractFormDialog } from "@/components/contract-form-dialog"

export default async function ClientsPage() {
  const clients = await getClientsAction()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-balance">
              <span className="gradient-text">Clientes</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Gestiona tus clientes, presupuestos y contratos
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            {/* Temporalmente deshabilitado hasta regenerar Prisma Client desde PowerShell */}
            {/* <Link href="/leads">
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Prospectos
              </Button>
            </Link> */}
            <QuoteFormDialog
              trigger={
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Nuevo Presupuesto
                </Button>
              }
            />
            <ContractFormDialog
              trigger={
                <Button variant="outline">
                  <FileSignature className="h-4 w-4 mr-2" />
                  Nuevo Contrato
                </Button>
              }
            />
            <ClientFormDialog />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clientes
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Brands
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, c) => sum + c.brandCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Presupuestos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, c) => sum + c.quoteCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contratos Activos
              </CardTitle>
              <FileSignature className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, c) => sum + c.activeContractCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Grid */}
        {clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl truncate">{client.name}</CardTitle>
                          {client.taxId && (
                            <p className="text-xs text-muted-foreground">{client.taxId}</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {client.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      )}
                      {(client.city || client.country) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {[client.city, client.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Badge variant="outline" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {client.brandCount} {client.brandCount === 1 ? "brand" : "brands"}
                      </Badge>
                      {client.quoteCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {client.quoteCount} {client.quoteCount === 1 ? "presupuesto" : "presupuestos"}
                        </Badge>
                      )}
                      {client.activeContractCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <FileSignature className="h-3 w-3 mr-1" />
                          {client.activeContractCount} activo{client.activeContractCount !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay clientes</h3>
              <p className="text-muted-foreground text-center mb-6">
                Empieza añadiendo tu primer cliente para gestionar brands, presupuestos y contratos
              </p>
              <ClientFormDialog />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
