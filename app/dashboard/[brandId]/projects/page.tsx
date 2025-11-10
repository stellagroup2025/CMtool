import { Suspense } from "react";
import { ProjectsContent } from "./components/projects-content";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage({ params }: { params: { brandId: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <p className="text-muted-foreground">
          Gestiona tus proyectos y tareas de forma organizada
        </p>
      </div>

      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent brandId={params.brandId} />
      </Suspense>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
