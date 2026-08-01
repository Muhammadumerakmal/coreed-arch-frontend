"use client";
import { MoreVertical, CalendarClock } from "lucide-react";
import type { Task, ProjectMember } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PRIORITY_VARIANT, relativeDue, initials } from "@/lib/format";
import { motion } from "motion/react";
import type { TaskStatus } from "@/lib/types";

const STATUSES: TaskStatus[] = ["to-do", "in-progress", "done"];
const LABEL: Record<TaskStatus, string> = { "to-do": "To Do", "in-progress": "In Progress", done: "Done" };

export function TaskCard({
  task,
  members,
  onOpen,
  onMove,
}: {
  task: Task;
  members: ProjectMember[];
  onOpen: () => void;
  onMove: (status: TaskStatus) => void;
}) {
  const assigneeId = typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;
  const assignee = members.find((m) => m.user._id === assigneeId)?.user;
  const due = task.dueDate ? relativeDue(task.dueDate) : null;
  const subPct = task.subtaskCount ? Math.round(((task.completedSubtaskCount ?? 0) / task.subtaskCount) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="bg-card hover:border-primary/40 cursor-pointer rounded-lg border border-border/60 p-3 shadow-sm transition-colors"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-accent -mr-1 rounded p-1 outline-none"><MoreVertical className="size-4" /></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUSES.filter((s) => s !== task.status).map((s) => (
                <DropdownMenuItem key={s} onClick={() => onMove(s)}>{LABEL[s]}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="mt-2 text-sm font-medium leading-snug">{task.title}</p>

      <div className="mt-3 flex items-center justify-between">
        {due ? (
          <span className={`flex items-center gap-1 text-xs ${due.overdue ? "text-red-500" : "text-muted-foreground"}`}>
            <CalendarClock className="size-3.5" /> {due.label}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">No due date</span>
        )}
        {assignee && (
          <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full text-[10px] font-semibold" title={assignee.fullName || assignee.username}>
            {initials(assignee.fullName || assignee.username)}
          </span>
        )}
      </div>

      {task.subtaskCount ? (
        <div className="mt-2.5">
          <div className="text-muted-foreground flex items-center justify-between text-[11px]">
            <span>{task.completedSubtaskCount ?? 0}/{task.subtaskCount} subtasks</span>
            <span>{subPct}%</span>
          </div>
          <div className="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${subPct}%` }} />
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
