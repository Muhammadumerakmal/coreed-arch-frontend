"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, UserPlus, ListChecks, Info } from "lucide-react";
import { notifications as notificationsApi } from "@/lib/api";
import type { AppNotification, NotificationType } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function relativeTime(date?: string): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function typeIcon(type: NotificationType) {
  switch (type) {
    case "project_invite":
      return <UserPlus className="size-4" />;
    case "task_assignment":
      return <ListChecks className="size-4" />;
    default:
      return <Info className="size-4" />;
  }
}

export function NotificationsPopover() {
  const router = useRouter();
  const [items, setItems] = React.useState<AppNotification[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const res = await notificationsApi.list({ limit: 20 });
      setItems(res.notifications);
      setUnread(res.unreadCount);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openItem = async (n: AppNotification) => {
    if (!n.read) {
      setItems((prev) => prev.map((i) => (i._id === n._id ? { ...i, read: true } : i)));
      setUnread((u) => Math.max(0, u - 1));
      notificationsApi.markRead(n._id).catch(() => {});
    }
    if (n.link) router.push(n.link);
  };

  const markAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnread(0);
    await notificationsApi.markAllRead().catch(() => {});
    load();
  };

  return (
    <DropdownMenu onOpenChange={(o) => o && load()}>
      <DropdownMenuTrigger
        className="hover:bg-accent relative rounded-lg p-2 outline-none transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="bg-destructive text-destructive-foreground absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="text-primary hover:underline text-xs font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <Bell className="text-muted-foreground size-5" />
            </div>
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-muted-foreground max-w-[220px] text-xs">
              Task assignments and project activity will show up here.
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => openItem(n)}
                className={cn(
                  "hover:bg-accent flex w-full items-start gap-3 border-b border-border/40 px-3 py-3 text-left transition-colors",
                  !n.read && "bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                    n.type === "task_assignment" ? "bg-primary/10 text-primary" : n.type === "project_invite" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground",
                  )}
                >
                  {typeIcon(n.type)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-muted-foreground shrink-0 text-[10px]">{relativeTime(n.createdAt)}</span>
                  </span>
                  {n.body && <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">{n.body}</span>}
                </span>
                {!n.read && <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" />}
              </button>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <div className="p-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
          >
            <CheckCheck className="size-4" /> View activity
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}