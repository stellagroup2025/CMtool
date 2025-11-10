"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { ProjectHeader } from "./project-header";
import { getProjectDetailAction, getProjectStatsAction } from "../../actions";
import { getTasksAction } from "../tasks-actions";

export function ProjectDetailContent({ brandId, projectId }: { brandId: string; projectId: string }) {
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    setLoading(true);
    const [projectResult, tasksResult, statsResult] = await Promise.all([
      getProjectDetailAction(projectId),
      getTasksAction(projectId),
      getProjectStatsAction(projectId),
    ]);

    if (projectResult.success && projectResult.project) {
      setProject(projectResult.project);
    }

    if (tasksResult.success && tasksResult.tasks) {
      setTasks(tasksResult.tasks);
    }

    if (statsResult.success && statsResult.stats) {
      setStats(statsResult.stats);
    }

    setLoading(false);
  }

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} stats={stats} onUpdate={loadData} />

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList>
          <TabsTrigger value="kanban">Vista Kanban</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard tasks={tasks} projectId={projectId} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <TaskList tasks={tasks} projectId={projectId} onUpdate={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
