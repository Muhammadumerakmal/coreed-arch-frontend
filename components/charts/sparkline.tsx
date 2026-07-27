// Decorative sparkline built from REAL per-project values (no fabricated trends).
// Renders a 2px line with a soft area fill and a rounded end-dot.

export function Sparkline({
  data,
  color = "var(--chart-1)",
  className,
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  const W = 100;
  const H = 32;
  const pad = 3;
  const series = data.length >= 2 ? data : [data[0] ?? 0, data[0] ?? 0];
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const step = (W - pad * 2) / (series.length - 1);

  const pts = series.map((v, i) => {
    const x = pad + i * step;
    const y = H - pad - ((v - min) / span) * (H - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`;
  const [ex, ey] = pts[pts.length - 1];
  const gid = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={ex} cy={ey} r={2.4} fill={color} />
    </svg>
  );
}
