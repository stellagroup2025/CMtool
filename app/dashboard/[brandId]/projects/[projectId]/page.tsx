import { Suspense } from "react";
import { ProjectDetailContent } from "./components/project-detail-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailPage({ params }: { params: { brandId: string; projectId: string } }) {
  return (
    <div className="p-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-screen w-full" />}>
        <ProjectDetailContent brandId={params.brandId} projectId={params.projectId} />
      </Suspense>
    </div>
  );
}
