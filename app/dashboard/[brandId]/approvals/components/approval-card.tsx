"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { approvePostAction, rejectPostAction } from "../actions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Calendar, Image } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApprovalCardProps {
  post: any;
  onUpdate: () => void;
}

export function ApprovalCard({ post, onUpdate }: ApprovalCardProps) {
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  async function handleApprove() {
    setApproveLoading(true);
    const result = await approvePostAction(post.id, approveComment || undefined);
    if (result.success) {
      toast.success("Post aprobado correctamente");
      setApproveDialogOpen(false);
      setApproveComment("");
      onUpdate();
    } else {
      toast.error(result.error || "Error al aprobar");
    }
    setApproveLoading(false);
  }

  async function handleReject() {
    if (!rejectComment.trim()) {
      toast.error("Debes proporcionar un motivo de rechazo");
      return;
    }

    setRejectLoading(true);
    const result = await rejectPostAction(post.id, rejectComment);
    if (result.success) {
      toast.success("Post rechazado");
      setRejectDialogOpen(false);
      setRejectComment("");
      onUpdate();
    } else {
      toast.error(result.error || "Error al rechazar");
    }
    setRejectLoading(false);
  }

  const firstItem = post.items[0];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge>{firstItem?.platform}</Badge>
              {post.scheduledAt && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.scheduledAt), "PPp", { locale: es })}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              @{firstItem?.socialAccount?.username}
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            Creado {format(new Date(post.createdAt), "PPp", { locale: es })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {firstItem?.content && (
            <div>
              <p className="text-sm whitespace-pre-wrap">{firstItem.content}</p>
            </div>
          )}

          {firstItem?.mediaUrls && firstItem.mediaUrls.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="h-4 w-4" />
              {firstItem.mediaUrls.length} imagen(es)
            </div>
          )}

          {firstItem?.hashtags && firstItem.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {firstItem.hashtags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aprobar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aprobar Post</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que quieres aprobar este post?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approve-comment">Comentario (opcional)</Label>
                  <Textarea
                    id="approve-comment"
                    placeholder="Agregar un comentario..."
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setApproveDialogOpen(false)}
                  disabled={approveLoading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleApprove} disabled={approveLoading}>
                  {approveLoading ? "Aprobando..." : "Aprobar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rechazar Post</DialogTitle>
                <DialogDescription>
                  Proporciona un motivo del rechazo para que el creador pueda mejorar el contenido
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reject-comment">Motivo del rechazo *</Label>
                  <Textarea
                    id="reject-comment"
                    placeholder="Explica por qué rechazas este post..."
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={rejectLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectLoading || !rejectComment.trim()}
                >
                  {rejectLoading ? "Rechazando..." : "Rechazar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
