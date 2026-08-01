import { AppShell } from "@/components/layout/app-shell";
import { ProjectsProvider } from "@/components/providers/projects-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectsProvider>
      <AppShell>{children}</AppShell>
    </ProjectsProvider>
  );
}
