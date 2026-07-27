"use client";
import * as React from "react";
import { ListChecks, CheckCircle2, AlertTriangle, FolderKanban } from "lucide-react";
import { projects as projectsApi, tasks as tasksApi } from "@/lib/api";
import type { Task, TaskPriority } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Donut } from "@/components/charts/donut";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const C = { done: "#10b981", inProgress: "#3b82f6", todo: "#f59e0b" };
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "bg-slate-400",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  critical: "bg-red-500",
};

type Data = {
  total: number; done: number; inProgress: number; todo: number; overdue: number;
  projectsCount: number;
  priority: Record<TaskPriority, number>;
  perProject: { name: string; done: number; total: number }[];
};

export default function ReportsPage() {
  const [data, setData] = React.useState<Data | null>(null);

  React.useEffect(() => {
    (async () => {
      const { projects } = await projectsApi.list().catch(() => ({ projects: [] }));
      const lists = await Promise.all(projects.map((mp) => tasksApi.list(mp.project._id, { limit: 100 }).then((r) => ({ name: mp.project.name, tasks: r.tasks })).catch(() => ({ name: mp.project.name, tasks: [] as Task[] }))));
      const all = lists.flatMap((l) => l.tasks);
      const now = Date.now();
      const priority: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      for (const t of all) priority[t.priority]++;
      setData({
        total: all.length,
        done: all.filter((t) => t.status === "done").length,
        inProgress: all.filter((t) => t.status === "in-progress").length,
        todo: all.filter((t) => t.status === "to-do").length,
        overdue: all.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate).getTime() < now).length,
        projectsCount: projects.length,
        priority,
        perProject: lists.map((l) => ({ name: l.name, done: l.tasks.filter((t) => t.status === "done").length, total: l.tasks.length })),
      });
    })();
  }, []);

  if (!data) return (
    <div>
      <PageHeader title="Reports" subtitle="Insights across your projects." />
      <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
    </div>
  );

  const completionRate = data.total ? Math.round((data.done / data.total) * 100) : 0;
  const maxPriority = Math.max(1, ...Object.values(data.priority));
  const tiles = [
    { label: "Total Tasks", value: data.total, icon: ListChecks, tint: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle2, tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    { label: "Overdue", value: data.overdue, icon: AlertTriangle, tint: "bg-red-500/15 text-red-600 dark:text-red-400" },
    { label: "Active Projects", value: data.projectsCount, icon: FolderKanban, tint: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Insights across your projects." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-5">
            <div className={cn("flex size-11 items-center justify-center rounded-xl", t.tint)}><t.icon className="size-5" /></div>
            <p className="text-muted-foreground mt-3 text-sm font-medium">{t.label}</p>
            <p className="text-3xl font-bold">{t.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="items-center p-6">
          <h3 className="w-full font-semibold">Tasks by Status</h3>
          <Donut size={190} centerLabel={data.total} centerSub="Total Tasks" segments={[
            { label: "Completed", value: data.done, color: C.done },
            { label: "In Progress", value: data.inProgress, color: C.inProgress },
            { label: "To Do", value: data.todo, color: C.todo },
          ]} />
          <div className="mt-4 flex w-full justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: C.done }} /> Done {data.done}</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: C.inProgress }} /> In Progress {data.inProgress}</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: C.todo }} /> To Do {data.todo}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Tasks by Priority</h3>
          <div className="space-y-3">
            {(Object.keys(data.priority) as TaskPriority[]).map((p) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-16 text-sm capitalize">{p}</span>
                <div className="bg-muted h-6 flex-1 overflow-hidden rounded-md">
                  <div className={cn("flex h-full items-center justify-end rounded-md px-2 text-xs font-medium text-white", PRIORITY_COLOR[p])} style={{ width: `${(data.priority[p] / maxPriority) * 100}%`, minWidth: data.priority[p] ? "1.5rem" : 0 }}>
                    {data.priority[p] || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Project Completion</h3>
        {data.perProject.length === 0 ? (
          <p className="text-muted-foreground text-sm">No projects yet.</p>
        ) : (
          <div className="space-y-4">
            {data.perProject.map((p) => {
              const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <div key={p.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.done}/{p.total} · {pct}%</span>
                  </div>
                  <Progress value={pct} indicatorClassName="bg-primary" />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
