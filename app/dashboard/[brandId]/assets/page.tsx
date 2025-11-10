import { Suspense } from "react";
import { AssetsContent } from "./components/assets-content";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssetsPage({ params }: { params: { brandId: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Biblioteca de Assets</h1>
        <p className="text-muted-foreground">
          Gestiona todos tus archivos multimedia en un solo lugar
        </p>
      </div>

      <Suspense fallback={<AssetsSkeleton />}>
        <AssetsContent brandId={params.brandId} />
      </Suspense>
    </div>
  );
}

function AssetsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-40 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
