import { Suspense } from "react";
import { InboxContent } from "./components/inbox-content";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InboxPage({ params }: { params: { brandId: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inbox Unificado</h1>
        <p className="text-muted-foreground">
          Gestiona todas las conversaciones de tus redes sociales en un solo lugar
        </p>
      </div>

      <Suspense fallback={<InboxSkeleton />}>
        <InboxContent brandId={params.brandId} />
      </Suspense>
    </div>
  );
}

function InboxSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      <Card className="lg:col-span-1 p-4">
        <Skeleton className="h-full w-full" />
      </Card>
      <Card className="lg:col-span-2 p-4">
        <Skeleton className="h-full w-full" />
      </Card>
    </div>
  );
}
