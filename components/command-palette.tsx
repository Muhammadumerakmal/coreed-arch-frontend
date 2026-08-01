"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  StickyNote,
  Users,
  Sparkles,
  Calendar,
  BarChart3,
  User,
  Settings,
  Search,
  CornerDownLeft,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { tasks as tasksApi } from "@/lib/api";
import type { Task } from "@/lib/types";
import { useMyProjects } from "@/lib/hooks";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/animations";
import { cn } from "@/lib/utils";

type Entry = { id: string; label: string; sub: string; href: string; icon: LucideIcon };
type SearchTask = Task & { projectName: string };

const QUICK_LINKS: Entry[] = [
  { id: "dashboard", label: "Dashboard", sub: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", sub: "Workspace", href: "/projects", icon: FolderKanban },
  { id: "tasks", label: "All Tasks", sub: "Workspace", href: "/tasks", icon: ListChecks },
  { id: "notes", label: "Notes", sub: "Workspace", href: "/notes", icon: StickyNote },
  { id: "members", label: "Members", sub: "Team", href: "/members", icon: Users },
  { id: "ai", label: "AI Assistant", sub: "Intelligence", href: "/ai-assistant", icon: Sparkles },
  { id: "calendar", label: "Calendar", sub: "Intelligence", href: "/calendar", icon: Calendar },
  { id: "reports", label: "Reports", sub: "Intelligence", href: "/reports", icon: BarChart3 },
  { id: "profile", label: "Profile", sub: "Account", href: "/profile", icon: User },
  { id: "settings", label: "Settings", sub: "Account", href: "/settings", icon: Settings },
];

function score(query: string, label: string): number {
  const q = query.trim().toLowerCase();
  const l = label.toLowerCase();
  if (!q) return 0;
  if (l.startsWith(q)) return 1;
  return l.includes(q) ? 2 : -1;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const { projects, loading: projectsLoading } = useMyProjects();
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [tasks, setTasks] = React.useState<SearchTask[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const loadedRef = React.useRef(false);

  // Global Ctrl/Cmd+K shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Lazy-load tasks the first time the palette opens (projects come from the shared cache)
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const taskLists = await Promise.all(
        projects.slice(0, 6).map((mp) =>
          tasksApi
            .list(mp.project._id, { limit: 30 })
            .then((r) => r.tasks.map((t) => ({ ...t, projectName: mp.project.name } as SearchTask)))
            .catch(() => [] as SearchTask[]),
        ),
      );
      setTasks(taskLists.flat());
    } finally {
      setLoading(false);
    }
  }, [projects]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      if (!loadedRef.current && !projectsLoading) {
        loadedRef.current = true;
        load();
      }
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, load, projectsLoading]);

  const groups = React.useMemo(() => {
    const result: { group: string; entries: Entry[] }[] = [];
    const quick = QUICK_LINKS.filter((e) => score(query, e.label) >= 0);
    if (quick.length) result.push({ group: "Pages", entries: quick });
    const projs = projects
      .filter((p) => score(query, p.project.name) >= 0)
      .map((p) => ({ id: p.project._id, label: p.project.name, sub: "Project", href: `/projects/${p.project._id}`, icon: FolderKanban }));
    if (projs.length) result.push({ group: "Projects", entries: projs });
    const tsks = tasks
      .filter((t) => score(query, t.title) >= 0)
      .slice(0, 8)
      .map((t) => ({ id: t._id, label: t.title, sub: t.projectName || "Task", href: `/projects/${t.project}`, icon: ListChecks }));
    if (tsks.length) result.push({ group: "Tasks", entries: tsks });
    return result;
  }, [query, projects, tasks]);

  const flat = React.useMemo(() => groups.flatMap((g) => g.entries), [groups]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (flat.length ? Math.min(i + 1, flat.length - 1) : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = flat[index];
      if (entry) go(entry.href);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            className="bg-popover text-popover-foreground relative w-full max-w-lg overflow-hidden rounded-xl border border-border/60 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/60 px-4">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search pages, projects, tasks..."
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-muted-foreground rounded border border-border/60 px-1.5 py-0.5 text-[10px]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {(loading || projectsLoading) && groups.length === 0 && (
            <div className="flex items-center gap-2 px-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading your workspace…
            </div>
          )}
          {!loading && flat.length === 0 && (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </div>
          )}
          {groups.map((g) => (
            <div key={g.group} className="mb-1">
              <div className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                {g.group}
              </div>
              {g.entries.map((e) => {
                flatIndex += 1;
                const active = flatIndex === index;
                const Icon = e.icon;
                return (
                  <button
                    key={`${g.group}-${e.id}`}
                    data-palette-index={flatIndex}
                    onClick={() => go(e.href)}
                    onMouseEnter={() => setIndex(flatIndex)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      active ? "bg-accent text-accent-foreground" : "text-foreground",
                    )}
                  >
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{e.label}</p>
                      <p className="text-muted-foreground truncate text-xs">{e.sub}</p>
                    </div>
                    {active && <CornerDownLeft className="text-muted-foreground size-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CornerDownLeft className="size-3" /> open</span>
          <span className="flex items-center gap-1.5"><span className="text-muted-foreground">↑↓</span> navigate</span>
          <span className="ml-auto flex items-center gap-1"><kbd className="rounded border border-border/60 px-1 text-[10px]">Ctrl</kbd> <kbd className="rounded border border-border/60 px-1 text-[10px]">K</kbd> toggle</span>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
