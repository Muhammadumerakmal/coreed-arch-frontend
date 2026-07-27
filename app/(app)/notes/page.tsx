"use client";
import * as React from "react";
import { Plus, MoreVertical, Pin, PinOff, Pencil, Trash2, StickyNote } from "lucide-react";
import { notes as notesApi, ApiError } from "@/lib/api";
import type { Note } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { useMyProjects } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectSelect } from "@/components/common/project-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { NoteFormDialog } from "@/components/notes/note-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatDate } from "@/lib/format";

export default function NotesPage() {
  const { projects, loading: projectsLoading } = useMyProjects();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<string>("");
  const [list, setList] = React.useState<Note[] | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Note | null>(null);
  const [deleting, setDeleting] = React.useState<Note | null>(null);

  React.useEffect(() => {
    if (!selected && projects.length) setSelected(projects[0].project._id);
  }, [projects, selected]);

  const load = React.useCallback(async () => {
    if (!selected) return;
    setList(null);
    const n = await notesApi.list(selected).catch(() => []);
    // pinned first, then newest
    n.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setList(n);
  }, [selected]);

  React.useEffect(() => { load(); }, [load]);

  async function togglePin(n: Note) {
    try {
      await notesApi.update(selected, n._id, { isPinned: !n.isPinned });
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed", "error");
    }
  }

  async function remove(n: Note) {
    await notesApi.remove(selected, n._id);
    toast("Note deleted", "success");
    load();
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle="Project notes and documentation."
        action={selected ? <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" /> New Note</Button> : undefined}
      />

      <div className="mb-4">
        {projectsLoading ? <Skeleton className="h-10 w-64" /> : (projects.length ? <ProjectSelect projects={projects} value={selected} onChange={setSelected} /> : null)}
      </div>

      {!projectsLoading && projects.length === 0 && (
        <Card className="py-16 text-center"><p className="text-muted-foreground text-sm">You have no projects yet.</p></Card>
      )}

      {!list && selected && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>}

      {list && list.length === 0 && (
        <Card className="flex flex-col items-center gap-2 py-16 text-center">
          <div className="bg-muted flex size-12 items-center justify-center rounded-full"><StickyNote className="text-muted-foreground size-5" /></div>
          <p className="font-medium">No notes yet</p>
          <p className="text-muted-foreground text-sm">Create your first note for this project.</p>
        </Card>
      )}

      {list && list.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((n) => (
            <Card key={n._id} className="group gap-0 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {n.isPinned && <Pin className="size-3.5 text-amber-500" />}
                  <h3 className="font-semibold">{n.title}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:bg-accent rounded-md p-1.5 outline-none"><MoreVertical className="size-4" /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => togglePin(n)}>{n.isPinned ? <><PinOff className="size-4" /> Unpin</> : <><Pin className="size-4" /> Pin</>}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setEditing(n); setFormOpen(true); }}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleting(n)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-muted-foreground mt-2 line-clamp-4 whitespace-pre-wrap text-sm">{n.content}</p>
              {n.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">{n.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
              )}
              <p className="text-muted-foreground mt-3 text-[11px]">v{n.version} · updated {formatDate(n.updatedAt)}</p>
            </Card>
          ))}
        </div>
      )}

      {selected && <NoteFormDialog open={formOpen} onOpenChange={setFormOpen} projectId={selected} note={editing} onSaved={load} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete note?"
        description={`"${deleting?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => { if (deleting) await remove(deleting); }}
      />
    </div>
  );
}
