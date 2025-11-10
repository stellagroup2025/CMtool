import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText as FileTextIcon,
  ArrowLeft,
  Briefcase,
  FileText,
  FileSignature,
  Plus,
  Calendar,
  Euro,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ArrowRight,
} from "lucide-react"
import { getClientDetailAction } from "../actions"
import { CreateBrandDialog } from "@/components/create-brand-dialog"
import { QuoteFormDialog } from "@/components/quote-form-dialog"
import { ContractFormDialog } from "@/components/contract-form-dialog"

export default async function ClientDetailPage({
  params,
}: {
  params: { clientId: string }
}) {
  let client
  try {
    client = await getClientDetailAction(params.clientId)
  } catch {
    notFound()
  }

  // Get initials from client name
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/)
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Status badge for quotes
  const getQuoteStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      DRAFT: { variant: "outline", icon: FileText },
      SENT: { variant: "default", icon: Send },
      ACCEPTED: { variant: "default", icon: CheckCircle2 },
      REJECTED: { variant: "destructive", icon: XCircle },
      EXPIRED: { variant: "secondary", icon: Clock },
    }
    const config = variants[status] || variants.DRAFT
    const Icon = config.icon
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  // Status badge for contracts
  const getContractStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      DRAFT: { variant: "outline", icon: FileSignature },
      ACTIVE: { variant: "default", icon: CheckCircle2 },
      COMPLETED: { variant: "secondary", icon: CheckCircle2 },
      CANCELLED: { variant: "destructive", icon: XCircle },
    }
    const config = variants[status] || variants.DRAFT
    const Icon = config.icon
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">Gestión de cliente</p>
          </div>
        </div>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <CardTitle className="text-2xl">{client.name}</CardTitle>
                  {client.taxId && (
                    <CardDescription className="mt-1">NIF/CIF: {client.taxId}</CardDescription>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a href={`mailto:${client.email}`} className="hover:underline truncate">
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a href={`tel:${client.phone}`} className="hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {(client.city || client.country) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">
                        {[client.address, client.city, client.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate"
                      >
                        {client.website}
                      </a>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Brands</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.brands.length}</div>
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
              <div className="text-2xl font-bold">{client.quotes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {client.quotes.filter((q) => q.status === "ACCEPTED").length} aceptados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contratos</CardTitle>
              <FileSignature className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.contracts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {client.contracts.filter((c) => c.status === "ACTIVE").length} activos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="brands" className="space-y-6">
          <TabsList>
            <TabsTrigger value="brands">Brands ({client.brands.length})</TabsTrigger>
            <TabsTrigger value="quotes">Presupuestos ({client.quotes.length})</TabsTrigger>
            <TabsTrigger value="contracts">Contratos ({client.contracts.length})</TabsTrigger>
          </TabsList>

          {/* Brands Tab */}
          <TabsContent value="brands" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Brands del Cliente</h2>
              <CreateBrandDialog
                clientId={params.clientId}
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Brand
                  </Button>
                }
              />
            </div>

            {client.brands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.brands.map((brand) => (
                  <Link key={brand.id} href={`/dashboard/${brand.id}`}>
                    <Card className="group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 rounded-xl flex-shrink-0">
                              <AvatarImage src={brand.logo || undefined} alt={brand.name} />
                              <AvatarFallback className="rounded-xl bg-primary text-primary-foreground font-semibold">
                                {getInitials(brand.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{brand.name}</CardTitle>
                              <CardDescription className="truncate">
                                {brand.accountCount} cuenta{brand.accountCount !== 1 ? "s" : ""}
                              </CardDescription>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">No hay brands asociadas</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Presupuestos</h2>
              <QuoteFormDialog clientId={params.clientId} />
            </div>

            {client.quotes.length > 0 ? (
              <div className="space-y-3">
                {client.quotes.map((quote) => (
                  <Card key={quote.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">{quote.title}</CardTitle>
                            {getQuoteStatusBadge(quote.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {quote.quoteNumber}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(quote.createdAt)}
                            </div>
                            {quote.validUntil && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Válido hasta {formatDate(quote.validUntil)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{formatCurrency(quote.total)}</div>
                          {quote.status === "ACCEPTED" && quote.acceptedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Aceptado {formatDate(quote.acceptedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">No hay presupuestos</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contratos</h2>
              <ContractFormDialog clientId={params.clientId} />
            </div>

            {client.contracts.length > 0 ? (
              <div className="space-y-3">
                {client.contracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">{contract.title}</CardTitle>
                            {getContractStatusBadge(contract.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileSignature className="h-3 w-3" />
                              {contract.contractNumber}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(contract.startDate)}
                              {contract.endDate && ` - ${formatDate(contract.endDate)}`}
                            </div>
                            {contract.billingCycle && (
                              <Badge variant="outline" className="text-xs">
                                {contract.billingCycle}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{formatCurrency(contract.value)}</div>
                          {contract.status === "ACTIVE" && contract.signedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Firmado {formatDate(contract.signedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileSignature className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">No hay contratos</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
