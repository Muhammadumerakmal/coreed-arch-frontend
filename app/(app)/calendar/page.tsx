"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tasks as tasksApi } from "@/lib/api";
import type { Task } from "@/lib/types";
import { useMyProjects } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_CHIP, OVERDUE_CHIP } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function chipColor(t: Task): string {
  const overdue = t.status !== "done" && t.dueDate && new Date(t.dueDate).getTime() < Date.now();
  if (overdue) return OVERDUE_CHIP;
  return STATUS_CHIP[t.status];
}

export default function CalendarPage() {
  const { projects, loading: projectsLoading } = useMyProjects();
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [cursor, setCursor] = React.useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });

  React.useEffect(() => {
    if (projectsLoading) return;
    let active = true;
    (async () => {
      const all = await Promise.all(projects.map((mp) => tasksApi.list(mp.project._id, { limit: 100 }).then((r) => r.tasks).catch(() => [] as Task[])));
      if (active) setTasks(all.flat().filter((t) => t.dueDate));
    })();
    return () => { active = false; };
  }, [projects, projectsLoading]);

  const byDate = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks ?? []) {
      const key = new Date(t.dueDate!).toISOString().slice(0, 10);
      (map.get(key) ?? map.set(key, []).get(key)!).push(t);
    }
    return map;
  }, [tasks]);

  const first = new Date(cursor.y, cursor.m, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const todayKey = new Date().toISOString().slice(0, 10);
  const cells: (number | null)[] = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (d: number) => setCursor((c) => { const nm = c.m + d; return { y: c.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 }; });

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Task due dates across your projects."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCursor(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; })}>Today</Button>
            <Button variant="outline" size="icon-sm" onClick={() => shift(-1)}><ChevronLeft className="size-4" /></Button>
            <span className="w-36 text-center text-sm font-semibold">{MONTHS[cursor.m]} {cursor.y}</span>
            <Button variant="outline" size="icon-sm" onClick={() => shift(1)}><ChevronRight className="size-4" /></Button>
          </div>
        }
      />

      {!tasks ? (
        <Skeleton className="h-[70vh]" />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-border/60">
            {WEEKDAYS.map((d) => <div key={d} className="text-muted-foreground p-2 text-center text-xs font-semibold">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const key = day ? `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
              const dayTasks = day ? byDate.get(key) ?? [] : [];
              const isToday = key === todayKey;
              return (
                <div key={i} className={cn("min-h-24 border-b border-r border-border/40 p-1.5", !day && "bg-muted/20")}>
                  {day && (
                    <>
                      <div className={cn("mb-1 flex size-6 items-center justify-center rounded-full text-xs font-medium", isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{day}</div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((t) => (
                          <div key={t._id} className={cn("truncate rounded px-1.5 py-0.5 text-[11px] font-medium", chipColor(t))} title={t.title}>{t.title}</div>
                        ))}
                        {dayTasks.length > 3 && <div className="text-muted-foreground px-1 text-[11px]">+{dayTasks.length - 3} more</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
