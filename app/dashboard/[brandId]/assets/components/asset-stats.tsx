"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, HardDrive, TrendingUp } from "lucide-react";

interface AssetStatsProps {
  stats: {
    totalAssets: number;
    totalSize: number;
    mostUsed: any[];
  };
}

export function AssetStats({ stats }: AssetStatsProps) {
  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAssets}</div>
          <p className="text-xs text-muted-foreground">Archivos totales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Espacio Usado</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
          <p className="text-xs text-muted-foreground">Tamaño total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Más Usado</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.mostUsed.length > 0 ? (
            <div className="text-2xl font-bold">{stats.mostUsed[0].usedCount}x</div>
          ) : (
            <div className="text-2xl font-bold">-</div>
          )}
          <p className="text-xs text-muted-foreground">Veces usado</p>
        </CardContent>
      </Card>
    </div>
  );
}
