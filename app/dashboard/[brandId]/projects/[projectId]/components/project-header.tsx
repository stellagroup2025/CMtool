"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, CheckCircle2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ProjectHeader({ project, stats }: { project: any; stats: any }) {
  const statusColors: any = {
    PLANNING: "secondary",
    ACTIVE: "default",
    ON_HOLD: "outline",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href={"/dashboard/" + project.brandId + "/projects"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant={statusColors[project.status]}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>Inicio</span>
            </div>
            <p className="text-lg font-semibold">
              {format(new Date(project.startDate), "PP", { locale: es })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span>Equipo</span>
            </div>
            <p className="text-lg font-semibold">{project.members.length} miembros</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Tareas</span>
            </div>
            <p className="text-lg font-semibold">{stats?.totalTasks || 0} tareas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progreso</span>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{stats?.progress || 0}%</p>
              <Progress value={stats?.progress || 0} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
