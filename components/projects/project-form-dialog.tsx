"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { projects as projectsApi, ApiError } from "@/lib/api";
import type { Project } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  project?: Project | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const editing = Boolean(project);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(project?.name ?? "");
      setDescription(project?.description ?? "");
    }
  }, [open, project]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing && project) {
        await projectsApi.update(project._id, { name, description });
        toast("Project updated", "success");
      } else {
        await projectsApi.create({ name, description });
        toast("Project created", "success");
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
          <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>{editing ? "Update your project details." : "Create a project to organize tasks and your team."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" required placeholder="Website Revamp" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" placeholder="What is this project about?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />} {editing ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
