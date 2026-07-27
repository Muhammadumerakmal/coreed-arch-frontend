import { LayoutGrid } from "lucide-react";

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
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary flex size-10 items-center justify-center rounded-xl">
            <LayoutGrid className="size-6 text-sidebar-primary-foreground" />
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
        </div>
        <div className="text-sidebar-foreground/60 text-sm">© {new Date().getFullYear()} Project Camp</div>
        <div className="bg-sidebar-primary/30 absolute -right-24 -top-24 size-72 rounded-full blur-3xl" />
        <div className="bg-sidebar-primary/20 absolute -bottom-24 right-10 size-72 rounded-full blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="bg-primary flex size-9 items-center justify-center rounded-lg">
              <LayoutGrid className="text-primary-foreground size-5" />
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
