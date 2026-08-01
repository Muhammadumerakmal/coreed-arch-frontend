"use client";
import * as React from "react";
import { Plus, Trash2, Pencil, Loader2, CalendarClock } from "lucide-react";
import { subtasks as subtasksApi, tasks as tasksApi, ApiError } from "@/lib/api";
import type { Task, Subtask, ProjectMember } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, PRIORITY_VARIANT, formatDate, initials } from "@/lib/format";

export function TaskDetailDialog({
  open,
  onOpenChange,
  projectId,
  task,
  members,
  onEdit,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  task: Task | null;
  members: ProjectMember[];
  onEdit: () => void;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [subs, setSubs] = React.useState<Subtask[]>([]);
  const [newTitle, setNewTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const assignee = React.useMemo(() => {
    if (!task?.assignedTo) return null;
    const id = typeof task.assignedTo === "object" ? task.assignedTo._id : task.assignedTo;
    return members.find((m) => m.user._id === id)?.user ?? null;
  }, [task, members]);

  React.useEffect(() => {
    if (!open || !task) return;
    subtasksApi.list(projectId, task._id).then(setSubs).catch(() => setSubs([]));
  }, [open, task, projectId]);

  if (!task) return null;

  async function addSub(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !task) return;
    setBusy(true);
    try {
      const s = await subtasksApi.create(projectId, task._id, { title: newTitle.trim() });
      setSubs((prev) => [...prev, s]);
      setNewTitle("");
      onChanged();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add subtask", "error");
    } finally {
      setBusy(false);
    }
  }

  async function toggleSub(s: Subtask) {
    const optimistic = { ...s, isCompleted: !s.isCompleted };
    setSubs((prev) => prev.map((x) => (x._id === s._id ? optimistic : x)));
    try {
      await subtasksApi.update(projectId, task!._id, s._id, { isCompleted: !s.isCompleted });
      onChanged();
    } catch {
      setSubs((prev) => prev.map((x) => (x._id === s._id ? s : x))); // revert
      toast("Failed to update subtask", "error");
    }
  }

  async function delSub(s: Subtask) {
    setSubs((prev) => prev.filter((x) => x._id !== s._id));
    try {
      await subtasksApi.remove(projectId, task!._id, s._id);
      onChanged();
    } catch {
      toast("Failed to delete subtask", "error");
    }
  }

  async function deleteTask() {
    if (!confirm("Delete this task?")) return;
    try {
      await tasksApi.remove(projectId, task!._id);
      toast("Task deleted", "success");
      onOpenChange(false);
      onChanged();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to delete", "error");
    }
  }

  const doneCount = subs.filter((s) => s.isCompleted).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-8">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{STATUS_LABEL[task.status]}</Badge>
            <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
            {task.dueDate && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs"><CalendarClock className="size-3.5" /> {formatDate(task.dueDate)}</span>
            )}
          </div>
        </DialogHeader>

        {task.description && <p className="text-muted-foreground text-sm">{task.description}</p>}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Assignee:</span>
          {assignee ? (
            <span className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full text-[10px] font-semibold">{initials(assignee.fullName || assignee.username)}</span>
              {assignee.fullName || assignee.username}
            </span>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>

        {/* Subtasks */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Subtasks {subs.length > 0 && <span className="text-muted-foreground font-normal">({doneCount}/{subs.length})</span>}</h4>
          </div>
          <div className="space-y-1.5">
            {subs.map((s) => (
              <div key={s._id} className="group hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5">
                <input type="checkbox" checked={s.isCompleted} onChange={() => toggleSub(s)} className="accent-primary size-4" />
                <span className={`flex-1 text-sm ${s.isCompleted ? "text-muted-foreground line-through" : ""}`}>{s.title}</span>
                <button onClick={() => delSub(s)} className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            {subs.length === 0 && <p className="text-muted-foreground px-2 py-1 text-sm">No subtasks yet.</p>}
          </div>
          <form onSubmit={addSub} className="mt-2 flex gap-2">
            <Input placeholder="Add a subtask..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="h-9" />
            <Button type="submit" size="sm" disabled={busy || !newTitle.trim()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}</Button>
          </form>
        </div>

        <div className="flex justify-between border-t border-border/60 pt-4">
          <Button variant="destructive" size="sm" onClick={deleteTask}><Trash2 className="size-4" /> Delete</Button>
          <Button size="sm" onClick={onEdit}><Pencil className="size-4" /> Edit task</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
