import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tint,
  color,
  series,
  caption,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tint: string; // bg tint class for the icon chip
  color: string; // sparkline color (CSS color)
  series: number[];
  caption?: string;
}) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 380, damping: 24 }}>
      <Card className="gap-0 p-5">
        <div className="flex items-start justify-between">
          <div className={cn("flex size-11 items-center justify-center rounded-xl", tint)}>
            <Icon className="size-5" />
          </div>
          <div className="h-8 w-24">
            <Sparkline data={series} color={color} className="h-full w-full" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {caption && <p className="text-muted-foreground mt-1 text-xs">{caption}</p>}
        </div>
      </Card>
    </motion.div>
  );
}
