"use client";
import * as React from "react";
import { projects as projectsApi } from "@/lib/api";
import type { MyProject } from "@/lib/types";

/** Loads the current user's projects once, for selectors on Members / Notes / AI pages. */
export function useMyProjects() {
  const [projects, setProjects] = React.useState<MyProject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    projectsApi
      .list()
      .then((d) => active && setProjects(d.projects))
      .catch(() => active && setProjects([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return { projects, loading };
}
