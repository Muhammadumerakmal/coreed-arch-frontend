import Link from "next/link";
import { ListTree, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SubtasksPage() {
  return (
    <div>
      <PageHeader title="Subtasks" subtitle="Break tasks down into smaller steps." />
      <Card className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
          <ListTree className="size-6" />
        </div>
        <p className="font-medium">Subtasks live inside each task</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          Open any task from a project board to add, check off, and manage its subtasks.
        </p>
        <Button asChild className="mt-1">
          <Link href="/tasks">Go to Tasks <ArrowRight className="size-4" /></Link>
        </Button>
      </Card>
    </div>
  );
}
