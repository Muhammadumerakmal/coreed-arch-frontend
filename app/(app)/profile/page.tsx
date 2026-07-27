"use client";
import * as React from "react";
import { Camera, Loader2, CheckCircle2, Mail, Calendar } from "lucide-react";
import { auth, ApiError } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials, colorFromString, formatDate } from "@/lib/format";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const [oldPassword, setOld] = React.useState("");
  const [newPassword, setNew] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [changing, setChanging] = React.useState(false);

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await auth.updateAvatar(file);
      await refresh();
      toast("Avatar updated", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) { toast("Passwords do not match", "error"); return; }
    setChanging(true);
    try {
      await auth.changePassword({ oldPassword, newPassword });
      toast("Password changed", "success");
      setOld(""); setNew(""); setConfirm("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to change password", "error");
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" subtitle="Your account details." />

      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:items-center">
          <div className="relative">
            <Avatar className="size-24">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
              <AvatarFallback className="text-2xl" style={{ backgroundColor: colorFromString(user?.username || "u"), color: "#fff" }}>{initials(user?.fullName || user?.username)}</AvatarFallback>
            </Avatar>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full shadow-md">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold">{user?.fullName || user?.username}</h2>
              {user?.isEmailVerified && <Badge variant="success" className="gap-1"><CheckCircle2 className="size-3" /> Verified</Badge>}
            </div>
            <p className="text-muted-foreground text-sm">@{user?.username}</p>
            <div className="text-muted-foreground mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:gap-4">
              <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> Joined {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old">Current password</Label>
              <Input id="old" type="password" required value={oldPassword} onChange={(e) => setOld(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" required value={newPassword} onChange={(e) => setNew(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={changing}>{changing && <Loader2 className="size-4 animate-spin" />} Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
