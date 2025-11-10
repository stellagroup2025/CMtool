"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, CheckSquare, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { TaskDetailDialog } from "./task-detail-dialog";
import { useState } from "react";

export function TaskCard({ task, onUpdate, isDragging }: { task: any; onUpdate: () => void; isDragging?: boolean }) {
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const priorityColors: any = {
    LOW: "secondary",
    MEDIUM: "default",
    HIGH: "destructive",
    URGENT: "destructive",
  };

  const completedChecks = task._count?.checkItems 
    ? task.checkItems?.filter((c: any) => c.completed).length || 0
    : 0;
  const totalChecks = task._count?.checkItems || 0;

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Card
          className={cn(
            "p-3 cursor-pointer hover:shadow-md transition-shadow",
            isDragging && "opacity-50"
          )}
          onClick={() => setDetailOpen(true)}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
              {task.priority !== "MEDIUM" && (
                <Badge variant={priorityColors[task.priority]} className="text-xs">
                  {task.priority}
                </Badge>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.dueDate), "PP", { locale: es })}</span>
                  </div>
                )}

                {totalChecks > 0 && (
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    <span>{completedChecks}/{totalChecks}</span>
                  </div>
                )}

                {task._count?.comments > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{task._count.comments}</span>
                  </div>
                )}

                {task._count?.attachments > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    <span>{task._count.attachments}</span>
                  </div>
                )}
              </div>

              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.image} />
                  <AvatarFallback>
                    {task.assignee.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </Card>
      </div>

      <TaskDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        taskId={task.id}
        onUpdate={onUpdate}
      />
    </>
  );
}
