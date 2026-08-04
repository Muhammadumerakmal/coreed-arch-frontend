"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { tasks as tasksApi } from "@/lib/api";
import type { Task } from "@/lib/types";
import { useMyProjects } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STATUS_CHIP, OVERDUE_CHIP, relativeDue } from "@/lib/format";
import { cn } from "@/lib/utils";

type View = "month" | "week";

const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(2024, 0, 7 + i)),
);
const MONTH_NAME = (m: number) => new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2024, m, 1));

function chipColor(t: Task): string {
  const overdue = t.status !== "done" && t.dueDate && new Date(t.dueDate).getTime() < Date.now();
  if (overdue) return OVERDUE_CHIP;
  return STATUS_CHIP[t.status];
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function CalendarPage() {
  const { projects, loading: projectsLoading } = useMyProjects();
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [view, setView] = React.useState<View>("month");
  const [cursor, setCursor] = React.useState<Date>(() => new Date());
  const [selected, setSelected] = React.useState<Task[] | null>(null);

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

  const today = dayKey(new Date());

  const shift = (d: number) =>
    setCursor((c) => {
      if (view === "week") return new Date(c.getTime() + d * 7 * 86400000);
      return new Date(c.getFullYear(), c.getMonth() + d, 1);
    });

  // Build the displayed cells.
  const cells: (Date | null)[] = React.useMemo(() => {
    if (view === "week") {
      const start = new Date(cursor);
      const delta = start.getDay();
      start.setDate(start.getDate() - delta);
      return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const list: (Date | null)[] = [...Array(startPad).fill(null)];
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [cursor, view]);

  const headerLabel =
    view === "week"
      ? (() => {
          const start = new Date(cursor);
          start.setDate(start.getDate() - start.getDay());
          const end = new Date(start.getTime() + 6 * 86400000);
          return `${new Intl.DateTimeFormat("en", { month: "short" }).format(start)} ${start.getDate()} – ${new Intl.DateTimeFormat("en", { month: "short" }).format(end)} ${end.getDate()}, ${start.getFullYear()}`;
        })()
      : `${MONTH_NAME(cursor.getMonth())} ${cursor.getFullYear()}`;

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Task due dates across your projects."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
              {(["month", "week"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn("rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors", view === v ? "bg-card shadow-sm" : "text-muted-foreground")}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
            <Button variant="outline" size="icon-sm" onClick={() => shift(-1)}><ChevronLeft className="size-4" /></Button>
            <span className="w-44 text-center text-sm font-semibold">{headerLabel}</span>
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
          <div className={cn("grid grid-cols-7", view === "week" && "border-b border-border/60")}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="bg-muted/20 min-h-24 border-b border-r border-border/40 p-1.5" />;
              const key = dayKey(day);
              const dayTasks = byDate.get(key) ?? [];
              const isToday = key === today;
              const showAll = view === "week";
              return (
                <button
                  key={key}
                  onClick={() => setSelected(dayTasks)}
                  className={cn(
                    "min-h-24 border-b border-r border-border/40 p-1.5 text-left transition-colors",
                    showAll || dayTasks.length > 0 ? "hover:bg-muted/40 cursor-pointer" : "cursor-default",
                  )}
                >
                  <div className={cn("mb-1 flex size-6 items-center justify-center rounded-full text-xs font-medium", isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{day.getDate()}</div>
                  <div className="space-y-1">
                    {(showAll ? dayTasks : dayTasks.slice(0, 3)).map((t) => (
                      <div key={t._id} className={cn("truncate rounded px-1.5 py-0.5 text-[11px] font-medium", chipColor(t))} title={t.title}>{t.title}</div>
                    ))}
                    {!showAll && dayTasks.length > 3 && <div className="text-muted-foreground px-1 text-[11px]">+{dayTasks.length - 3} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CalendarClock className="size-4" /> Tasks for this day</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {selected && selected.length === 0 && <p className="text-muted-foreground text-sm">No tasks due on this day.</p>}
            {selected?.map((t) => {
              const due = relativeDue(t.dueDate);
              return (
                <div key={t._id} className="hover:bg-muted/50 flex items-center gap-2 rounded-lg px-2 py-1.5">
                  <span className={cn("size-2.5 shrink-0 rounded-full", chipColor(t))} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.title}</span>
                  <span className={cn("text-xs", due.overdue ? "text-red-500" : "text-muted-foreground")}>{due.label}</span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}