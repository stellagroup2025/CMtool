"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Copy, Trash2 } from "lucide-react"
import {
  updatePostFromCalendarAction,
  deletePostFromCalendarAction,
  duplicatePostAction,
} from "../actions"
import { useRouter } from "next/navigation"

interface PostQuickEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: {
    id: string
    brandId: string
    status: string
    scheduledAt: string | null
    items: Array<{
      id: string
      platform: string
      content: string
      mediaUrls: string[]
      socialAccount: {
        platform: string
        username: string
        displayName?: string | null
      }
    }>
  }
}

const platformIcons: Record<string, any> = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  X: Twitter,
  LINKEDIN: Linkedin,
  YOUTUBE: Youtube,
}

const statusOptions = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PENDING_APPROVAL", label: "Pendiente de aprobación" },
  { value: "APPROVED", label: "Aprobado" },
  { value: "SCHEDULED", label: "Programado" },
]

export function PostQuickEditDialog({ open, onOpenChange, post }: PostQuickEditDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const firstItem = post.items[0]
  const [content, setContent] = useState(firstItem?.content || "")
  const [status, setStatus] = useState(post.status)
  const [scheduledDate, setScheduledDate] = useState(
    post.scheduledAt
      ? new Date(post.scheduledAt).toISOString().split("T")[0]
      : ""
  )
  const [scheduledTime, setScheduledTime] = useState(
    post.scheduledAt
      ? new Date(post.scheduledAt).toISOString().split("T")[1].substring(0, 5)
      : ""
  )

  const handleSave = async () => {
    setLoading(true)
    try {
      const scheduledAt =
        scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`)
          : undefined

      await updatePostFromCalendarAction(post.id, post.brandId, {
        content,
        status,
        scheduledAt,
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating post:", error)
      alert("Error al actualizar el post")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este post?")) return

    setLoading(true)
    try {
      await deletePostFromCalendarAction(post.id, post.brandId)
      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting post:", error)
      alert(error.message || "Error al eliminar el post")
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    setLoading(true)
    try {
      await duplicatePostAction(post.id, post.brandId)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error duplicating post:", error)
      alert("Error al duplicar el post")
    } finally {
      setLoading(false)
    }
  }

  const Icon = firstItem ? platformIcons[firstItem.platform] : Instagram

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            Editar Post
          </DialogTitle>
          <DialogDescription>
            Edita rápidamente el contenido y configuración del post
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Platforms */}
          {post.items.length > 0 && (
            <div className="space-y-2">
              <Label>Plataformas</Label>
              <div className="flex flex-wrap gap-2">
                {post.items.map((item, idx) => {
                  const ItemIcon = platformIcons[item.platform] || Instagram
                  return (
                    <Badge key={idx} variant="outline" className="gap-1.5">
                      <ItemIcon className="h-3.5 w-3.5" />
                      {item.socialAccount.displayName || item.socialAccount.username}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Escribe tu contenido aquí..."
            />
            <p className="text-xs text-muted-foreground">
              {content.length} caracteres
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {/* Media preview */}
          {firstItem?.mediaUrls && firstItem.mediaUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Imágenes ({firstItem.mediaUrls.length})</Label>
              <div className="grid grid-cols-4 gap-2">
                {firstItem.mediaUrls.slice(0, 4).map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={url}
                      alt={`Media ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              disabled={loading}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading || post.status === "PUBLISHED"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
