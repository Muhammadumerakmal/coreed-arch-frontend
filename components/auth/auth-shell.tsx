import { LayoutGrid, CheckCircle2 } from "lucide-react";

const CHECKS = [
  "Track tasks, deadlines, and project health in one place",
  "AI suggestions for planning, risks, and workload",
  "Built for small and growing teams",
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        {/* Decoration: glows + dot grid */}
        <div className="bg-sidebar-primary/30 absolute -right-24 -top-24 size-80 rounded-full blur-3xl" />
        <div className="bg-sidebar-primary/20 absolute -bottom-24 right-10 size-80 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_80%)]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-10 items-center justify-center rounded-xl shadow-lg shadow-indigo-500/25">
            <LayoutGrid className="size-6 text-white" />
          </div>
          <span className="text-sidebar-accent-foreground text-xl font-bold">Project Camp</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-sidebar-accent-foreground text-3xl font-bold leading-tight">
            Plan, collaborate, and ship projects with AI on your side.
          </h2>
          <p className="mt-4 max-w-md text-sidebar-foreground/80">
            Track tasks, balance workloads, and get intelligent suggestions — all in one workspace.
          </p>
          <div className="mt-8 space-y-3.5">
            {CHECKS.map((c) => (
              <div key={c} className="flex items-center gap-3">
                <div className="bg-emerald-400/15 flex size-6 shrink-0 items-center justify-center rounded-full">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <span className="text-sm text-sidebar-foreground/85">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {["AB", "CD", "EF", "GH"].map((n, i) => (
                <div
                  key={n}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-sidebar text-xs font-semibold text-white"
                  style={{ backgroundColor: `hsl(${200 + i * 55} 55% 45%)` }}
                >
                  {n}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-sidebar-accent-foreground">Trusted by growing teams</span>
            </div>
          </div>
          <div className="text-sidebar-foreground/60 text-sm">© {new Date().getFullYear()} Project Camp</div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6">
        {/* Mobile-only background glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-10%] -z-10 size-96 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[100px] lg:hidden" />
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-9 items-center justify-center rounded-lg shadow-md shadow-indigo-500/25">
              <LayoutGrid className="size-5 text-white" />
            </div>
            <span className="text-lg font-bold">Project Camp</span>
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
