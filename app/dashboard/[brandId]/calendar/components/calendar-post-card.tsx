"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface CalendarPostCardProps {
  post: {
    id: string
    status: string
    scheduledAt: string | null
    items: Array<{
      platform: string
      content: string
      socialAccount: {
        platform: string
        username: string
      }
    }>
  }
  onClick?: () => void
}

const platformIcons: Record<string, any> = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  X: Twitter,
  LINKEDIN: Linkedin,
  YOUTUBE: Youtube,
}

const platformColors: Record<string, string> = {
  INSTAGRAM: "bg-gradient-to-br from-purple-500 to-pink-500",
  FACEBOOK: "bg-blue-600",
  X: "bg-black",
  LINKEDIN: "bg-blue-700",
  YOUTUBE: "bg-red-600",
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  PENDING_APPROVAL: "bg-yellow-500",
  APPROVED: "bg-green-500",
  SCHEDULED: "bg-blue-500",
  PUBLISHED: "bg-green-600",
  FAILED: "bg-red-500",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_APPROVAL: "Pendiente",
  APPROVED: "Aprobado",
  SCHEDULED: "Programado",
  PUBLISHED: "Publicado",
  FAILED: "Fallido",
}

export function CalendarPostCard({ post, onClick }: CalendarPostCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const firstItem = post.items[0]
  const platform = firstItem?.platform || "INSTAGRAM"
  const Icon = platformIcons[platform] || Instagram
  const content = firstItem?.content || "Sin contenido"

  const time = post.scheduledAt
    ? new Date(post.scheduledAt).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sin hora"

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 cursor-move hover:shadow-md transition-all group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Platform indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${platformColors[platform]}`} />

      <div className="pl-2 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs font-medium truncate">
              {time}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-4 ${statusColors[post.status]} text-white`}
          >
            {statusLabels[post.status] || post.status}
          </Badge>
        </div>

        {/* Content preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
          {content}
        </p>

        {/* Platforms badge if multiple */}
        {post.items.length > 1 && (
          <div className="flex items-center gap-1">
            {post.items.map((item, idx) => {
              const ItemIcon = platformIcons[item.platform] || Instagram
              return (
                <div
                  key={idx}
                  className={`h-4 w-4 rounded flex items-center justify-center ${platformColors[item.platform]}`}
                >
                  <ItemIcon className="h-2.5 w-2.5 text-white" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
