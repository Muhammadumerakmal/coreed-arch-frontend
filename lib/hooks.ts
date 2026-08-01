"use client";
import { useProjects } from "@/components/providers/projects-provider";

/** Reads the shared, cached project list (loaded once per app-shell mount). */
export function useMyProjects() {
  const { projects, loading } = useProjects();
  return { projects, loading };
}
