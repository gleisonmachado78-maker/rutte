import { BarChart3, ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { reportToText, type Report, type ReportChart } from '@/lib/reports';
import { cn } from '@/lib/utils';

const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function BarChart({ c }: { c: ReportChart }) {
  const max = c.max ?? Math.max(1, ...c.points.map((p) => p.value));
  // com muitas barras, mostra só alguns rótulos para não embolar
  const every = Math.ceil(c.points.length / 8);
  const h = (v: number) => (v ? Math.max(3, (v / max) * 88) : 0);
  return (
    <div className="flex h-36 items-stretch gap-1.5" role="img" aria-label={`${c.title}: ${c.points.map((p) => `${p.label} ${fmt(p.value)}`).join(', ')}`}>
      {c.points.map((p, i) => (
        <div key={i} className="group flex min-w-0 flex-1 flex-col items-center gap-1" title={`${p.label}: ${fmt(p.value)}${c.unit ? ' ' + c.unit : ''}`}>
          <div className="relative w-full flex-1">
            <div className="absolute inset-x-0 bottom-0 rounded-t-[4px] bg-primary/80 transition-colors group-hover:bg-primary" style={{ height: `${h(p.value)}%` }} />
            {p.value > 0 && c.points.length <= 12 && (
              <span className="absolute inset-x-0 text-center text-[10px] font-semibold tabular-nums text-foreground/70" style={{ bottom: `calc(${h(p.value)}% + 2px)` }}>
                {fmt(p.value)}
              </span>
            )}
          </div>
          <span className={cn('h-3 w-full text-center text-[10px] leading-3 text-foreground/55', every > 1 ? 'overflow-visible whitespace-nowrap' : 'truncate')}>{i % every === 0 ? p.label : ''}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ c }: { c: ReportChart }) {
  const vals = c.points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const W = 300;
  const H = 110;
  const pad = 8;
  const x = (i: number) => pad + (i * (W - 2 * pad)) / Math.max(1, c.points.length - 1);
  const y = (v: number) => H - pad - ((v - min) / span) * (H - 2 * pad);
  const pts = c.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  return (
    <div role="img" aria-label={`${c.title}: ${c.points.map((p) => `${p.label} ${fmt(p.value)}`).join(', ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full overflow-visible">
        <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} className="stroke-border" strokeWidth={1} />
        <polyline points={pts} fill="none" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {c.points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.value)} r={4} className="fill-primary stroke-card" strokeWidth={2}>
              <title>{`${p.label}: ${fmt(p.value)}${c.unit ? ' ' + c.unit : ''}`}</title>
            </circle>
          </g>
        ))}
        <text x={pad} y={10} className="fill-foreground/60 text-[10px]">
          {fmt(max)}
          {c.unit ? ` ${c.unit}` : ''}
        </text>
        <text x={pad} y={H - pad - 4} className="fill-foreground/60 text-[10px]">
          {fmt(min)}
        </text>
      </svg>
      <div className="flex justify-between text-[10px] text-foreground/55">
        <span>{c.points[0]?.label}</span>
        <span>{c.points.at(-1)?.label}</span>
      </div>
    </div>
  );
}

/** Cartão de relatório (indicadores + gráficos) mostrado na conversa. */
export function ReportCard({ report, analysis }: { report: Report; analysis?: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportToText(report, analysis));
      toast.success('Relatório copiado', { description: 'Cole no WhatsApp, e-mail ou onde quiser.' });
    } catch {
      toast('Não foi possível copiar');
    }
  };
  return (
    <section className="w-full max-w-[640px] rounded-2xl border border-border bg-background p-3.5 sm:p-4" aria-label={report.title}>
      <header className="flex flex-wrap items-start gap-2">
        <BarChart3 className="mt-0.5 size-5 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold leading-tight">{report.title}</h3>
          <p className="text-xs text-foreground/55">{report.period}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={copy}>
          <ClipboardCopy /> Copiar
        </Button>
      </header>

      {report.kpis.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {report.kpis.map((k) => (
            <div key={k.label} className="rounded-xl bg-muted/60 p-2.5">
              <dt className="text-[11px] font-medium text-foreground/60">{k.label}</dt>
              <dd className="text-xl font-bold tabular-nums">{k.value}</dd>
              {k.hint && <dd className="text-[10px] leading-tight text-foreground/50">{k.hint}</dd>}
            </div>
          ))}
        </dl>
      )}

      {report.charts.length > 0 && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {report.charts.map((c) => (
            <figure key={c.title} className="min-w-0 rounded-xl border border-border p-2.5">
              <figcaption className="mb-1.5 text-xs font-semibold">
                {c.title}
                {c.unit ? <span className="font-normal text-foreground/50"> ({c.unit})</span> : null}
              </figcaption>
              {c.points.every((p) => !p.value) ? (
                <p className="grid h-36 place-items-center text-xs text-foreground/50">Sem registros no período</p>
              ) : c.kind === 'line' ? (
                <LineChart c={c} />
              ) : (
                <BarChart c={c} />
              )}
            </figure>
          ))}
        </div>
      )}
      <p className="mt-2 text-right text-[10px] text-foreground/45">Calculado no seu aparelho · {report.generatedAt}</p>
    </section>
  );
}
