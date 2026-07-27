// Donut chart via stroked circle segments. Identity is carried by the legend labels
// (rendered by the caller), never color alone. Each segment has a native <title> tooltip.

export type DonutSegment = { label: string; value: number; color: string };

export function Donut({
  segments,
  size = 200,
  thickness = 24,
  centerLabel,
  centerSub,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel: string | number;
  centerSub?: string;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  const gap = total > 0 ? 2 : 0; // 2px surface gap between segments

  let offset = 0;
  const arcs =
    total === 0
      ? []
      : segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const len = (s.value / total) * c;
            const dash = Math.max(len - gap, 0.001);
            const el = { ...s, dash, gap: c - dash, dashoffset: -offset };
            offset += len;
            return el;
          });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={thickness} />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={thickness}
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={a.dashoffset}
            strokeLinecap="round"
          >
            <title>{`${a.label}: ${a.value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{centerLabel}</span>
        {centerSub && <span className="text-muted-foreground text-xs">{centerSub}</span>}
      </div>
    </div>
  );
}
