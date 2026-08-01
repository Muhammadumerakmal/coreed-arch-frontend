"use client";
import * as React from "react";
import Link from "next/link";
import { FolderKanban, Plus, MoreVertical, Pencil, Archive, Trash2, Users, ListChecks } from "lucide-react";
import { projects as projectsApi, tasks as tasksApi, ApiError } from "@/lib/api";
import type { Project, MemberRole } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { formatDate } from "@/lib/format";

type Row = { project: Project; role: MemberRole; total: number; done: number; members: number };

export default function ProjectsPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Project | null>(null);
  const [deleting, setDeleting] = React.useState<Project | null>(null);

  const load = React.useCallback(async () => {
    try {
      const { projects } = await projectsApi.list();
      const built = await Promise.all(
        projects.map(async (mp) => {
          const tasks = await tasksApi.list(mp.project._id, { limit: 100 }).then((r) => r.tasks).catch(() => []);
          return {
            project: mp.project,
            role: mp.role,
            total: tasks.length,
            done: tasks.filter((t) => t.status === "done").length,
            members: mp.project.metadata?.totalMembers ?? 0,
          } as Row;
        }),
      );
      setRows(built);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function archive(p: Project) {
    try {
      await projectsApi.update(p._id, { isArchived: !p.metadata?.isArchived });
      toast(p.metadata?.isArchived ? "Project unarchived" : "Project archived", "success");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed", "error");
    }
  }

  async function remove(p: Project) {
    await projectsApi.remove(p._id);
    toast("Project deleted", "success");
    load();
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Create and manage your projects."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> New Project
          </Button>
        }
      />

      {error && <Card className="p-8 text-center"><p className="font-medium">Couldn&apos;t load projects</p><p className="text-muted-foreground mt-1 text-sm">{error}</p></Card>}

      {!rows && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      )}

      {rows && rows.length === 0 && (
        <Card className="gap-0">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to get started."
            action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" /> New Project</Button>}
          />
        </Card>
      )}

      {rows && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ project, role, total, done, members }) => {
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <Card key={project._id} hover className="group gap-0 p-5">
                <div className="flex items-start justify-between">
                  <Link href={`/projects/${project._id}`} className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"><FolderKanban className="size-5" /></div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="hover:bg-accent rounded-md p-1.5 outline-none"><MoreVertical className="size-4" /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(project); setFormOpen(true); }}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archive(project)}><Archive className="size-4" /> {project.metadata?.isArchived ? "Unarchive" : "Archive"}</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleting(project)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link href={`/projects/${project._id}`} className="mt-3 block">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{project.name}</h3>
                    {project.metadata?.isArchived && <Badge variant="secondary">Archived</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-2 min-h-8 text-sm">{project.description || "No description"}</p>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} indicatorClassName="bg-primary" />
                  </div>

                  <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1"><ListChecks className="size-3.5" /> {total} tasks</span>
                    <span className="flex items-center gap-1"><Users className="size-3.5" /> {members}</span>
                    <Badge variant="outline" className="ml-auto py-0">{role.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-[11px]">Updated {formatDate(project.updatedAt)}</p>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} project={editing} onSaved={load} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete project?"
        description={`"${deleting?.name}" and all its tasks, subtasks, and notes will be permanently deleted.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => { if (deleting) await remove(deleting); }}
      />
    </div>
  );
}
