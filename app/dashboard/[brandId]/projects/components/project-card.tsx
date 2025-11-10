"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export function ProjectCard({ project, onUpdate }: { project: any; onUpdate: () => void }) {
  const statusColors: any = {
    PLANNING: "secondary",
    ACTIVE: "default",
    ON_HOLD: "outline",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
  };

  const taskCount = project._count.tasks || 0;

  return (
    <Link href={"/dashboard/" + project.brandId + "/projects/" + project.id}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant={statusColors[project.status]}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(project.startDate), "PP", { locale: es })}
              </span>
            </div>

            {project.members.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{project.members.length} miembros</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>{taskCount} tareas</span>
            </div>
          </div>

          {project.client && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Cliente: <span className="font-medium">{project.client.name}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
