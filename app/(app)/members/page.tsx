"use client";
import * as React from "react";
import { UserPlus, MoreVertical, Trash2, Shield, FolderKanban, Users } from "lucide-react";
import { members as membersApi, ApiError } from "@/lib/api";
import type { ProjectMember, MemberRole } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { useMyProjects } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectSelect } from "@/components/common/project-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AddMemberDialog } from "@/components/members/add-member-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { initials, colorFromString } from "@/lib/format";

const ROLE_VARIANT: Record<MemberRole, "danger" | "warning" | "secondary"> = {
  admin: "danger",
  project_admin: "warning",
  member: "secondary",
};
const ROLES: MemberRole[] = ["member", "project_admin", "admin"];

export default function MembersPage() {
  const { projects, loading: projectsLoading } = useMyProjects();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<string>("");
  const [list, setList] = React.useState<ProjectMember[] | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState<ProjectMember | null>(null);

  React.useEffect(() => {
    if (!selected && projects.length) setSelected(projects[0].project._id);
  }, [projects, selected]);

  const myRole = projects.find((p) => p.project._id === selected)?.role;
  const canManage = myRole === "admin" || myRole === "project_admin";
  const isAdmin = myRole === "admin";

  const load = React.useCallback(async () => {
    if (!selected) return;
    setList(null);
    const m = await membersApi.list(selected).catch(() => []);
    setList(m);
  }, [selected]);

  React.useEffect(() => { load(); }, [load]);

  async function changeRole(m: ProjectMember, role: MemberRole) {
    try {
      await membersApi.update(selected, m.user._id, { role });
      toast("Role updated", "success");
      load();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to update role", "error");
    }
  }

  async function remove(m: ProjectMember) {
    await membersApi.remove(selected, m.user._id);
    toast("Member removed", "success");
    load();
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Manage who has access to each project."
        action={
          canManage && selected ? (
            <Button onClick={() => setAddOpen(true)}><UserPlus className="size-4" /> Add Member</Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        {projectsLoading ? <Skeleton className="h-10 w-64" /> : (
          projects.length ? <ProjectSelect projects={projects} value={selected} onChange={setSelected} /> : null
        )}
      </div>

      {!projectsLoading && projects.length === 0 && (
        <Card className="gap-0">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create a project to start managing members."
          />
        </Card>
      )}

      {selected && (
        <Card className="divide-border/60 gap-0 divide-y py-0">
          {!list && Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-10 w-full" /></div>)}
          {list && list.length === 0 && (
            <EmptyState
              icon={Users}
              title="No members yet"
              description="Add team members to this project."
              action={
                canManage ? (
                  <Button onClick={() => setAddOpen(true)}><UserPlus className="size-4" /> Add Member</Button>
                ) : undefined
              }
            />
          )}
          {list?.map((m) => (
            <div key={m._id} className="flex items-center gap-3 px-4 py-3">
              <Avatar>
                {m.user.avatar && <AvatarImage src={m.user.avatar} alt={m.user.username} />}
                <AvatarFallback style={{ backgroundColor: colorFromString(m.user.username), color: "#fff" }}>{initials(m.user.fullName || m.user.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.user.fullName || m.user.username}</p>
                <p className="text-muted-foreground truncate text-xs">{m.user.email}</p>
              </div>
              <Badge variant={ROLE_VARIANT[m.role]} className="capitalize">{m.role.replace("_", " ")}</Badge>
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:bg-accent rounded-md p-1.5 outline-none"><MoreVertical className="size-4" /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAdmin && (
                      <>
                        <DropdownMenuLabel className="flex items-center gap-1.5"><Shield className="size-3.5" /> Change role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ROLES.filter((r) => r !== m.role).map((r) => (
                          <DropdownMenuItem key={r} onClick={() => changeRole(m, r)} className="capitalize">{r.replace("_", " ")}</DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem variant="destructive" onClick={() => setRemoving(m)}><Trash2 className="size-4" /> Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </Card>
      )}

      {selected && <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} projectId={selected} onAdded={load} />}
      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove member?"
        description={`${removing?.user.fullName || removing?.user.username} will lose access to this project.`}
        confirmLabel="Remove"
        destructive
        onConfirm={async () => { if (removing) await remove(removing); }}
      />
    </div>
  );
}
