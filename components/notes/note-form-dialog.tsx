"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { notes as notesApi, ApiError } from "@/lib/api";
import type { Note } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NoteFormDialog({
  open,
  onOpenChange,
  projectId,
  note,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  note?: Note | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const editing = Boolean(note);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setTags((note?.tags ?? []).join(", "));
  }, [open, note]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      if (editing && note) {
        await notesApi.update(projectId, note._id, { title, content, tags: tagArr });
        toast("Note updated", "success");
      } else {
        await notesApi.create(projectId, { title, content, tags: tagArr });
        toast("Note created", "success");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to save note", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit note" : "New note"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="n-title">Title</Label>
            <Input id="n-title" required placeholder="Meeting notes" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="n-content">Content</Label>
            <Textarea id="n-content" required rows={6} placeholder="Write your note..." value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="n-tags">Tags <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
            <Input id="n-tags" placeholder="planning, design" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />} {editing ? "Save" : "Create note"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
