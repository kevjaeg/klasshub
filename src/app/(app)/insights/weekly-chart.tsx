"use client";

interface ChartDay {
  day: string;
  label: string;
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  substituted: number;
}

interface WeeklyChartProps {
  data: ChartDay[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxValue = Math.max(...data.map((d) => d.total), 1);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-3">
      {/* Bar chart */}
      <div className="flex items-end gap-2 h-32">
        {data.map((d) => {
          const totalHeight = (d.total / maxValue) * 100;
          const completedHeight = d.total > 0 ? (d.completed / d.total) * totalHeight : 0;
          const isToday = d.date === today;

          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              {/* Count label */}
              {d.total > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  {d.completed}/{d.total}
                </span>
              )}

              {/* Bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                {d.total > 0 ? (
                  <div
                    className="w-full rounded-t-md bg-muted relative overflow-hidden transition-all"
                    style={{ height: `${totalHeight}%`, minHeight: "8px" }}
                  >
                    {/* Completed portion (bottom-up fill) */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all ${
                        d.completed === d.total
                          ? "bg-green-500"
                          : "bg-primary"
                      }`}
                      style={{ height: `${(d.completed / d.total) * 100}%`, minHeight: d.completed > 0 ? "4px" : "0" }}
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-t-md bg-muted/50" style={{ height: "8px" }} />
                )}
              </div>

              {/* Day label */}
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {d.day}
              </span>
              {isToday && (
                <div className="h-1 w-1 rounded-full bg-primary -mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-primary" />
          <span>Erledigt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-muted" />
          <span>Offen</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-green-500" />
          <span>Alles erledigt</span>
        </div>
      </div>
    </div>
  );
}
