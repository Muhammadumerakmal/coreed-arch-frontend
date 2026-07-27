import { Construction } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="border-border/60 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-24 text-center">
        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
          <Construction className="text-muted-foreground size-6" />
        </div>
        <p className="font-medium">Coming soon</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          This section is part of the next build iteration.
        </p>
      </div>
    </div>
  );
}
