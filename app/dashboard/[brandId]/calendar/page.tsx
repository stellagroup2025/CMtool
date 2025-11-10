"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, List, LayoutGrid, Plus } from "lucide-react"
import { CalendarView } from "./components/calendar-view"
import { CalendarFilters } from "./components/calendar-filters"
import { getCalendarPostsAction } from "./actions"
import { startOfMonth, endOfMonth, addMonths } from "date-fns"
import { useParams, useRouter } from "next/navigation"

export default function CalendarPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.brandId as string

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"month" | "week" | "list">("month")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const startDate = startOfMonth(addMonths(now, -1))
      const endDate = endOfMonth(addMonths(now, 2))

      const data = await getCalendarPostsAction(brandId, startDate, endDate)
      setPosts(data)
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
    const interval = setInterval(loadPosts, 30000)
    return () => clearInterval(interval)
  }, [brandId])

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const handleClearFilters = () => {
    setSelectedPlatforms([])
    setSelectedStatuses([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario de Contenido</h1>
          <p className="text-muted-foreground">
            Planifica y gestiona tus publicaciones en todas las plataformas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/${brandId}/create`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Post
          </Button>
          <Button onClick={loadPosts} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Programados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter((p) => p.status === "SCHEDULED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Borradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter((p) => p.status === "DRAFT").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter((p) => p.status === "PUBLISHED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CalendarFilters
            selectedPlatforms={selectedPlatforms}
            selectedStatuses={selectedStatuses}
            onPlatformToggle={handlePlatformToggle}
            onStatusToggle={handleStatusToggle}
            onClearFilters={handleClearFilters}
          />
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList>
          <TabsTrigger value="month" className="gap-2">
            <Calendar className="h-4 w-4" />
            Mes
          </TabsTrigger>
          <TabsTrigger value="week" className="gap-2" disabled>
            <LayoutGrid className="h-4 w-4" />
            Semana
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2" disabled>
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-6">
          <CalendarView
            brandId={brandId}
            posts={posts}
            selectedPlatforms={selectedPlatforms}
            selectedStatuses={selectedStatuses}
          />
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Vista semanal próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Vista de lista próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
