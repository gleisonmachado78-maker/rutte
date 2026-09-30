import { Table2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Point {
  label: string;
  value: number;
}

const PAD = { top: 22, right: 36, bottom: 28, left: 52 };

/** Passo "redondo" (1, 2, 2.5, 5 × 10^n) para ~3 intervalos. */
function niceStep(range: number) {
  const raw = Math.max(range, 1e-9) / 3;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / exp;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * exp;
}

function scale(points: Point[], zeroBased: boolean, W: number, H: number) {
  const values = points.map((p) => p.value);
  const hi = Math.max(...values, 1);
  const lo = zeroBased ? 0 : Math.min(...values);
  const step = niceStep((hi - lo) || hi * 0.2);
  const minV = zeroBased ? 0 : Math.max(0, Math.floor(lo / step) * step - (lo % step === 0 ? step : 0));
  const maxV = Math.ceil((hi * 1.001) / step) * step + (hi % step === 0 ? step : 0);
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.top + ih - ((v - minV) / (maxV - minV || 1)) * ih;
  const ticks: number[] = [];
  for (let t = minV; t <= maxV + step / 2; t += step) ticks.push(t);
  return { x, y, ticks, iw, ih };
}

function Frame({
  title,
  subtitle,
  table,
  format,
  children,
  points,
}: {
  title: string;
  subtitle?: string;
  table: boolean;
  format: (v: number) => string;
  children: ReactNode;
  points: Point[];
}) {
  const [showTable, setShowTable] = useState(table);
  return (
    <figure className="rounded-xl border border-border bg-card p-4">
      <figcaption className="mb-2 flex items-start justify-between gap-2">
        <span>
          <span className="block font-semibold">{title}</span>
          {subtitle && <span className="block text-xs text-foreground/60">{subtitle}</span>}
        </span>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-pressed={showTable}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-foreground/60 hover:bg-muted hover:text-foreground"
        >
          <Table2 className="size-3.5" aria-hidden /> {showTable ? 'Gráfico' : 'Tabela'}
        </button>
      </figcaption>
      {points.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground/50">Sem dados ainda — registre seus treinos.</p>
      ) : showTable ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-foreground/60">
              <th className="py-1 font-medium">Mês</th>
              <th className="py-1 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label} className="border-t border-border">
                <td className="py-1.5 capitalize">{p.label}</td>
                <td className="py-1.5 text-right tabular-nums">{format(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        children
      )}
    </figure>
  );
}

function Tooltip({ left, top, label, value, W, H }: { left: number; top: number; label: string; value: string; W: number; H: number }) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-lg"
      style={{ left: `${(left / W) * 100}%`, top: `${(top / H) * 100}%`, marginTop: -10 }}
    >
      <span className="block capitalize text-foreground/60">{label}</span>
      <span className="block font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function Axes({ ticks, y, format, points, x, W, H }: { ticks: number[]; y: (v: number) => number; format: (v: number) => string; points: Point[]; x: (i: number) => number; W: number; H: number }) {
  const every = Math.ceil(points.length / 6);
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
          <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="central" className="fill-foreground/50 text-[11px] tabular-nums">
            {format(t)}
          </text>
        </g>
      ))}
      {points.map((p, i) =>
        i % every === 0 || i === points.length - 1 ? (
          <text key={p.label} x={x(i)} y={H - 8} textAnchor="middle" className="fill-foreground/50 text-[11px] capitalize">
            {p.label}
          </text>
        ) : null,
      )}
    </>
  );
}

/** Linha (evolução ao longo dos meses) com crosshair + tooltip. Série única: sem legenda. */
export function LineChart({
  points,
  title,
  subtitle,
  format,
  highlightMax = true,
}: {
  points: Point[];
  title: string;
  subtitle?: string;
  format: (v: number) => string;
  highlightMax?: boolean;
}) {
  const W = 640;
  const H = 240;
  const { x, y, ticks } = scale(points, false, W, H);
  const [hover, setHover] = useState<number | null>(null);
  const maxIdx = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.value)}`).join(' ');

  return (
    <Frame title={title} subtitle={subtitle} table={false} format={format} points={points}>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title}>
          <Axes ticks={ticks} y={y} format={format} points={points} x={x} W={W} H={H} />
          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={H - PAD.bottom} className="stroke-foreground/30" strokeWidth={1} strokeDasharray="3 3" />
          )}
          <path d={path} fill="none" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle
              key={p.label}
              cx={x(i)}
              cy={y(p.value)}
              r={hover === i ? 6 : 4}
              className="fill-primary stroke-card"
              strokeWidth={2}
            />
          ))}
          {highlightMax && points.length > 1 && (
            <text x={x(maxIdx)} y={y(points[maxIdx].value) - 12} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
              {format(points[maxIdx].value)}
            </text>
          )}
          {/* Alvos de hover maiores que as marcas */}
          {points.map((p, i) => (
            <rect
              key={`hit-${p.label}`}
              x={x(i) - (W / Math.max(points.length, 1)) / 2}
              y={0}
              width={W / Math.max(points.length, 1)}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onTouchStart={() => setHover(i)}
            />
          ))}
        </svg>
        {hover !== null && <Tooltip left={x(hover)} top={y(points[hover].value)} label={points[hover].label} value={format(points[hover].value)} W={W} H={H} />}
      </div>
    </Frame>
  );
}

/** Barras verticais ancoradas na base, topo arredondado, com tooltip por barra. */
export function BarChart({
  points,
  title,
  subtitle,
  format,
}: {
  points: Point[];
  title: string;
  subtitle?: string;
  format: (v: number) => string;
}) {
  const W = 380;
  const H = 240;
  const { y, ticks, iw } = scale(points, true, W, H);
  const [hover, setHover] = useState<number | null>(null);
  const slot = iw / Math.max(points.length, 1);
  const bw = Math.min(40, slot - 8);
  const cx = (i: number) => PAD.left + slot * i + slot / 2;
  const base = y(0);

  return (
    <Frame title={title} subtitle={subtitle} table={false} format={format} points={points}>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title}>
          <Axes ticks={ticks} y={y} format={format} points={points} x={cx} W={W} H={H} />
          {points.map((p, i) => {
            const top = y(p.value);
            const h = Math.max(0, base - top);
            const r = Math.min(4, h);
            const x0 = cx(i) - bw / 2;
            // Topo arredondado (4px), base reta
            const d = `M ${x0} ${base} L ${x0} ${top + r} Q ${x0} ${top} ${x0 + r} ${top} L ${x0 + bw - r} ${top} Q ${x0 + bw} ${top} ${x0 + bw} ${top + r} L ${x0 + bw} ${base} Z`;
            return (
              <path
                key={p.label}
                d={d}
                className={cn('fill-primary transition-opacity duration-150', hover !== null && hover !== i && 'opacity-50')}
              />
            );
          })}
          {points.map((p, i) => (
            <rect
              key={`hit-${p.label}`}
              x={PAD.left + slot * i}
              y={0}
              width={slot}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onTouchStart={() => setHover(i)}
            />
          ))}
        </svg>
        {hover !== null && <Tooltip left={cx(hover)} top={y(points[hover].value)} label={points[hover].label} value={format(points[hover].value)} W={W} H={H} />}
      </div>
    </Frame>
  );
}
