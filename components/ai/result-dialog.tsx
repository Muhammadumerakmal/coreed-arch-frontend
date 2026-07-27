"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Renders an AI analysis result: the summary prominently, then the full JSON payload. */
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
  const summary = data && typeof data.summary === "string" ? (data.summary as string) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {summary && <p className="text-sm leading-relaxed">{summary}</p>}
        <div className="max-h-[50vh] overflow-auto rounded-lg border border-border/60">
          <pre className="bg-muted/40 p-4 text-xs leading-relaxed">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
