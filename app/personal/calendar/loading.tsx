import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Week Navigation Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="text-center space-y-2">
                  <Skeleton className="h-4 w-12 mx-auto" />
                  <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
