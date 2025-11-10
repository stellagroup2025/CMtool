import { getDashboardDataAction } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Users,
  MessageSquare,
  ImageIcon,
  Instagram,
  ArrowRight,
  TrendingUp,
  Clock,
  Folder,
  Upload
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage({
  params,
}: {
  params: { brandId: string }
}) {
  const dashboardData = await getDashboardDataAction(params.brandId)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de tu contenido y cuentas conectadas
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cuentas Conectadas
            </CardTitle>
            <Instagram className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.socialAccounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.socialAccounts.filter(a => a.platform === "INSTAGRAM").length} Instagram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Media Library
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.mediaStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.mediaStats.used} usadas, {dashboardData.mediaStats.unused} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.mediaStats.totalUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Imágenes publicadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última Actividad
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.recentMedia.length > 0 ? "Hoy" : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.recentMedia.length > 0
                ? `${dashboardData.recentMedia.length} imágenes recientes`
                : "Sin actividad reciente"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede directamente a las funciones más usadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`/dashboard/${params.brandId}/instagram/publish`}>
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <Upload className="h-5 w-5" />
                <span>Publicar en Instagram</span>
              </Button>
            </Link>

            <Link href={`/dashboard/${params.brandId}/media`}>
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <Folder className="h-5 w-5" />
                <span>Media Library</span>
              </Button>
            </Link>

            <Link href={`/dashboard/${params.brandId}/settings`}>
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <Instagram className="h-5 w-5" />
                <span>Conectar Cuenta</span>
              </Button>
            </Link>

            <Link href={`/dashboard/${params.brandId}/instagram`}>
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <MessageSquare className="h-5 w-5" />
                <span>Ver Instagram</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cuentas Conectadas</CardTitle>
                <CardDescription>
                  Tus redes sociales activas
                </CardDescription>
              </div>
              <Link href={`/dashboard/${params.brandId}/settings`}>
                <Button variant="ghost" size="sm">
                  Configurar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.socialAccounts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.socialAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={account.avatar || undefined} alt={account.username} />
                      <AvatarFallback>
                        {account.platform === "INSTAGRAM" ? "IG" : account.platform.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">@{account.username}</p>
                      {account.displayName && (
                        <p className="text-sm text-muted-foreground truncate">
                          {account.displayName}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {account.platform}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Instagram className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-4">No tienes cuentas conectadas</p>
                <Link href={`/dashboard/${params.brandId}/settings`}>
                  <Button size="sm">
                    Conectar Cuenta
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Media */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Imágenes Recientes</CardTitle>
                <CardDescription>
                  Últimas imágenes subidas
                </CardDescription>
              </div>
              <Link href={`/dashboard/${params.brandId}/media`}>
                <Button variant="ghost" size="sm">
                  Ver Todas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.recentMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {dashboardData.recentMedia.map((media) => (
                  <div
                    key={media.id}
                    className="relative aspect-square rounded-lg overflow-hidden border group"
                  >
                    <img
                      src={media.url}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                    {media.usedCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute top-1 right-1 text-xs bg-black/70 text-white border-0"
                      >
                        {media.usedCount}x
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs">
                        {media.width}×{media.height}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-4">No has subido imágenes aún</p>
                <Link href={`/dashboard/${params.brandId}/media`}>
                  <Button size="sm">
                    Subir Primera Imagen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Media */}
      {dashboardData.popularMedia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imágenes Más Usadas</CardTitle>
            <CardDescription>
              Las imágenes que más has publicado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {dashboardData.popularMedia.map((media) => (
                <div
                  key={media.id}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={media.url}
                    alt="Popular media"
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-black/70 text-white border-0"
                  >
                    {media.usedCount}x usado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
