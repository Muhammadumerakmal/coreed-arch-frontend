"use client";
import * as React from "react";
import {
  Sparkles,
  Send,
  Loader2,
  ShieldAlert,
  CalendarClock,
  Scale,
  Lightbulb,
  Copy,
  Check,
  Trash2,
  ChevronRight,
  X,
} from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useMyProjects } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectSelect } from "@/components/common/project-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ResultDialog } from "@/components/ai/result-dialog";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What's the current status of my project?",
  "What are the biggest risks right now?",
  "Suggest a plan to ship an MVP",
  "How can I balance my team's workload?",
];

export default function AIAssistantPage() {
  const { projects } = useMyProjects();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ title: string; data: Record<string, unknown> } | null>(null);
  const [suggestCtx, setSuggestCtx] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  const grounded = projects.find((p) => p.project._id === selected)?.project;

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function submit(text: string) {
    const t = text.trim();
    if (!t || sending) return;
    const history = messages;
    setMessages((p) => [...p, { role: "user", content: t }]);
    setInput("");
    setSending(true);
    try {
      const { reply } = await ai.chat({ message: t, history, projectId: selected || undefined });
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((p) => [...p, { role: "assistant", content: `⚠️ ${err instanceof ApiError ? err.message : "Something went wrong."}` }]);
    } finally {
      setSending(false);
    }
  }

  function onComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit(input);
    }
  }

  async function copyMessage(m: Msg, i: number) {
    try {
      await navigator.clipboard.writeText(m.content);
      setCopiedId(i);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function runAction(title: string, fn: () => Promise<Record<string, unknown>>) {
    if (!selected) {
      toast("Select a project first", "info");
      return;
    }
    setActionLoading(title);
    try {
      const data = await fn();
      setResult({ title, data });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "AI request failed", "error");
    } finally {
      setActionLoading(null);
    }
  }

  const actions = [
    { title: "Analyze Risks", icon: ShieldAlert, tint: "bg-red-500/10 text-red-600 dark:text-red-400", run: () => ai.analyzeRisks(selected) },
    { title: "Predict Timeline", icon: CalendarClock, tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400", run: () => ai.predictTimeline(selected) },
    { title: "Balance Workload", icon: Scale, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400", run: () => ai.balanceWorkload(selected) },
  ];

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        subtitle="Chat with your project assistant and run AI analyses."
        action={
          <div className="w-56">
            <ProjectSelect projects={projects} value={selected} onChange={setSelected} placeholder="Ground in a project (optional)" className="w-full" />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <Card className="flex h-[70vh] flex-col gap-0 overflow-hidden p-0 lg:col-span-2">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3.5">
            <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-md shadow-indigo-500/20">
              <Sparkles className="size-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">AI Assistant</p>
              <p className="text-muted-foreground truncate text-xs">
                {grounded ? `Grounded in “${grounded.name}”` : "General conversation — select a project to ground answers"}
              </p>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <span className="bg-emerald-500 size-1.5 rounded-full" /> Online
            </Badge>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
                aria-label="Clear conversation"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-14 items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/25">
                  <Sparkles className="size-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold">How can I help?</p>
                  <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                    Ask about planning, breaking down work, or — with a project selected — your project&apos;s status and risks.
                  </p>
                </div>
                <div className="flex max-w-md flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => void submit(s)}
                      disabled={sending}
                      className="hover:bg-accent hover:text-accent-foreground rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn("group flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "assistant" && (
                  <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm">
                    <Sparkles className="size-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "relative max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-muted",
                  )}
                >
                  {m.content}
                  {m.role === "assistant" && (
                    <button
                      onClick={() => void copyMessage(m, i)}
                      className="text-muted-foreground hover:text-foreground absolute -right-8 top-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Copy message"
                    >
                      {copiedId === i ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-8 shrink-0 items-center justify-center rounded-full">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div className="bg-muted flex items-center gap-1 rounded-2xl px-4 py-3">
                  <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" />
                  <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:0.15s]" />
                  <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-border/60 p-3">
            {grounded && (
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="size-3" /> Grounding: {grounded.name}
                  <button onClick={() => setSelected("")} className="text-muted-foreground hover:text-foreground" aria-label="Clear grounding">
                    <X className="size-3" />
                  </button>
                </Badge>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit(input);
              }}
              className="flex items-end gap-2"
            >
              <Textarea
                placeholder="Ask your project assistant…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onComposerKeyDown}
                disabled={sending}
                rows={1}
                className="max-h-32 min-h-11 flex-1 resize-none"
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={sending || !input.trim()}>
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
            <p className="text-muted-foreground mt-1.5 px-1 text-[11px]">Enter to send · Shift + Enter for a new line</p>
          </div>
        </Card>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-8 items-center justify-center rounded-lg">
                <Lightbulb className="size-4 text-white" />
              </div>
              <h3 className="font-semibold">Project Analysis</h3>
            </div>
            <p className="text-muted-foreground mb-4 text-xs">{selected ? "Run an AI analysis on the selected project." : "Select a project above to enable these."}</p>
            <div className="space-y-2">
              {actions.map((a) => (
                <button
                  key={a.title}
                  disabled={!selected || actionLoading !== null}
                  onClick={() => runAction(a.title, a.run)}
                  className="hover:bg-accent group flex w-full items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", a.tint)}>
                    {actionLoading === a.title ? <Loader2 className="size-4 animate-spin" /> : <a.icon className="size-4" />}
                  </div>
                  <span className="flex-1 font-medium">{a.title}</span>
                  <ChevronRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex size-8 items-center justify-center rounded-lg">
                <Sparkles className="size-4 text-white" />
              </div>
              <h3 className="font-semibold">Suggest Tasks</h3>
            </div>
            <p className="text-muted-foreground mb-3 text-xs">Describe what you want to build and get task ideas.</p>
            <Textarea
              placeholder="e.g. a checkout flow"
              value={suggestCtx}
              onChange={(e) => setSuggestCtx(e.target.value)}
              rows={2}
              className="mb-2 resize-none"
            />
            <Button
              className="w-full"
              disabled={!selected || !suggestCtx.trim() || actionLoading !== null}
              onClick={() => runAction("Suggested Tasks", () => ai.suggestTasks(selected, { context: suggestCtx.trim() }))}
            >
              {actionLoading === "Suggested Tasks" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Generate
            </Button>
          </Card>
        </div>
      </div>

      <ResultDialog open={Boolean(result)} onOpenChange={(o) => !o && setResult(null)} title={result?.title ?? ""} data={result?.data ?? null} />
    </div>
  );
}
