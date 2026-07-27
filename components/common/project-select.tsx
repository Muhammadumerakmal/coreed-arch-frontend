"use client";
import type { MyProject } from "@/lib/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function ProjectSelect({
  projects,
  value,
  onChange,
  placeholder = "Select a project",
  className = "w-64",
}: {
  projects: MyProject[];
  value?: string;
  onChange: (projectId: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {projects.map((mp) => (
          <SelectItem key={mp.project._id} value={mp.project._id}>
            {mp.project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
