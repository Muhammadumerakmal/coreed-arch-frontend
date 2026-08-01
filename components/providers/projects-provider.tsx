"use client";
import * as React from "react";
import { projects as projectsApi } from "@/lib/api";
import type { MyProject } from "@/lib/types";

type ProjectsContextValue = {
  projects: MyProject[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const ProjectsContext = React.createContext<ProjectsContextValue | null>(null);

export function useProjects(): ProjectsContextValue {
  const ctx = React.useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within <ProjectsProvider>");
  return ctx;
}

/** Loads the user's projects once per app-shell mount and shares them across pages. */
export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<MyProject[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const d = await projectsApi.list();
      setProjects(d.projects);
    } catch {
      setProjects([]);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await projectsApi.list();
        if (active) setProjects(d.projects);
      } catch {
        if (active) setProjects([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo(() => ({ projects, loading, refresh }), [projects, loading, refresh]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
