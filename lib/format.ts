import type { TaskStatus, TaskPriority } from "./types";

export function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(date?: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Returns e.g. "2 days left", "Today", "3 days overdue". */
export function relativeDue(date?: string | null): { label: string; overdue: boolean } {
  if (!date) return { label: "No due date", overdue: false };
  const d = new Date(date);
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (isNaN(days)) return { label: "No due date", overdue: false };
  if (days < 0) return { label: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`, overdue: true };
  if (days === 0) return { label: "Due today", overdue: false };
  if (days === 1) return { label: "1 day left", overdue: false };
  return { label: `${days} days left`, overdue: false };
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  "to-do": "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export const STATUS_ACCENT: Record<TaskStatus, string> = {
  "to-do": "bg-slate-400",
  "in-progress": "bg-blue-500",
  done: "bg-emerald-500",
};

export const PRIORITY_VARIANT: Record<TaskPriority, "secondary" | "info" | "warning" | "danger"> = {
  low: "secondary",
  medium: "info",
  high: "warning",
  critical: "danger",
};

export const STATUS_HEX: Record<TaskStatus, string> = {
  "to-do": "#f59e0b",
  "in-progress": "#3b82f6",
  done: "#10b981",
};
export const OVERDUE_HEX = "#ef4444";

/** Tailwind classes for small status chips/badges. */
export const STATUS_CHIP: Record<TaskStatus, string> = {
  "to-do": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "in-progress": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};
export const OVERDUE_CHIP = "bg-red-500/15 text-red-600 dark:text-red-400";

export const PRIORITY_CHIP: Record<TaskPriority, string> = {
  low: "bg-slate-400",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  critical: "bg-red-500",
};

/** Deterministic pleasant color from a string (for avatar fallbacks). */
export function colorFromString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 45%)`;
}
