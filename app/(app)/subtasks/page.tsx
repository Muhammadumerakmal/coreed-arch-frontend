"use client";
import * as React from "react";
import { Plus, Trash2, Loader2, ListTree } from "lucide-react";
import { tasks as tasksApi, subtasks as subtasksApi, ApiError } from "@/lib/api";
import type { Task, Subtask } from "@/lib/types";
import { useMyProjects } from "@/lib/hooks";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectSelect } from "@/components/common/project-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/format";

type TaskWithSubs = { task: Task; subs: Subtask[] };

export default function SubtasksPage() {
  const { projects, loading: projectsLoading } = useMyProjects();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<string>("");
  const [rows, setRows] = React.useState<TaskWithSubs[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [inputs, setInputs] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!selected && projects.length) setSelected(projects[0].project._id);
  }, [projects, selected]);

  const load = React.useCallback(async () => {
    if (!selected) return;
    setRows(null);
    const res = await tasksApi.list(selected, { limit: 100 }).catch(() => null);
    if (!res) return;
    const taskRows = await Promise.all(
      res.tasks.map(async (task) => {
        const subs = await subtasksApi.list(selected, task._id).catch(() => [] as Subtask[]);
        return { task, subs };
      }),
    );
    setRows(taskRows);
  }, [selected]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function toggle(t: Task, s: Subtask) {
    const prev = rows;
    const nextCompleted = !s.isCompleted;
    setRows(
      (r) =>
        r?.map((row) =>
          row.task._id === t._id
            ? { ...row, subs: row.subs.map((x) => (x._id === s._id ? { ...x, isCompleted: nextCompleted } : x)) }
            : row,
        ) ?? null,
    );
    try {
      await subtasksApi.update(selected, t._id, s._id, { isCompleted: nextCompleted });
    } catch {
      setRows(prev);
      toast("Failed to update subtask", "error");
    }
  }

  async function remove(t: Task, s: Subtask) {
    setRows((r) => r?.map((row) => (row.task._id === t._id ? { ...row, subs: row.subs.filter((x) => x._id !== s._id) } : row)) ?? null);
    try {
      await subtasksApi.remove(selected, t._id, s._id);
    } catch {
      toast("Failed to delete subtask", "error");
      load();
    }
  }

  async function add(t: Task, e: React.FormEvent) {
    e.preventDefault();
    const title = (inputs[t._id] ?? "").trim();
    if (!title) return;
    setBusy(t._id);
    try {
      const s = await subtasksApi.create(selected, t._id, { title });
      setRows((r) => r?.map((row) => (row.task._id === t._id ? { ...row, subs: [...row.subs, s] } : row)) ?? null);
      setInputs((prev) => ({ ...prev, [t._id]: "" }));
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add subtask", "error");
    } finally {
      setBusy(null);
    }
  }

  const allSubs = rows?.flatMap((r) => r.subs) ?? [];
  const doneCount = allSubs.filter((s) => s.isCompleted).length;

  return (
    <div>
      <PageHeader
        title="Subtasks"
        subtitle="Break tasks down into smaller steps."
        action={
          selected ? (
            <div className="w-56">
              <ProjectSelect projects={projects} value={selected} onChange={setSelected} className="w-full" />
            </div>
          ) : undefined
        }
      />

      {projectsLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : projects.length === 0 ? (
        <Card className="gap-0">
          <EmptyState icon={ListTree} title="No projects yet" description="Create a project to start breaking tasks into subtasks." />
        </Card>
      ) : !rows ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : rows.length === 0 ? (
        <Card className="gap-0">
          <EmptyState
            icon={ListTree}
            title="No subtasks yet"
            description="Open a task in this project to add subtasks, or use the form on each task below."
          />
        </Card>
      ) : (
        <>
          <Card className="mb-4 flex flex-wrap items-center justify-between gap-2 p-4">
            <p className="text-sm font-medium">
              {doneCount} of {allSubs.length} subtasks completed
            </p>
            <p className="text-muted-foreground text-xs">{rows.length} task{rows.length === 1 ? "" : "s"}</p>
          </Card>

          <div className="space-y-4">
            {rows.map(({ task, subs }) => (
              <Card key={task._id} className="gap-0 p-5">
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${task.status === "done" ? "bg-emerald-500" : task.status === "in-progress" ? "bg-blue-500" : "bg-amber-500"}`} />
                  <h3 className="flex-1 truncate text-sm font-semibold">{task.title}</h3>
                  <Badge variant="outline" className="capitalize">{STATUS_LABEL[task.status]}</Badge>
                  {subs.length > 0 && (
                    <span className="text-muted-foreground text-xs">{subs.filter((s) => s.isCompleted).length}/{subs.length}</span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5">
                  {subs.length === 0 && <p className="text-muted-foreground px-1 text-sm">No subtasks for this task yet.</p>}
                  {subs.map((s) => (
                    <div key={s._id} className="group hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={s.isCompleted}
                        onChange={() => toggle(task, s)}
                        className="accent-primary size-4"
                      />
                      <span className={`flex-1 text-sm ${s.isCompleted ? "text-muted-foreground line-through" : ""}`}>{s.title}</span>
                      <button
                        onClick={() => remove(task, s)}
                        className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Delete ${s.title}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => add(task, e)} className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={inputs[task._id] ?? ""}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [task._id]: e.target.value }))}
                    className="h-9"
                  />
                  <Button type="submit" size="sm" disabled={busy !== null || !(inputs[task._id] ?? "").trim()}>
                    {busy === task._id ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  </Button>
                </form>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
