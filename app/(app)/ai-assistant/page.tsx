"use client";
import * as React from "react";
import { Sparkles, Send, Loader2, ShieldAlert, CalendarClock, Scale, Lightbulb } from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useMyProjects } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectSelect } from "@/components/common/project-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultDialog } from "@/components/ai/result-dialog";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export default function AIAssistantPage() {
  const { projects } = useMyProjects();
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ title: string; data: Record<string, unknown> } | null>(null);
  const [suggestCtx, setSuggestCtx] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    const history = messages;
    setMessages((p) => [...p, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    try {
      const { reply } = await ai.chat({ message: text, history, projectId: selected || undefined });
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((p) => [...p, { role: "assistant", content: `⚠️ ${err instanceof ApiError ? err.message : "Something went wrong."}` }]);
    } finally {
      setSending(false);
    }
  }

  async function runAction(title: string, fn: () => Promise<Record<string, unknown>>) {
    if (!selected) { toast("Select a project first", "info"); return; }
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
    { title: "Analyze Risks", icon: ShieldAlert, run: () => ai.analyzeRisks(selected) },
    { title: "Predict Timeline", icon: CalendarClock, run: () => ai.predictTimeline(selected) },
    { title: "Balance Workload", icon: Scale, run: () => ai.balanceWorkload(selected) },
  ];

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        subtitle="Chat with your project assistant and run AI analyses."
        action={<div className="w-56"><ProjectSelect projects={projects} value={selected} onChange={setSelected} placeholder="Ground in a project (optional)" className="w-full" /></div>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <Card className="flex h-[70vh] flex-col gap-0 p-0 lg:col-span-2">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full"><Sparkles className="size-6" /></div>
                <p className="font-medium text-foreground">How can I help?</p>
                <p className="max-w-xs text-sm">Ask about planning, breaking down work, or — with a project selected — your project&apos;s status.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full"><Sparkles className="size-4" /></div>}
                <div className={cn("max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>{m.content}</div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full"><Sparkles className="size-4" /></div>
                <div className="bg-muted flex items-center gap-1 rounded-2xl px-4 py-3"><span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" /><span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:0.15s]" /><span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:0.3s]" /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-border/60 p-3">
            <Input placeholder="Ask the assistant..." value={input} onChange={(e) => setInput(e.target.value)} disabled={sending} />
            <Button type="submit" size="icon" disabled={sending || !input.trim()}>{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button>
          </form>
        </Card>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-1 font-semibold">Project Analysis</h3>
            <p className="text-muted-foreground mb-4 text-xs">{selected ? "Run an AI analysis on the selected project." : "Select a project above to enable these."}</p>
            <div className="space-y-2">
              {actions.map((a) => (
                <Button key={a.title} variant="outline" className="w-full justify-start" disabled={!selected || actionLoading !== null} onClick={() => runAction(a.title, a.run)}>
                  {actionLoading === a.title ? <Loader2 className="size-4 animate-spin" /> : <a.icon className="size-4" />} {a.title}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-1 flex items-center gap-1.5 font-semibold"><Lightbulb className="size-4" /> Suggest Tasks</h3>
            <p className="text-muted-foreground mb-3 text-xs">Describe what you want to build and get task ideas.</p>
            <Input placeholder="e.g. a checkout flow" value={suggestCtx} onChange={(e) => setSuggestCtx(e.target.value)} className="mb-2" />
            <Button className="w-full" disabled={!selected || !suggestCtx.trim() || actionLoading !== null} onClick={() => runAction("Suggested Tasks", () => ai.suggestTasks(selected, { context: suggestCtx.trim() }))}>
              {actionLoading === "Suggested Tasks" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Generate
            </Button>
          </Card>
        </div>
      </div>

      <ResultDialog open={Boolean(result)} onOpenChange={(o) => !o && setResult(null)} title={result?.title ?? ""} data={result?.data ?? null} />
    </div>
  );
}
