"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { tasks as tasksApi, ApiError } from "@/lib/api";
import type { Task, ProjectMember, TaskStatus, TaskPriority } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUSES: TaskStatus[] = ["to-do", "in-progress", "done"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "critical"];
const UNASSIGNED = "unassigned";

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  members,
  task,
  defaultStatus,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  members: ProjectMember[];
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const editing = Boolean(task);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("to-do");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState<string>(UNASSIGNED);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus(task?.status ?? defaultStatus ?? "to-do");
    setPriority(task?.priority ?? "medium");
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    const a = task?.assignedTo;
    setAssignedTo(typeof a === "object" && a ? a._id : typeof a === "string" ? a : UNASSIGNED);
  }, [open, task, defaultStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const due = dueDate ? `${dueDate}T23:59:59` : undefined;
    const assignee = assignedTo !== UNASSIGNED ? assignedTo : undefined;
    try {
      if (editing && task) {
        await tasksApi.update(projectId, task._id, {
          title, description, status, priority,
          ...(due ? { dueDate: due } : {}),
          ...(assignee ? { assignedTo: assignee } : {}),
        });
        toast("Task updated", "success");
      } else {
        await tasksApi.create(projectId, {
          title, description, status, priority,
          ...(due ? { dueDate: due } : {}),
          ...(assignee ? { assignedTo: assignee } : {}),
        });
        toast("Task created", "success");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" required placeholder="Design the landing page" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea id="t-desc" placeholder="Details..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("-", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-due">Due date</Label>
              <Input id="t-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {members.map((m) => <SelectItem key={m.user._id} value={m.user._id}>{m.user.fullName || m.user.username}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />} {editing ? "Save" : "Create task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
