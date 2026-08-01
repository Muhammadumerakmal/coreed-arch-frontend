"use client";
import * as React from "react";
import {
  ShieldAlert,
  Scale,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Target,
  ListChecks,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Dict = Record<string, unknown>;

function asArray(v: unknown): Dict[] {
  return Array.isArray(v) ? (v as Dict[]) : [];
}
function asString(v: unknown): string {
  if (typeof v === "string") return v;
  return v == null ? "" : JSON.stringify(v);
}
function fmtDate(v: unknown): string {
  if (!v) return "—";
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function severity(v: unknown): string {
  const s = String(v ?? "").toLowerCase();
  if (s === "critical") return "bg-red-500/15 text-red-600 dark:text-red-400";
  if (s === "high") return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
  if (s === "medium") return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
}
function healthTint(v: unknown): string {
  const n = Number(v) || 0;
  if (n >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (n >= 45) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

type Mode = "risks" | "timeline" | "workload" | "tasks" | "generic";

function detectMode(data: Dict): Mode {
  if (Array.isArray(data.risks)) return "risks";
  if (data.scenarios) return "timeline";
  if (data.isBalanced !== undefined || Array.isArray(data.overLoadedMembers)) return "workload";
  if (Array.isArray(data.suggestions)) {
    const first = data.suggestions[0] as Dict | undefined;
    if (first && first.action !== undefined) return "workload";
    return "tasks";
  }
  return "generic";
}

function BulletList({ items, icon }: { items: unknown; icon?: React.ReactNode }) {
  const arr = asArray(items);
  if (!arr.length) return null;
  return (
    <ul className="space-y-1.5">
      {arr.map((item, i) => (
        <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
          {icon ?? <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />}
          <span className="flex-1">{typeof item === "string" ? item : JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function Summary({ data }: { data: Dict }) {
  const summary = asString(data.summary);
  if (!summary) return null;
  return <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>;
}

function RisksView({ data }: { data: Dict }) {
  const risks = asArray(data.risks);
  const positives = asArray(data.positives);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Health score</span>
          <span className={cn("text-2xl font-bold", healthTint(data.healthScore))}>{asString(data.healthScore) || "—"}</span>
          <span className="text-muted-foreground text-xs">/ 100</span>
        </div>
        <Badge className={cn("capitalize", severity(data.overallRisk))}>Overall risk: {asString(data.overallRisk) || "—"}</Badge>
      </div>

      {risks.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold"><ShieldAlert className="size-4" /> Risks</h4>
          {risks.map((r, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{asString(r.title)}</p>
                <Badge className={cn("capitalize", severity(r.severity))}>{asString(r.severity)}</Badge>
              </div>
              {asString(r.category) && (
                <Badge variant="outline" className="mt-1 capitalize">{asString(r.category)}</Badge>
              )}
              {asString(r.description) && <p className="text-muted-foreground mt-2 text-sm">{asString(r.description)}</p>}
              {asString(r.recommendation) && (
                <p className="mt-2 flex items-start gap-1.5 text-sm"><Target className="mt-0.5 size-3.5 shrink-0 text-primary" /> {asString(r.recommendation)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {positives.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold"><CheckCircle2 className="size-4 text-emerald-500" /> What&apos;s going well</h4>
          <BulletList items={positives} icon={<CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />} />
        </div>
      )}
    </div>
  );
}

function TimelineView({ data }: { data: Dict }) {
  const scenarios = (data.scenarios as Dict) || {};
  const bottlenecks = asArray(data.bottlenecks);
  const recommendations = asArray(data.recommendations);
  const conf = Number(data.confidence);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 p-4">
          <p className="text-muted-foreground text-xs">Predicted completion</p>
          <p className="mt-1 text-lg font-bold">{fmtDate(data.predictedCompletionDate)}</p>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <p className="text-muted-foreground text-xs">Days remaining</p>
          <p className="mt-1 text-lg font-bold">{asString(data.estimatedDaysRemaining)}</p>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Scenarios</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(["optimistic", "realistic", "pessimistic"] as const).map((key) => (
            <div key={key} className="rounded-xl border border-border/60 p-3">
              <p className="text-muted-foreground text-[11px] capitalize">{key}</p>
              <p className="mt-0.5 text-sm font-semibold">{fmtDate(scenarios[key])}</p>
            </div>
          ))}
        </div>
      </div>

      {!isNaN(conf) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <div className="bg-muted h-2 w-32 overflow-hidden rounded-full">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round(conf * 100)}%` }} />
          </div>
          <span className="font-medium">{Math.round(conf * 100)}%</span>
        </div>
      )}

      {bottlenecks.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold"><AlertTriangle className="size-4 text-amber-500" /> Bottlenecks</h4>
          <BulletList items={bottlenecks} />
        </div>
      )}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold"><Lightbulb className="size-4 text-amber-500" /> Recommendations</h4>
          <BulletList items={recommendations} />
        </div>
      )}
    </div>
  );
}

function WorkloadView({ data }: { data: Dict }) {
  const suggestions = asArray(data.suggestions);
  const loaded = asArray(data.overLoadedMembers).map(asString);
  const under = asArray(data.underLoadedMembers).map(asString);
  const balanced = Boolean(data.isBalanced);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={balanced ? "success" : "warning"} className="gap-1">
          <Scale className="size-3.5" /> {balanced ? "Balanced" : "Imbalanced"}
        </Badge>
        <span className="text-muted-foreground text-sm">Team average: <span className="font-medium text-foreground">{asString(data.teamAverage)}</span> active tasks</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loaded.length > 0 && (
          <div className="rounded-xl border border-border/60 p-3">
            <p className="text-muted-foreground mb-2 text-xs">Overloaded</p>
            <div className="flex flex-wrap gap-1.5">{loaded.map((n) => <Badge key={n} className="bg-red-500/15 text-red-600 dark:text-red-400">{n}</Badge>)}</div>
          </div>
        )}
        {under.length > 0 && (
          <div className="rounded-xl border border-border/60 p-3">
            <p className="text-muted-foreground mb-2 text-xs">Underloaded</p>
            <div className="flex flex-wrap gap-1.5">{under.map((n) => <Badge key={n} variant="outline">{n}</Badge>)}</div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold"><ListChecks className="size-4" /> Suggestions</h4>
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-3.5 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{asString(s.action)}</Badge>
                <span className="font-medium">{asString(s.task)}</span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-xs">
                {asString(s.fromMember) || "unassigned"} <ChevronRight className="inline size-3" /> {asString(s.toMember) || "unassigned"}
              </p>
              {asString(s.reasoning) && <p className="text-muted-foreground mt-1.5">{asString(s.reasoning)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TasksView({ data }: { data: Dict }) {
  const suggestions = asArray(data.suggestions);
  const conf = Number(data.confidence);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground">Estimated total: <span className="font-medium text-foreground">{asString(data.estimatedTotalTime) || "—"}</span></span>
        {!isNaN(conf) && <span className="text-muted-foreground">Confidence: <span className="font-medium text-foreground">{Math.round(conf * 100)}%</span></span>}
      </div>

      <div className="space-y-2.5">
        {suggestions.map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md text-xs font-bold">{i + 1}</span>
              <p className="flex-1 text-sm font-semibold">{asString(s.title)}</p>
              {asString(s.priority) && <Badge className={cn("capitalize", severity(s.priority))}>{asString(s.priority)}</Badge>}
            </div>
            {asString(s.description) && <p className="text-muted-foreground mt-1.5 text-sm">{asString(s.description)}</p>}
            {Number(s.estimatedHours) > 0 && <p className="text-muted-foreground mt-1 text-xs">{asString(s.estimatedHours)}h estimated</p>}
            {asArray(s.suggestedTags).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">{asArray(s.suggestedTags).map((t, j) => <Badge key={j} variant="secondary">{asString(t)}</Badge>)}</div>
            )}
            {asArray(s.subtasks).length > 0 && (
              <div className="mt-2">
                <p className="text-muted-foreground mb-1 text-xs">Subtasks</p>
                <BulletList items={s.subtasks} />
              </div>
            )}
            {asArray(s.dependencies).length > 0 && (
              <p className="text-muted-foreground mt-2 text-xs">Depends on: {asArray(s.dependencies).map(asString).join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericView({ data }: { data: Dict }) {
  return (
    <div className="space-y-1.5">
      {Object.entries(data)
        .filter(([k]) => k !== "metaData")
        .map(([k, v]) => (
          <div key={k} className="flex gap-3 text-sm">
            <span className="text-muted-foreground w-32 shrink-0 truncate capitalize">{k}</span>
            <span className="min-w-0 flex-1">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
    </div>
  );
}

export function ResultDialog({
  open,
  onOpenChange,
  title,
  data,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  data: Record<string, unknown> | null;
}) {
  const [showRaw, setShowRaw] = React.useState(false);

  const mode = data ? detectMode(data) : "generic";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {data && <Summary data={data} />}
          {data && mode === "risks" && <RisksView data={data} />}
          {data && mode === "timeline" && <TimelineView data={data} />}
          {data && mode === "workload" && <WorkloadView data={data} />}
          {data && mode === "tasks" && <TasksView data={data} />}
          {data && mode === "generic" && <GenericView data={data} />}
          {!data && <p className="text-muted-foreground text-sm">No result yet.</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="ghost" size="sm" onClick={() => setShowRaw((s) => !s)}>
            {showRaw ? "Hide JSON" : "View JSON"}
          </Button>
        </div>

        {showRaw && data && (
          <pre className="bg-muted/40 max-h-40 overflow-auto rounded-lg border border-border/60 p-3 text-[11px] leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
}
