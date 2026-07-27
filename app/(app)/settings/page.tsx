"use client";
import Link from "next/link";
import { Moon, Sun, LogOut, User as UserIcon } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" subtitle="Workspace and application preferences." />

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-muted-foreground text-sm">Switch between light and dark mode.</p>
            </div>
            <button onClick={toggle} className="bg-muted flex items-center gap-2 rounded-lg p-1">
              <span className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", theme === "light" ? "bg-card shadow-sm" : "text-muted-foreground")}><Sun className="size-4" /> Light</span>
              <span className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", theme === "dark" ? "bg-card shadow-sm" : "text-muted-foreground")}><Moon className="size-4" /> Dark</span>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
              <Button asChild variant="outline"><Link href="/profile"><UserIcon className="size-4" /> Edit profile</Link></Button>
            </div>
            <div className="border-border/60 flex items-center justify-between border-t pt-4">
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
