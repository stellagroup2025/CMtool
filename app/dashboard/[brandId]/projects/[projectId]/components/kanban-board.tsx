"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { CreateTaskDialog } from "./create-task-dialog";
import { updateTaskPositionAction } from "../tasks-actions";
import { toast } from "sonner";
import { TaskStatus } from "@prisma/client";

const COLUMNS = [
  { id: "TODO", title: "Por Hacer", status: "TODO" as TaskStatus },
  { id: "IN_PROGRESS", title: "En Progreso", status: "IN_PROGRESS" as TaskStatus },
  { id: "REVIEW", title: "En Revisión", status: "REVIEW" as TaskStatus },
  { id: "DONE", title: "Completado", status: "DONE" as TaskStatus },
];

export function KanbanBoard({ tasks, projectId, onUpdate }: { tasks: any[]; projectId: string; onUpdate: () => void }) {
  const [activeTask, setActiveTask] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogStatus, setCreateDialogStatus] = useState<TaskStatus>("TODO");

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find if dropped on column or task
    const overColumn = COLUMNS.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    let newStatus: TaskStatus;
    let newPosition: number;

    if (overColumn) {
      // Dropped on column
      newStatus = overColumn.status;
      const tasksInColumn = tasks.filter((t) => t.status === newStatus);
      newPosition = tasksInColumn.length;
    } else if (overTask) {
      // Dropped on task
      newStatus = overTask.status;
      newPosition = overTask.position;
    } else {
      setActiveTask(null);
      return;
    }

    const result = await updateTaskPositionAction(taskId, newStatus, newPosition);
    
    if (result.success) {
      onUpdate();
    } else {
      toast.error("Error al mover tarea");
    }

    setActiveTask(null);
  }

  function openCreateDialog(status: TaskStatus) {
    setCreateDialogStatus(status);
    setCreateDialogOpen(true);
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.status);
            
            return (
              <Card key={column.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {column.title} ({columnTasks.length})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => openCreateDialog(column.status)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onUpdate={onUpdate} />
                    ))}
                  </SortableContext>

                  {columnTasks.length === 0 && (
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground"
                      style={{ minHeight: "100px" }}
                    >
                      Sin tareas
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onUpdate={onUpdate} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
        initialStatus={createDialogStatus}
        onSuccess={onUpdate}
      />
    </>
  );
}
