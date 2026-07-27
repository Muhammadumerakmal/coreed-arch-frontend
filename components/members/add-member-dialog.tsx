"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { members as membersApi, ApiError } from "@/lib/api";
import type { MemberRole } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const ROLES: MemberRole[] = ["member", "project_admin", "admin"];

export function AddMemberDialog({
  open,
  onOpenChange,
  projectId,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  onAdded: () => void;
}) {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<MemberRole>("member");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => { if (open) { setEmail(""); setRole("member"); } }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await membersApi.add(projectId, { email, role });
      toast("Member added", "success");
      onAdded();
      onOpenChange(false);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add member", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Invite an existing user by email to this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="m-email">Email</Label>
            <Input id="m-email" type="email" required placeholder="teammate@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />} Add member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
