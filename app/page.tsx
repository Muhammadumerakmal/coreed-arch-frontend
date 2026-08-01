import Link from "next/link";
import {
  LayoutGrid,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  StickyNote,
  Users,
  BarChart3,
  CalendarClock,
  ShieldAlert,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: FolderKanban,
    title: "Project workspaces",
    desc: "Organize work into projects with members, roles, and per-project permissions.",
  },
  {
    icon: ListChecks,
    title: "Tasks & subtasks",
    desc: "Break work into trackable tasks and subtasks with priorities, due dates, and progress.",
  },
  {
    icon: StickyNote,
    title: "Shared notes",
    desc: "Capture project context in versioned notes everyone on the team can edit.",
  },
  {
    icon: Users,
    title: "Team management",
    desc: "Invite members, assign roles, and see who is working on what at a glance.",
  },
  {
    icon: BarChart3,
    title: "Reports & insights",
    desc: "Track completion, overdue work, and team load with live charts and analytics.",
  },
  {
    icon: CalendarClock,
    title: "Deadline tracking",
    desc: "Never miss a date — upcoming deadlines and overdue tasks surface automatically.",
  },
];

const AI_POINTS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Sparkles,
    title: "Task suggestions",
    desc: "Describe a feature or goal and get a structured list of tasks and subtasks.",
  },
  {
    icon: ShieldAlert,
    title: "Risk analysis",
    desc: "Scan your project for blockers, overload, and timeline risk in seconds.",
  },
  {
    icon: Scale,
    title: "Workload balancing",
    desc: "Re-balance assignments so no teammate is stretched too thin.",
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-9 items-center justify-center rounded-xl shadow-md shadow-indigo-500/25">
        <LayoutGrid className="size-5 text-white" />
      </div>
      <span className="text-lg font-bold tracking-tight">Project Camp</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] size-[640px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
        <div className="absolute right-[-8%] top-[28%] size-[420px] rounded-full bg-fuchsia-500/15 blur-[130px]" />
        <div className="absolute bottom-[-5%] left-[-8%] size-[420px] rounded-full bg-violet-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(120,120,170,0.16)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_75%)]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <nav className="text-muted-foreground hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#ai" className="transition-colors hover:text-foreground">AI Assistant</a>
            <Link href="/reports" className="transition-colors hover:text-foreground">Insights</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link href="/register">Get started <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-20 text-center sm:px-6 md:pt-28">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" /> AI-powered project management
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Plan, collaborate, and ship with{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
            an AI copilot
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-pretty text-base sm:text-lg">
          Project Camp brings your projects, tasks, and team together — and puts an
          intelligent assistant on your side to suggest, analyze, and plan.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="gradient" asChild>
            <Link href="/register">Create free account <ArrowRight className="size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">Explore features</a>
          </Button>
        </div>

        {/* Mock dashboard */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="absolute -inset-x-8 -top-8 -z-10 h-full rounded-[2rem] bg-gradient-to-b from-indigo-500/20 to-fuchsia-500/10 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/30 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              <span className="size-2.5 rounded-full bg-amber-400/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />
              <span className="text-muted-foreground ml-2 text-xs">app.projectcamp.dev</span>
            </div>
            <div className="flex">
              {/* Faux sidebar */}
              <div className="hidden w-40 shrink-0 flex-col gap-1.5 border-r border-border/60 bg-muted/20 p-3 sm:flex">
                {["Dashboard", "Projects", "Tasks", "Notes", "Members"].map((n, i) => (
                  <div key={n} className={`h-6 rounded-md px-2 text-[11px] font-medium leading-6 ${i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground/70"}`}>{n}</div>
                ))}
              </div>
              {/* Faux content */}
              <div className="flex-1 space-y-4 p-4 sm:p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[["Tasks done", "18"], ["In progress", "6"], ["Team", "5"]].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                      <div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">{label}</div>
                      <div className="mt-1 text-2xl font-bold">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-medium">
                      <span>Launch readiness</span><span className="text-primary">72%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                    </div>
                    <div className="text-muted-foreground mt-2 space-y-1.5 text-[11px]">
                      {["Design handoff", "API integration", "Beta invites"].map((t) => (
                        <div key={t} className="flex items-center gap-1.5"><CheckCircle2 className="text-emerald-500 size-3" /> {t}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/20 p-3">
                    <div className="flex size-16 items-center justify-center rounded-full border-[10px] border-primary/20">
                      <div className="text-center">
                        <div className="text-lg font-bold leading-none">12</div>
                        <div className="text-muted-foreground text-[9px]">open</div>
                      </div>
                    </div>
                    <div className="text-muted-foreground mt-2 text-[11px]">Tasks by status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Everything a team needs to stay in sync</h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-pretty">
            Purpose-built tools for planning and executing projects — without the complexity.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} hover className="gap-0 p-6">
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* AI highlight */}
      <section id="ai" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-2xl shadow-indigo-500/30 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 size-64 rounded-full bg-black/10 blur-2xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold">
                <Sparkles className="size-3.5" /> The AI Assistant
              </div>
              <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Your projects, analyzed by AI
              </h2>
              <p className="mt-4 max-w-md text-pretty text-white/85">
                Chat with a workspace assistant, generate task breakdowns, spot risks before they
                become blockers, and keep everyone&apos;s workload balanced.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" asChild className="border-transparent bg-white text-indigo-700 shadow-md hover:bg-white/90">
                  <Link href="/register">Try the assistant <ArrowRight className="size-4" /></Link>
                </Button>
                <Button size="lg" asChild variant="ghost" className="text-white hover:bg-white/15 hover:text-white">
                  <Link href="/ai-assistant">See what it can do</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {AI_POINTS.map((p) => (
                <div key={p.title} className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <p.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-0.5 text-sm text-white/80">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to run projects with an AI copilot?
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-pretty">
          Set up your workspace in minutes. No credit card required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="gradient" asChild>
            <Link href="/register">Create free account <ArrowRight className="size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Brand />
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Project Camp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
