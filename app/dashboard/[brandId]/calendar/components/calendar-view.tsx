"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CalendarPostCard } from "./calendar-post-card"
import { PostQuickEditDialog } from "./post-quick-edit-dialog"
import { movePostDateAction, getPostDetailAction } from "../actions"
import { useRouter } from "next/navigation"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { es } from "date-fns/locale"

interface CalendarViewProps {
  brandId: string
  posts: Array<{
    id: string
    status: string
    scheduledAt: string | null
    publishedAt: string | null
    items: Array<{
      platform: string
      content: string
      mediaUrls: string[]
      socialAccount: {
        platform: string
        username: string
      }
    }>
  }>
  selectedPlatforms: string[]
  selectedStatuses: string[]
}

export function CalendarView({
  brandId,
  posts,
  selectedPlatforms,
  selectedStatuses,
}: CalendarViewProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Filter by platform
      if (selectedPlatforms.length > 0) {
        const hasPlatform = post.items.some((item) =>
          selectedPlatforms.includes(item.platform)
        )
        if (!hasPlatform) return false
      }

      // Filter by status
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(post.status)) return false
      }

      return true
    })
  }, [posts, selectedPlatforms, selectedStatuses])

  // Get calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { locale: es })
  const calendarEnd = endOfWeek(monthEnd, { locale: es })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredPosts> = {}

    filteredPosts.forEach((post) => {
      const date = post.scheduledAt || post.publishedAt
      if (date) {
        const dateKey = format(new Date(date), "yyyy-MM-dd")
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(post)
      }
    })

    return grouped
  }, [filteredPosts])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const postId = active.id as string
    const newDateKey = over.id as string

    if (newDateKey.startsWith("day-")) {
      const dateStr = newDateKey.replace("day-", "")
      const newDate = new Date(dateStr)

      // Keep the same time, just change the date
      const post = posts.find((p) => p.id === postId)
      if (post?.scheduledAt) {
        const oldDate = new Date(post.scheduledAt)
        newDate.setHours(oldDate.getHours())
        newDate.setMinutes(oldDate.getMinutes())
      } else {
        // Default time: 9:00 AM
        newDate.setHours(9, 0, 0, 0)
      }

      try {
        await movePostDateAction(postId, newDate, brandId)
        router.refresh()
      } catch (error: any) {
        console.error("Error moving post:", error)
        alert(error.message || "Error al mover el post")
      }
    }
  }

  const handlePostClick = async (post: any) => {
    try {
      const fullPost = await getPostDetailAction(post.id, brandId)
      setSelectedPost(fullPost)
      setEditDialogOpen(true)
    } catch (error) {
      console.error("Error loading post:", error)
    }
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const activePost = activeId ? posts.find((p) => p.id === activeId) : null

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  return (
    <>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Calendar Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-muted p-2 text-center text-sm font-semibold"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd")
              const dayPosts = postsByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isToday = isSameDay(day, new Date())

              return (
                <SortableContext
                  key={dateKey}
                  id={`day-${dateKey}`}
                  items={dayPosts.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className={`bg-background p-2 min-h-[120px] ${
                      !isCurrentMonth ? "opacity-50" : ""
                    } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? "bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {dayPosts.length}
                        </span>
                      )}
                    </div>

                    {/* Posts */}
                    <div className="space-y-1">
                      {dayPosts.map((post) => (
                        <CalendarPostCard
                          key={post.id}
                          post={post}
                          onClick={() => handlePostClick(post)}
                        />
                      ))}
                    </div>
                  </div>
                </SortableContext>
              )
            })}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activePost ? <CalendarPostCard post={activePost} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Edit Dialog */}
      {selectedPost && (
        <PostQuickEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          post={selectedPost}
        />
      )}
    </>
  )
}
