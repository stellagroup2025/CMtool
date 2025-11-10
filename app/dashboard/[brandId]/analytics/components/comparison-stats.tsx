"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, FileText, Heart, Eye } from "lucide-react";
import { getComparisonDataAction } from "../actions";

interface ComparisonStatsProps {
  brandId: string;
  startDate: Date;
  endDate: Date;
}

export function ComparisonStats({ brandId, startDate, endDate }: ComparisonStatsProps) {
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, [brandId, startDate, endDate]);

  async function loadComparison() {
    setLoading(true);
    try {
      const data = await getComparisonDataAction(brandId, startDate, endDate);
      setComparison(data);
    } catch (error) {
      console.error("Error loading comparison:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !comparison) {
    return null;
  }

  function renderChange(change: number) {
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? "text-green-600" : "text-red-600";
    
    return (
      <div className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="h-4 w-4" />
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparación con Período Anterior</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Crecimiento Seguidores
            </div>
            {renderChange(comparison.changes.followers)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Posts
            </div>
            {renderChange(comparison.changes.posts)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              Likes
            </div>
            {renderChange(comparison.changes.likes)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Alcance
            </div>
            {renderChange(comparison.changes.reach)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Engagement
            </div>
            {renderChange(comparison.changes.engagement)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Comentarios
            </div>
            {renderChange(comparison.changes.comments)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
