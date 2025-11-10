"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssetGridProps {
  assets: any[];
  onDelete: (id: string) => void;
}

export function AssetGrid({ assets, onDelete }: AssetGridProps) {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada al portapapeles");
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden group">
            <div className="aspect-square bg-muted relative">
              <img
                src={asset.url}
                alt={asset.publicId}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyUrl(asset.url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(asset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-sm font-medium truncate">{asset.publicId}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatBytes(asset.bytes)}</span>
                <Badge variant="secondary" className="text-xs">
                  {asset.format}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{asset.width}x{asset.height}</span>
                <span>Usado {asset.usedCount}x</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Asset detail dialog */}
      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedAsset.publicId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.publicId}
                  className="w-full h-auto rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Formato</p>
                  <p className="font-medium">{selectedAsset.format}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensiones</p>
                  <p className="font-medium">{selectedAsset.width}x{selectedAsset.height}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tamaño</p>
                  <p className="font-medium">{formatBytes(selectedAsset.bytes)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usado</p>
                  <p className="font-medium">{selectedAsset.usedCount} veces</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Creado</p>
                  <p className="font-medium">
                    {format(new Date(selectedAsset.createdAt), "PPp", { locale: es })}
                  </p>
                </div>
                {selectedAsset.lastUsedAt && (
                  <div>
                    <p className="text-muted-foreground">Último uso</p>
                    <p className="font-medium">
                      {format(new Date(selectedAsset.lastUsedAt), "PPp", { locale: es })}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => copyUrl(selectedAsset.url)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar URL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
