"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AssetGrid } from "./asset-grid";
import { AssetStats } from "./asset-stats";
import { getAssetsAction, getAssetStatsAction, deleteAssetAction } from "../actions";
import { Search, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function AssetsContent({ brandId }: { brandId: string }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [brandId, search]);

  async function loadData() {
    setLoading(true);
    const [assetsResult, statsResult] = await Promise.all([
      getAssetsAction(brandId, search),
      getAssetStatsAction(brandId),
    ]);

    if (assetsResult.success && assetsResult.assets) {
      setAssets(assetsResult.assets);
    }

    if (statsResult.success && statsResult.stats) {
      setStats(statsResult.stats);
    }

    setLoading(false);
  }

  async function handleDelete(assetId: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar este asset?")) {
      return;
    }

    const result = await deleteAssetAction(assetId);
    if (result.success) {
      toast.success("Asset eliminado");
      loadData();
    } else {
      toast.error(result.error || "Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && <AssetStats stats={stats} />}

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Subir Asset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assets grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Assets ({assets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No hay assets</h3>
              <p className="text-sm text-muted-foreground">
                Sube tu primer asset para comenzar
              </p>
            </div>
          ) : (
            <AssetGrid assets={assets} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
