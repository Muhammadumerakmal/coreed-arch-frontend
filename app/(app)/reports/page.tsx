"use client";
import * as React from "react";
import { ListChecks, CheckCircle2, AlertTriangle, FolderKanban, Download } from "lucide-react";
import { tasks as tasksApi } from "@/lib/api";
import type { Task, TaskPriority } from "@/lib/types";
import { useMyProjects } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Donut } from "@/components/charts/donut";
import { Progress } from "@/components/ui/progress";
import { STATUS_HEX, PRIORITY_CHIP, STATUS_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

type Data = {
  total: number; done: number; inProgress: number; todo: number; overdue: number;
  projectsCount: number;
  priority: Record<TaskPriority, number>;
  perProject: { name: string; done: number; total: number }[];
  subtaskTotal: number;
  subtaskDone: number;
};

type Range = "all" | "7" | "30" | "90";

const RANGES: { key: Range; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
];

const DAY = 86_400_000;

export default function ReportsPage() {
  const { projects, loading: projectsLoading } = useMyProjects();
  const [data, setData] = React.useState<Data | null>(null);
  const [rows, setRows] = React.useState<{ project: string; task: Task }[]>([]);
  const [range, setRange] = React.useState<Range>("all");

  React.useEffect(() => {
    if (projectsLoading) return;
    let active = true;
    (async () => {
      const lists = await Promise.all(projects.map((mp) => tasksApi.list(mp.project._id, { limit: 100 }).then((r) => ({ name: mp.project.name, tasks: r.tasks })).catch(() => ({ name: mp.project.name, tasks: [] as Task[] }))));
      const cutoff = range === "all" ? 0 : Date.now() - Number(range) * DAY;
      const all = lists.flatMap((l) =>
        l.tasks.filter((t) => range === "all" || new Date(t.updatedAt).getTime() >= cutoff).map((t) => ({ project: l.name, task: t })),
      );
      if (!active) return;
      const now = Date.now();
      const priority: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      let subtaskTotal = 0, subtaskDone = 0;
      for (const { task } of all) {
        priority[task.priority]++;
        subtaskTotal += task.subtaskCount ?? 0;
        subtaskDone += task.completedSubtaskCount ?? 0;
      }
      setRows(all);
      setData({
        total: all.length,
        done: all.filter(({ task }) => task.status === "done").length,
        inProgress: all.filter(({ task }) => task.status === "in-progress").length,
        todo: all.filter(({ task }) => task.status === "to-do").length,
        overdue: all.filter(({ task }) => task.status !== "done" && task.dueDate && new Date(task.dueDate).getTime() < now).length,
        projectsCount: projects.length,
        priority,
        perProject: lists.map((l) => ({ name: l.name, done: l.tasks.filter((t) => t.status === "done").length, total: l.tasks.length })),
        subtaskTotal,
        subtaskDone,
      });
    })();
    return () => { active = false; };
  }, [projects, projectsLoading, range]);

  const exportCsv = () => {
    const header = ["Project", "Title", "Status", "Priority", "Due date", "Updated"];
    const lines = rows.map(({ project, task }) =>
      [project, task.title, STATUS_LABEL[task.status], task.priority, task.dueDate ?? "", task.updatedAt ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <PageHeader
        title="Reports"
        subtitle="Insights across your projects."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={cn("rounded-md px-3 py-1 text-xs font-semibold transition-colors", range === r.key ? "bg-card shadow-sm" : "text-muted-foreground")}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        }
      />

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
            { label: "Completed", value: data.done, color: STATUS_HEX.done },
            { label: "In Progress", value: data.inProgress, color: STATUS_HEX["in-progress"] },
            { label: "To Do", value: data.todo, color: STATUS_HEX["to-do"] },
          ]} />
          <div className="mt-4 flex w-full justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: STATUS_HEX.done }} /> Done {data.done}</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: STATUS_HEX["in-progress"] }} /> In Progress {data.inProgress}</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: STATUS_HEX["to-do"] }} /> To Do {data.todo}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Tasks by Priority</h3>
          <div className="space-y-3">
            {(Object.keys(data.priority) as TaskPriority[]).map((p) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-16 text-sm capitalize">{p}</span>
                <div className="bg-muted h-6 flex-1 overflow-hidden rounded-md">
                  <div className={cn("flex h-full items-center justify-end rounded-md px-2 text-xs font-medium text-white", PRIORITY_CHIP[p])} style={{ width: `${(data.priority[p] / maxPriority) * 100}%`, minWidth: data.priority[p] ? "1.5rem" : 0 }}>
                    {data.priority[p] || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Subtask Completion</h3>
          {data.subtaskTotal === 0 ? (
            <p className="text-muted-foreground text-sm">No subtasks yet.</p>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{data.subtaskDone}/{data.subtaskTotal} · {Math.round((data.subtaskDone / data.subtaskTotal) * 100)}%</span>
              </div>
              <Progress value={Math.round((data.subtaskDone / data.subtaskTotal) * 100)} indicatorClassName="bg-violet-500" />
              <p className="text-muted-foreground mt-3 text-sm">
                Subtasks across all {data.projectsCount} active project{data.projectsCount === 1 ? "" : "s"}.
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}