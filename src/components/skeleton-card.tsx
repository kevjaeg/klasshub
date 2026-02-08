import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="mt-2 h-4 w-48 rounded bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="h-4 w-12 rounded bg-muted" />
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="w-12 space-y-1">
                  <div className="h-3 w-10 rounded bg-muted mx-auto" />
                  <div className="h-2 w-8 rounded bg-muted mx-auto" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-32 rounded bg-muted" />
                </div>
                <div className="h-3 w-4 rounded bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SkeletonTimetable() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded bg-muted" />
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 rounded bg-muted" />
            <div className="h-5 w-12 rounded bg-muted" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 flex-1 rounded bg-muted" />
            ))}
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="w-12 space-y-1">
                  <div className="h-3 w-10 rounded bg-muted mx-auto" />
                  <div className="h-2 w-8 rounded bg-muted mx-auto" />
                </div>
                <div className="h-5 w-20 rounded bg-muted" />
                <div className="flex-1">
                  <div className="h-3 w-28 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
