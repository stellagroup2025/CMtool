import { Suspense } from "react";
import { ApprovalsContent } from "./components/approvals-content";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApprovalsPage({ params }: { params: { brandId: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aprobaciones</h1>
        <p className="text-muted-foreground">
          Revisa y aprueba el contenido antes de publicarlo
        </p>
      </div>

      <Suspense fallback={<ApprovalsSkeleton />}>
        <ApprovalsContent brandId={params.brandId} />
      </Suspense>
    </div>
  );
}

function ApprovalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-40 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
