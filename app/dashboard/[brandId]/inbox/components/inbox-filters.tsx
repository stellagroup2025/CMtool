"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { ConversationStatus, ConversationType, Platform, ConversationPriority, Sentiment } from "@prisma/client";
import type { InboxFilters as InboxFiltersType } from "../actions";

interface InboxFiltersProps {
  filters: InboxFiltersType;
  onFiltersChange: (filters: InboxFiltersType) => void;
}

export function InboxFilters({ filters, onFiltersChange }: InboxFiltersProps) {
  function updateFilter(key: keyof InboxFiltersType, value: any) {
    onFiltersChange({ ...filters, [key]: value || undefined });
  }

  function clearFilters() {
    onFiltersChange({});
  }

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Usuario, nombre..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="platform">Plataforma</Label>
          <Select
            value={filters.platform || ""}
            onValueChange={(value) => updateFilter("platform", value)}
          >
            <SelectTrigger id="platform">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {Object.values(Platform).map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={filters.type || ""}
            onValueChange={(value) => updateFilter("type", value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={ConversationType.DM}>Mensaje Directo</SelectItem>
              <SelectItem value={ConversationType.COMMENT}>Comentario</SelectItem>
              <SelectItem value={ConversationType.MENTION}>Mención</SelectItem>
              <SelectItem value={ConversationType.REVIEW}>Reseña</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={ConversationStatus.NEW}>Nuevo</SelectItem>
              <SelectItem value={ConversationStatus.IN_PROGRESS}>En Progreso</SelectItem>
              <SelectItem value={ConversationStatus.RESOLVED}>Resuelto</SelectItem>
              <SelectItem value={ConversationStatus.CLOSED}>Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
