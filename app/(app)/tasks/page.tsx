"use client";
import * as React from "react";
import Link from "next/link";
import { ListChecks, CalendarClock } from "lucide-react";
import { projects as projectsApi, tasks as tasksApi } from "@/lib/api";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { STATUS_LABEL, PRIORITY_VARIANT, relativeDue } from "@/lib/format";

type Row = Task & { projectName: string };

export default function AllTasksPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [status, setStatus] = React.useState<string>("all");
  const [priority, setPriority] = React.useState<string>("all");

  React.useEffect(() => {
    (async () => {
      const { projects } = await projectsApi.list().catch(() => ({ projects: [] }));
      const all = await Promise.all(
        projects.map((mp) =>
          tasksApi.list(mp.project._id, { limit: 100 })
            .then((r) => r.tasks.map((t) => ({ ...t, projectName: mp.project.name }) as Row))
            .catch(() => [] as Row[]),
        ),
      );
      setRows(all.flat());
    })();
  }, []);

  const filtered = (rows ?? []).filter(
    (t) => (status === "all" || t.status === status) && (priority === "all" || t.priority === priority),
  );

  return (
    <div>
      <PageHeader title="All Tasks" subtitle="Every task across your projects." />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(["to-do", "in-progress", "done"] as TaskStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(["low", "medium", "high", "critical"] as TaskPriority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!rows ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="gap-0">
          <EmptyState
            icon={ListChecks}
            title="No tasks found"
            description="Try adjusting the filters, or create tasks inside a project."
          />
        </Card>
      ) : (
        <Card className="divide-border/60 gap-0 divide-y overflow-hidden py-0">
          {filtered.map((t) => {
            const due = t.dueDate ? relativeDue(t.dueDate) : null;
            return (
              <Link key={t._id} href={`/projects/${t.project}`} className="hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors">
                <span className={`size-2.5 shrink-0 rounded-full ${t.status === "done" ? "bg-emerald-500" : t.status === "in-progress" ? "bg-blue-500" : "bg-amber-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-muted-foreground truncate text-xs">{t.projectName}</p>
                </div>
                <Badge variant={PRIORITY_VARIANT[t.priority]} className="hidden sm:inline-flex">{t.priority}</Badge>
                <Badge variant="outline" className="hidden md:inline-flex">{STATUS_LABEL[t.status]}</Badge>
                {due && <span className={`hidden w-28 items-center justify-end gap-1 text-xs lg:flex ${due.overdue ? "text-red-500" : "text-muted-foreground"}`}><CalendarClock className="size-3.5" /> {due.label}</span>}
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
