"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalCard } from "./approval-card";
import { ApprovalStats } from "./approval-stats";
import { getPendingApprovalsAction, getApprovalStatsAction } from "../actions";
import { CheckCircle2, Clock, XCircle, FileCheck } from "lucide-react";

export function ApprovalsContent({ brandId }: { brandId: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [brandId]);

  async function loadData() {
    setLoading(true);
    const [postsResult, statsResult] = await Promise.all([
      getPendingApprovalsAction(brandId),
      getApprovalStatsAction(brandId),
    ]);

    if (postsResult.success && postsResult.posts) {
      setPosts(postsResult.posts);
    }

    if (statsResult.success && statsResult.stats) {
      setStats(statsResult.stats);
    }

    setLoading(false);
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
      {stats && <ApprovalStats stats={stats} />}

      {/* Pending approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Posts Pendientes de Aprobación
          </CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No hay posts pendientes</h3>
              <p className="text-sm text-muted-foreground">
                Todos los posts han sido revisados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <ApprovalCard
                  key={post.id}
                  post={post}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
