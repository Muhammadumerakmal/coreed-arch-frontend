"use client";
import * as React from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  MoreVertical,
  Sparkles,
  CalendarClock,
} from "lucide-react";
import { tasks as tasksApi, members as membersApi } from "@/lib/api";
import type { MyProject, Task, User } from "@/lib/types";
import { useAuth } from "@/components/providers/auth-provider";
import { useMyProjects } from "@/lib/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Donut } from "@/components/charts/donut";
import { motion } from "motion/react";
import { containerStagger, fadeUp } from "@/lib/animations";
import { initials, colorFromString, relativeDue, formatDate, STATUS_HEX, OVERDUE_HEX } from "@/lib/format";

type ProjRow = { p: MyProject["project"]; role: string; total: number; done: number; pct: number };

type Agg = {
  rows: ProjRow[];
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  pending: number;
  subtaskTotal: number;
  subtaskDone: number;
  teamCount: number;
  series: { tasks: number[]; done: number[]; pending: number[]; members: number[] };
  upcoming: { task: Task; projectName: string }[];
  activity: { task: Task; projectName: string }[];
  team: User[];
};

function relativeTime(date?: string): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useMyProjects();
  const [data, setData] = React.useState<Agg | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (projectsLoading) return;
    let active = true;
    (async () => {
      try {
        const perProject = await Promise.all(
          projects.map(async (mp) => {
            const [taskRes, memberRes] = await Promise.all([
              tasksApi.list(mp.project._id, { limit: 100 }).then((r) => r.tasks).catch(() => [] as Task[]),
              membersApi.list(mp.project._id).catch(() => []),
            ]);
            return { mp, tasks: taskRes, members: memberRes };
          }),
        );
        if (!active) return;

        const now = Date.now();
        const rows: ProjRow[] = [];
        let completed = 0, inProgress = 0, todo = 0, overdue = 0;
        let subtaskTotal = 0, subtaskDone = 0;
        const series = { tasks: [] as number[], done: [] as number[], pending: [] as number[], members: [] as number[] };
        const upcoming: { task: Task; projectName: string }[] = [];
        const activity: { task: Task; projectName: string }[] = [];
        const teamMap = new Map<string, User>();

        for (const { mp, tasks, members } of perProject) {
          const total = tasks.length;
          const doneN = tasks.filter((t) => t.status === "done").length;
          const ipN = tasks.filter((t) => t.status === "in-progress").length;
          const todoN = tasks.filter((t) => t.status === "to-do").length;
          const odN = tasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate).getTime() < now).length;

          completed += doneN; inProgress += ipN; todo += todoN; overdue += odN;
          rows.push({ p: mp.project, role: mp.role, total, done: doneN, pct: total ? Math.round((doneN / total) * 100) : 0 });
          series.tasks.push(total); series.done.push(doneN); series.pending.push(todoN + ipN); series.members.push(members.length);

          for (const m of members) if (m.user?._id) teamMap.set(m.user._id, m.user);
          for (const t of tasks) {
            if (t.status !== "done" && t.dueDate) upcoming.push({ task: t, projectName: mp.project.name });
            activity.push({ task: t, projectName: mp.project.name });
            subtaskTotal += t.subtaskCount ?? 0;
            subtaskDone += t.completedSubtaskCount ?? 0;
          }
        }

        upcoming.sort((a, b) => new Date(a.task.dueDate!).getTime() - new Date(b.task.dueDate!).getTime());
        activity.sort((a, b) => new Date(b.task.updatedAt).getTime() - new Date(a.task.updatedAt).getTime());

        setData({
          rows,
          completed, inProgress, todo, overdue,
          pending: todo + inProgress,
          subtaskTotal,
          subtaskDone,
          teamCount: teamMap.size,
          series,
          upcoming: upcoming.slice(0, 4),
          activity: activity.slice(0, 5),
          team: Array.from(teamMap.values()).slice(0, 6),
        });
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [projects, projectsLoading]);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <Card className="p-8 text-center">
        <p className="font-medium">Couldn&apos;t load your dashboard</p>
        <p className="text-muted-foreground mt-1 text-sm">{error}</p>
        <p className="text-muted-foreground mt-2 text-xs">Make sure the backend is running on port 8000.</p>
      </Card>
    );

  const d = data!;
  const totalTasks = d.completed + d.inProgress + d.todo;
  const name = user?.fullName || user?.username || "there";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {name} 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <Button asChild>
          <Link href="/projects"><Plus className="size-4" /> New Project</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <motion.div variants={fadeUp}>
          <StatCard label="Total Projects" value={d.rows.length} icon={FolderKanban}
            tint="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" color={STATUS_HEX["in-progress"]}
            series={d.series.tasks} caption={`${totalTasks} tasks total`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Completed Tasks" value={d.completed} icon={CheckCircle2}
            tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" color={STATUS_HEX.done}
            series={d.series.done} caption={totalTasks ? `${Math.round((d.completed / totalTasks) * 100)}% of all tasks` : "No tasks yet"} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Pending Tasks" value={d.pending} icon={Clock}
            tint="bg-amber-500/15 text-amber-600 dark:text-amber-400" color={STATUS_HEX["to-do"]}
            series={d.series.pending} caption={`${d.overdue} overdue`} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Team Members" value={d.teamCount} icon={Users}
            tint="bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400" color="#a855f7"
            series={d.series.members} caption="across your projects" />
        </motion.div>
      </motion.div>

      {/* Projects + Tasks overview */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="font-semibold">My Projects</h2>
            <Link href="/projects" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="divide-border/60 mt-2 divide-y">
            {d.rows.length === 0 && <EmptyRow text="No projects yet — create your first one." />}
            {d.rows.slice(0, 5).map((r) => (
              <Link key={r.p._id} href={`/projects/${r.p._id}`} className="hover:bg-muted/40 flex items-center gap-4 px-6 py-4 transition-colors">
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"><FolderKanban className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{r.p.name}</p>
                    <span className="text-muted-foreground text-sm">{r.pct}%</span>
                  </div>
                  <Progress value={r.pct} className="mt-2" indicatorClassName="bg-primary" />
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    {r.total} task{r.total === 1 ? "" : "s"} · {r.done} done · <Badge variant="outline" className="ml-1 py-0">{r.role.replace("_", " ")}</Badge>
                  </p>
                </div>
                <MoreVertical className="text-muted-foreground size-4 shrink-0" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 items-center p-6">
          <h2 className="w-full font-semibold">Tasks Overview</h2>
          <Donut
            size={190}
            centerLabel={totalTasks}
            centerSub="Total Tasks"
            segments={[
              { label: "Completed", value: d.completed, color: STATUS_HEX.done },
              { label: "In Progress", value: d.inProgress, color: STATUS_HEX["in-progress"] },
              { label: "To Do", value: d.todo, color: STATUS_HEX["to-do"] },
            ]}
          />
          <div className="mt-4 w-full space-y-2">
            <LegendRow color={STATUS_HEX.done} label="Completed" value={d.completed} total={totalTasks} />
            <LegendRow color={STATUS_HEX["in-progress"]} label="In Progress" value={d.inProgress} total={totalTasks} />
            <LegendRow color={STATUS_HEX["to-do"]} label="To Do" value={d.todo} total={totalTasks} />
            <LegendRow color={OVERDUE_HEX} label="Overdue" value={d.overdue} total={totalTasks} />
          </div>
          {d.subtaskTotal > 0 && (
            <div className="mt-4 w-full">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-violet-500" /> Subtasks</span>
                <span className="font-medium">{d.subtaskDone}/{d.subtaskTotal}</span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div className="bg-violet-500 h-full rounded-full" style={{ width: `${Math.round((d.subtaskDone / d.subtaskTotal) * 100)}%` }} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Deadlines + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {d.upcoming.length === 0 && <EmptyRow text="No upcoming deadlines." />}
            {d.upcoming.map(({ task, projectName }) => {
              const due = relativeDue(task.dueDate);
              return (
                <div key={task._id} className="flex items-center gap-3">
                  <div className="bg-muted flex size-9 items-center justify-center rounded-lg"><CalendarClock className="text-muted-foreground size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-muted-foreground truncate text-xs">{projectName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{formatDate(task.dueDate)}</p>
                    <p className={`text-xs ${due.overdue ? "text-red-500" : "text-muted-foreground"}`}>{due.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            {d.activity.length === 0 && <EmptyRow text="No recent activity." />}
            {d.activity.map(({ task, projectName }) => (
              <div key={task._id} className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-8 items-center justify-center rounded-full text-xs font-semibold">{initials(projectName)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm"><span className="font-medium">{task.title}</span> <span className="text-muted-foreground">· {task.status.replace("-", " ")}</span></p>
                  <p className="text-muted-foreground text-xs">in {projectName} · {relativeTime(task.updatedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team + AI */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Team Members</h2>
          <div className="flex flex-wrap gap-5">
            {d.team.length === 0 && <EmptyRow text="No teammates yet." />}
            {d.team.map((m) => (
              <div key={m._id} className="flex w-16 flex-col items-center gap-1.5 text-center">
                <Avatar className="size-12">
                  {m.avatar && <AvatarImage src={m.avatar} alt={m.username} />}
                  <AvatarFallback style={{ backgroundColor: colorFromString(m.username), color: "#fff" }}>{initials(m.fullName || m.username)}</AvatarFallback>
                </Avatar>
                <span className="w-full truncate text-xs font-medium">{m.fullName || m.username}</span>
              </div>
            ))}
            <Link href="/members" className="border-border text-muted-foreground hover:border-primary hover:text-primary flex size-12 items-center justify-center rounded-full border border-dashed"><Plus className="size-5" /></Link>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-6 text-white">
          <Badge className="mb-2 border-white/30 bg-white/20 text-white">New</Badge>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5" /> AI Assistant</h2>
          <p className="mt-1 max-w-sm text-sm text-white/85">Get AI-powered help with tasks, risk analysis, and planning across your projects.</p>
          <Button asChild variant="secondary" className="mt-4"><Link href="/ai-assistant">Open Assistant</Link></Button>
          <Sparkles className="absolute -bottom-6 -right-6 size-40 text-white/10" />
        </Card>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1">{label}</span>
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground w-10 text-right text-xs">{pct}%</span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-muted-foreground px-6 py-6 text-center text-sm">{text}</p>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  );
}
