"use client";
import * as React from "react";
import Link from "next/link";
import { Moon, Sun, Monitor, LogOut, User as UserIcon, Mail, CheckCircle2, Bell } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const THEME_MODES = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
] as const;

const NOTIFICATION_PREFS: { key: string; label: string; desc: string }[] = [
  { key: "taskAssignments", label: "Task assignments", desc: "Be notified when you are assigned a task." },
  { key: "projectActivity", label: "Project activity", desc: "Updates when tasks or members change in your projects." },
  { key: "emailSummaries", label: "Email summaries", desc: "A weekly digest of progress across your workspace." },
];

function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-card shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { mode, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("notifPrefs") || "{}");
      setPrefs(stored);
    } catch {
      setPrefs({});
    } finally {
      setLoaded(true);
    }
  }, []);

  const updatePref = (key: string, v: boolean) => {
    const next = { ...prefs, [key]: v };
    setPrefs(next);
    try {
      localStorage.setItem("notifPrefs", JSON.stringify(next));
    } catch {
      // ignore storage errors (private mode etc.)
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" subtitle="Workspace and application preferences." />

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-muted-foreground text-sm">Choose a light or dark look, or follow your system.</p>
            </div>
            <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
              {THEME_MODES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", mode === t.key ? "bg-card shadow-sm" : "text-muted-foreground")}
                  aria-pressed={mode === t.key}
                >
                  <t.icon className="size-4" /> {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                  <UserIcon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
                    {user?.isEmailVerified && (
                      <Badge variant="success" className="gap-1 py-0"><CheckCircle2 className="size-3" /> Verified</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm"><Mail className="size-3.5" /> {user?.email}</p>
                </div>
              </div>
              <Button asChild variant="outline"><Link href="/profile">Edit profile</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="size-4" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loaded && NOTIFICATION_PREFS.map((p) => (
              <div key={p.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-muted-foreground text-sm">{p.desc}</p>
                </div>
                <Switch checked={Boolean(prefs[p.key])} onCheckedChange={(v) => updatePref(p.key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-muted-foreground text-sm">Log out of your account on this device.</p>
              </div>
              <Button variant="destructive" onClick={() => logout()}><LogOut className="size-4" /> Log out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
