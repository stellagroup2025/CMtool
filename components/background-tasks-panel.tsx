"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useBackgroundTasks, BackgroundTask } from "@/contexts/background-tasks-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  ImageIcon,
  Layers,
  Eye,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

const TASK_ICONS = {
  "generate-carousel": Layers,
  "generate-post": Sparkles,
  "generate-batch": Sparkles,
  "publish-instagram": Send,
  "generate-images": ImageIcon,
}

const TASK_COLORS = {
  pending: "bg-gray-500",
  running: "bg-blue-500",
  completed: "bg-green-500",
  error: "bg-red-500",
}

function TaskItem({ task }: { task: BackgroundTask }) {
  const { removeTask } = useBackgroundTasks()
  const router = useRouter()
  const Icon = TASK_ICONS[task.type] || Sparkles

  const handleViewCarousel = () => {
    if (task.type === "generate-carousel" && task.result?.carousel) {
      // Guardar el carrusel en sessionStorage para cargarlo en la página
      sessionStorage.setItem('loadedCarousel', JSON.stringify(task.result.carousel))
      router.push('/personal/carousel-generator')
    }
  }

  const showViewButton = task.status === "completed" && task.type === "generate-carousel" && task.result?.carousel

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      {/* Icon + Status */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
          {task.status === "running" ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : task.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : task.status === "error" ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Icon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div
          className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${TASK_COLORS[task.status]}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{task.title}</p>
            {task.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {task.description}
              </p>
            )}
          </div>

          {/* Remove button */}
          {(task.status === "completed" || task.status === "error") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => removeTask(task.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {task.status === "running" && task.progress !== undefined && (
          <Progress value={task.progress} className="h-1.5 mt-2" />
        )}

        {/* Error message */}
        {task.status === "error" && task.error && (
          <p className="text-xs text-red-500 mt-1">{task.error}</p>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {task.completedAt
            ? `Completado ${formatDistanceToNow(task.completedAt, { addSuffix: true, locale: es })}`
            : `Iniciado ${formatDistanceToNow(task.createdAt, { addSuffix: true, locale: es })}`}
        </p>

        {/* View Carousel Button */}
        {showViewButton && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={(e) => {
              e.stopPropagation()
              handleViewCarousel()
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver carrusel
          </Button>
        )}
      </div>
    </div>
  )
}

export function BackgroundTasksPanel() {
  const { tasks, clearCompleted } = useBackgroundTasks()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  // Don't show if no tasks
  if (tasks.length === 0) return null

  const runningTasks = tasks.filter((t) => t.status === "running" || t.status === "pending")
  const completedTasks = tasks.filter((t) => t.status === "completed")
  const errorTasks = tasks.filter((t) => t.status === "error")

  // Minimized view - just a badge
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <div className="relative">
            <Loader2 className="h-6 w-6 animate-spin" />
            {runningTasks.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {runningTasks.length}
              </Badge>
            )}
          </div>
        </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 max-h-[80vh] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Tareas en Segundo Plano
            {runningTasks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {runningTasks.length} activas
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMinimized(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {completedTasks.length > 0 && isExpanded && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={clearCompleted}
          >
            Limpiar completadas ({completedTasks.length})
          </Button>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="flex-1 overflow-y-auto min-h-0 pt-0">
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay tareas activas
              </p>
            ) : (
              tasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
          </div>
        </CardContent>
      )}

      {/* Summary bar when collapsed */}
      {!isExpanded && (
        <CardContent className="pt-0 pb-3">
          <div className="flex items-center gap-4 text-sm">
            {runningTasks.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                <span>{runningTasks.length} en progreso</span>
              </div>
            )}
            {completedTasks.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{completedTasks.length} completadas</span>
              </div>
            )}
            {errorTasks.length > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{errorTasks.length} con error</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
