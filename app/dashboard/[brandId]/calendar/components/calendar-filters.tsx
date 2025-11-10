"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react"

interface CalendarFiltersProps {
  selectedPlatforms: string[]
  selectedStatuses: string[]
  onPlatformToggle: (platform: string) => void
  onStatusToggle: (status: string) => void
  onClearFilters: () => void
}

const platforms = [
  { value: "INSTAGRAM", label: "Instagram", icon: Instagram, color: "from-purple-500 to-pink-500" },
  { value: "FACEBOOK", label: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700" },
  { value: "X", label: "X (Twitter)", icon: Twitter, color: "from-black to-gray-800" },
  { value: "LINKEDIN", label: "LinkedIn", icon: Linkedin, color: "from-blue-700 to-blue-800" },
  { value: "YOUTUBE", label: "YouTube", icon: Youtube, color: "from-red-600 to-red-700" },
]

const statuses = [
  { value: "DRAFT", label: "Borrador", color: "bg-gray-500" },
  { value: "PENDING_APPROVAL", label: "Pendiente", color: "bg-yellow-500" },
  { value: "APPROVED", label: "Aprobado", color: "bg-green-500" },
  { value: "SCHEDULED", label: "Programado", color: "bg-blue-500" },
  { value: "PUBLISHED", label: "Publicado", color: "bg-green-600" },
]

export function CalendarFilters({
  selectedPlatforms,
  selectedStatuses,
  onPlatformToggle,
  onStatusToggle,
  onClearFilters,
}: CalendarFiltersProps) {
  const hasFilters = selectedPlatforms.length > 0 || selectedStatuses.length > 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Platform filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Plataformas:</span>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const isSelected = selectedPlatforms.includes(platform.value)
            return (
              <Button
                key={platform.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`h-8 ${
                  isSelected ? `bg-gradient-to-r ${platform.color} text-white hover:opacity-90` : ""
                }`}
                onClick={() => onPlatformToggle(platform.value)}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {platform.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Estado:</span>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => {
            const isSelected = selectedStatuses.includes(status.value)
            return (
              <Button
                key={status.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`h-8 ${isSelected ? `${status.color} text-white hover:opacity-90` : ""}`}
                onClick={() => onStatusToggle(status.value)}
              >
                {status.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={onClearFilters}
        >
          <X className="h-3.5 w-3.5 mr-1.5" />
          Limpiar filtros
        </Button>
      )}

      {/* Active filters count */}
      {hasFilters && (
        <Badge variant="secondary">
          {selectedPlatforms.length + selectedStatuses.length} filtro(s) activo(s)
        </Badge>
      )}
    </div>
  )
}
