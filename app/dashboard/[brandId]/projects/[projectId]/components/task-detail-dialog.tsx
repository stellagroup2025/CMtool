"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckSquare, MessageSquare, Trash2, Plus, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  getTaskDetailAction,
  updateTaskAction,
  deleteTaskAction,
  addCheckItemAction,
  toggleCheckItemAction,
  deleteCheckItemAction,
  addCommentAction,
  deleteCommentAction,
} from "../tasks-actions";
import { toast } from "sonner";

export function TaskDetailDialog({
  open,
  onOpenChange,
  taskId,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onUpdate: () => void;
}) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (open && taskId) {
      loadTask();
    }
  }, [open, taskId]);

  async function loadTask() {
    setLoading(true);
    const result = await getTaskDetailAction(taskId);
    if (result.success && result.task) {
      setTask(result.task);
      setEditTitle(result.task.title);
      setEditDescription(result.task.description || "");
    }
    setLoading(false);
  }

  async function handleSaveEdit() {
    const result = await updateTaskAction(taskId, {
      title: editTitle,
      description: editDescription,
    });

    if (result.success) {
      toast.success("Tarea actualizada");
      setIsEditing(false);
      loadTask();
      onUpdate();
    } else {
      toast.error("Error al actualizar");
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta tarea?")) return;

    const result = await deleteTaskAction(taskId);
    if (result.success) {
      toast.success("Tarea eliminada");
      onOpenChange(false);
      onUpdate();
    } else {
      toast.error("Error al eliminar");
    }
  }

  async function handleAddCheckItem() {
    if (!newCheckItem.trim()) return;

    const result = await addCheckItemAction(taskId, newCheckItem);
    if (result.success) {
      setNewCheckItem("");
      loadTask();
    }
  }

  async function handleToggleCheckItem(checkItemId: string) {
    await toggleCheckItemAction(checkItemId);
    loadTask();
  }

  async function handleDeleteCheckItem(checkItemId: string) {
    await deleteCheckItemAction(checkItemId);
    loadTask();
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;

    const result = await addCommentAction(taskId, newComment);
    if (result.success) {
      setNewComment("");
      loadTask();
    }
  }

  async function handleDeleteComment(commentId: string) {
    await deleteCommentAction(commentId);
    loadTask();
  }

  if (loading || !task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const completedChecks = task.checkItems.filter((c: any) => c.completed).length;
  const totalChecks = task.checkItems.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xl font-bold"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descripción..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>Guardar</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{task.title}</DialogTitle>
                {task.description && (
                  <p className="text-muted-foreground">{task.description}</p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Estado: </span>
              <Badge>{task.status}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Prioridad: </span>
              <Badge>{task.priority}</Badge>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.dueDate), "PP", { locale: es })}</span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.image} />
                  <AvatarFallback>
                    {task.assignee.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignee.name}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                <h3 className="font-semibold">
                  Checklist {totalChecks > 0 && `(${completedChecks}/${totalChecks})`}
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {task.checkItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleToggleCheckItem(item.id)}
                  />
                  <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                    {item.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => handleDeleteCheckItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Agregar item..."
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCheckItem()}
                />
                <Button size="icon" onClick={handleAddCheckItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">
                Comentarios ({task.comments.length})
              </h3>
            </div>

            <div className="space-y-3">
              {task.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.image} />
                    <AvatarFallback>
                      {comment.user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "PPp", { locale: es })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button size="icon" onClick={handleAddComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
