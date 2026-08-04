"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { projects as projectsApi, tasks as tasksApi, members as membersApi, ApiError } from "@/lib/api";
import type { Project, Task, ProjectMember, TaskStatus } from "@/lib/types";
import { STATUS_ACCENT } from "@/lib/format";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "to-do", label: "To Do" },
  { status: "in-progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [project, setProject] = React.useState<Project | null>(null);
  const [members, setMembers] = React.useState<ProjectMember[]>([]);
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [createStatus, setCreateStatus] = React.useState<TaskStatus>("to-do");
  const [detail, setDetail] = React.useState<Task | null>(null);

  const loadTasks = React.useCallback(async () => {
    const res = await tasksApi.list(projectId, { limit: 100 }).catch(() => null);
    if (res) setTasks(res.tasks);
  }, [projectId]);

  React.useEffect(() => {
    (async () => {
      try {
        const [p, m] = await Promise.all([projectsApi.get(projectId), membersApi.list(projectId).catch(() => [])]);
        setProject(p);
        setMembers(m);
        await loadTasks();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load project");
      }
    })();
  }, [projectId, loadTasks]);

  async function move(task: Task, status: TaskStatus) {
    setTasks((prev) => prev?.map((t) => (t._id === task._id ? { ...t, status } : t)) ?? null);
    try {
      await tasksApi.update(projectId, task._id, { status });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to move task", "error");
      loadTasks();
    }
  }

  if (error) return <Card className="p-8 text-center"><p className="font-medium">Couldn&apos;t load project</p><p className="text-muted-foreground mt-1 text-sm">{error}</p></Card>;

  return (
    <div>
      <Link href="/projects" className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"><ArrowLeft className="size-4" /> Projects</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project?.name ?? <Skeleton className="h-8 w-48" />}</h1>
          {project && <p className="text-muted-foreground mt-1 text-sm">{project.description || "No description"}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1"><Users className="size-3.5" /> {members.length} members</Badge>
          <Button onClick={() => { setEditing(null); setCreateStatus("to-do"); setFormOpen(true); }}><Plus className="size-4" /> New Task</Button>
        </div>
      </div>

      {!tasks ? (
        <div className="grid gap-4 md:grid-cols-3">{COLUMNS.map((c) => <Skeleton key={c.status} className="h-64" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="bg-muted/40 rounded-xl p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${STATUS_ACCENT[col.status]}`} />
                    <h3 className="text-sm font-semibold">{col.label}</h3>
                    <span className="text-muted-foreground text-xs">{items.length}</span>
                  </div>
                  <button onClick={() => { setEditing(null); setCreateStatus(col.status); setFormOpen(true); }} className="hover:bg-accent rounded p-1"><Plus className="size-4" /></button>
                </div>
                <div className="space-y-2">
                  {items.map((t) => (
                    <TaskCard key={t._id} task={t} members={members} onOpen={() => setDetail(t)} onMove={(s) => move(t, s)} />
                  ))}
                  {items.length === 0 && <p className="text-muted-foreground px-1 py-4 text-center text-xs">No tasks</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} projectId={projectId} members={members} task={editing} defaultStatus={createStatus} onSaved={loadTasks} />
      <TaskDetailDialog
        open={Boolean(detail)}
        onOpenChange={(o) => !o && setDetail(null)}
        projectId={projectId}
        task={detail}
        members={members}
        onEdit={() => { if (detail) { setEditing(detail); setDetail(null); setFormOpen(true); } }}
        onChanged={loadTasks}
      />
    </div>
  );
}
