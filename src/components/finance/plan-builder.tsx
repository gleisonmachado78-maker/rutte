import { BellRing, CalendarClock, Check, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCreateTask, useDreams, useSaveDream } from '@/hooks/use-data';
import {
  BUSINESS_FROM,
  brl,
  decembersIn,
  defaultPlanConfig,
  hoursToClose,
  INFLATION,
  monthLabel,
  monthsUntil,
  PROMO_FROM,
  simulate,
  type SimResult,
} from '@/lib/finance';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { Dream, DreamPlanConfig, FinanceBudget } from '@/types';

/* ----------------------------------- Peças ----------------------------------- */

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <label htmlFor={id} className="font-medium text-foreground/60">
          {label}
        </label>
        <span className="font-semibold tabular-nums">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-6 w-full cursor-pointer accent-primary"
      />
    </div>
  );
}

function SourceRow({
  emoji,
  title,
  detail,
  on,
  onToggle,
  amount,
  disabled,
  children,
}: {
  emoji: string;
  title: string;
  detail: string;
  on: boolean;
  onToggle: (v: boolean) => void;
  amount: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <li className={cn('rounded-xl border p-3 transition-colors', on ? 'border-primary/40 bg-primary/[0.04]' : 'border-border', disabled && 'opacity-60')}>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={on} disabled={disabled} onChange={(e) => onToggle(e.target.checked)} className="mt-1 size-4 shrink-0 cursor-pointer accent-primary" />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">
            {emoji} {title}
          </span>
          <span className="block text-xs text-foreground/55">{detail}</span>
        </span>
        <span className={cn('shrink-0 text-right text-sm font-semibold tabular-nums', on ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground/40')}>{amount}</span>
      </label>
      {on && children && <div className="mt-2 grid gap-3 pl-7 sm:grid-cols-2">{children}</div>}
    </li>
  );
}

/* ---------------------------------- Gráfico ---------------------------------- */

function ProjectionChart({ sim }: { sim: SimResult }) {
  const W = 600;
  const H = 210;
  const pad = { l: 8, r: 8, t: 14, b: 26 };
  const pts = sim.series;
  const maxT = pts[pts.length - 1]?.t || 1;
  const maxY = Math.max(...pts.map((p) => Math.max(p.balance, p.target))) * 1.08 || 1;
  const x = (t: number) => pad.l + (t / maxT) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxY) * (H - pad.t - pad.b);
  const line = (key: 'balance' | 'target') => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
  const area = `${line('balance')} L${x(maxT)},${y(0)} L${x(0)},${y(0)} Z`;
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const hp = hover !== null ? pts[hover] : null;

  const onMove = (e: React.PointerEvent) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    const t = Math.round((((e.clientX - r.left) / r.width) * W - pad.l) / ((W - pad.l - pad.r) / maxT));
    setHover(Math.max(0, Math.min(pts.length - 1, t)));
  };

  return (
    <figure className="relative">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none overflow-visible"
        role="img"
        aria-label={`Projeção: guardado mês a mês contra o preço do sonho. ${sim.reachDate ? `Alcança em ${monthLabel(sim.reachDate)}.` : 'Não alcança com este plano.'}`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} className="stroke-border" strokeWidth={1} />
        <path d={area} className="fill-primary/10" />
        <path d={line('target')} fill="none" className="stroke-foreground/45" strokeWidth={2} strokeDasharray="5 5" />
        <path d={line('balance')} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinejoin="round" />
        {sim.n <= maxT && (
          <g>
            <line x1={x(sim.n)} x2={x(sim.n)} y1={pad.t} y2={y(0)} className="stroke-amber-500" strokeWidth={1.5} strokeDasharray="2 4" />
            <text x={x(sim.n)} y={pad.t - 3} textAnchor="middle" className="fill-amber-600 text-[11px] font-semibold dark:fill-amber-400">
              prazo
            </text>
          </g>
        )}
        {sim.reach !== null && sim.reach <= maxT && <circle cx={x(sim.reach)} cy={y(pts[sim.reach]?.balance ?? 0)} r={6} className="fill-emerald-500 stroke-background" strokeWidth={2.5} />}
        {hp && (
          <g>
            <line x1={x(hp.t)} x2={x(hp.t)} y1={pad.t} y2={y(0)} className="stroke-foreground/30" strokeWidth={1} />
            <circle cx={x(hp.t)} cy={y(hp.balance)} r={4.5} className="fill-primary stroke-background" strokeWidth={2} />
          </g>
        )}
        <text x={pad.l} y={H - 6} className="fill-foreground/55 text-[11px]">
          hoje
        </text>
        <text x={W - pad.r} y={H - 6} textAnchor="end" className="fill-foreground/55 text-[11px]">
          {monthLabel(pts[pts.length - 1].date)}
        </text>
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-border bg-background/95 px-2.5 py-1.5 text-xs shadow-md backdrop-blur"
          style={{ left: `${Math.min(85, Math.max(15, (x(hp.t) / W) * 100))}%` }}
        >
          <p className="font-semibold">{hp.t === 0 ? 'Hoje' : monthLabel(hp.date)}</p>
          <p className="tabular-nums">
            <span className="text-primary">●</span> Guardado {brl(hp.balance)}
          </p>
          <p className="tabular-nums text-foreground/60">┅ Preço {brl(hp.target)}</p>
        </div>
      )}
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-primary" aria-hidden /> Quanto você terá
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-foreground/45" aria-hidden /> Preço do sonho{' '}
        </span>
        {sim.reach !== null && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden /> Realiza
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/* ----------------------------------- Simulador ----------------------------------- */

const METHOD_OF: Record<keyof Omit<DreamPlanConfig, 'inflation'>, string> = {
  sobra: 'pague-se',
  cortes: 'cortar',
  consumo: 'consciente',
  vendas: 'vender',
  extra13: 'extras',
  freela: 'renda-extra',
  promocao: 'promocao',
  negocio: 'negocio',
};

export function PlanBuilder({ dream, budget, rate }: { dream: Dream; budget: FinanceBudget | null | undefined; rate: number }) {
  const { data: dreams = [] } = useDreams();
  const save = useSaveDream();
  const createTask = useCreateTask();
  const [cfg, setCfg] = useState<DreamPlanConfig>(() => dream.plan ?? defaultPlanConfig(dream, budget, dreams, rate));
  const dirty = useRef(false);

  // outro sonho aberto: carrega o plano dele
  useEffect(() => {
    dirty.current = false;
    setCfg(dream.plan ?? defaultPlanConfig(dream, budget, dreams, rate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dream.id]);

  // guarda o plano escolhido (sem sobrescrever depósitos feitos nesse meio-tempo)
  useEffect(() => {
    if (!dirty.current) return;
    const h = setTimeout(() => save.mutate({ id: dream.id, title: dream.title, target: dream.target, deadline: dream.deadline, plan: cfg }), 700);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  const update = (fn: (c: DreamPlanConfig) => DreamPlanConfig) => {
    dirty.current = true;
    setCfg(fn);
  };
  const sim = useMemo(() => simulate(dream, cfg, budget, rate), [dream, cfg, budget, rate]);
  const income = budget?.income ?? 0;
  const free = income ? Math.max(0, income - (budget?.expenses ?? 0)) : 0;
  const n = monthsUntil(dream.deadline);
  const decs = decembersIn(n);
  const diff = sim.reach !== null ? sim.n - sim.reach : null;
  const freelaMonth = cfg.freela.hours * cfg.freela.hourly * 4.33;

  const closeWithFreela = () => {
    const h = hoursToClose(dream, cfg, budget, rate);
    if (h === null) return toast.error('Nem com 40 h por semana fecha no prazo', { description: 'Ligue outros caminhos ou estique o prazo.' });
    update((c) => ({ ...c, freela: { ...c.freela, on: h > 0, hours: h } }));
    toast.success(`Renda extra ajustada para ${h} h por semana`);
  };
  const moveDeadline = () => {
    if (!sim.reachDate) return;
    save.mutate({ id: dream.id, title: dream.title, target: dream.target, deadline: sim.reachDate, plan: cfg }, { onSuccess: () => toast.success('Prazo atualizado', { description: `Até ${monthLabel(sim.reachDate!)}` }) });
  };
  const usePlan = () => {
    const ids = (Object.keys(METHOD_OF) as (keyof typeof METHOD_OF)[]).filter((k) => cfg[k].on).map((k) => METHOD_OF[k]);
    const methods = [...new Set([...dream.methods, ...ids])];
    save.mutate({ id: dream.id, title: dream.title, target: dream.target, deadline: dream.deadline, plan: cfg, methods }, { onSuccess: () => toast.success('Plano salvo no sonho', { description: 'Os passos de cada caminho estão logo abaixo.' }) });
  };
  const reminder = () => {
    createTask.mutate({
      title: `Guardar ${brl(Math.round(sim.monthlyNow))} para ${dream.emoji} ${dream.title}`,
      whatToDo: `Transferir para a conta do sonho e registrar o depósito na Rutte (Sonhos e metas).`,
      status: 'NOT_STARTED',
      priority: 'HIGH',
      dueDate: todayISO(),
      recurrenceRule: 'FREQ=MONTHLY',
      scope: 'PERSONAL',
      lifeAreaId: 'financas',
      subtasks: [],
      links: [],
    });
  };

  return (
    <section aria-labelledby="dr-builder" className="mt-6 space-y-4">
      <div>
        <h3 id="dr-builder" className="flex items-center gap-2 font-bold">
          <Sparkles className="size-4 text-primary" aria-hidden /> Monte o seu plano
        </h3>
        <p className="text-sm text-foreground/60">Ligue, desligue e ajuste cada caminho. A data e o gráfico mudam na hora.</p>
      </div>

      {/* Resultado ao vivo */}
      <div
        className={cn(
          'rounded-2xl border p-4',
          sim.reach === null ? 'border-red-500/30 bg-red-500/5' : diff !== null && diff >= 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5',
        )}
        aria-live="polite"
      >
        {sim.reachDate ? (
          <p className="text-lg font-bold leading-snug">
            Você realiza em <span className="text-primary">{monthLabel(sim.reachDate)}</span>
            <span
              className={cn(
                'ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-xs font-semibold',
                diff! > 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : diff === 0 ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
              )}
            >
              {diff! > 0 ? `${diff} ${diff === 1 ? 'mês' : 'meses'} antes do prazo` : diff === 0 ? 'no prazo' : `${-diff!} ${diff === -1 ? 'mês' : 'meses'} depois do prazo`}
            </span>
          </p>
        ) : (
          <p className="text-lg font-bold">Com este plano o sonho não chega lá</p>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-foreground/55">Entra por mês</dt>
            <dd className="font-semibold tabular-nums">
              {brl(sim.monthlyNow)}
              {sim.monthlyFull > sim.monthlyNow + 1 && <span className="block text-xs font-normal text-foreground/55">depois {brl(sim.monthlyFull)}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground/55">De uma vez (até o prazo)</dt>
            <dd className="font-semibold tabular-nums">{brl(sim.oneTimes)}</dd>
          </div>
          <div>
            <dt className="text-xs text-foreground/55">{cfg.inflation ? 'Preço no prazo (com inflação)' : 'Preço no prazo'}</dt>
            <dd className="font-semibold tabular-nums">{brl(sim.targetAtDeadline)}</dd>
          </div>
        </dl>
        {sim.gapAtDeadline > 0 && (
          <div className="mt-3 border-t border-foreground/10 pt-3">
            <p className="text-sm">
              No prazo você terá <strong className="tabular-nums">{brl(sim.balanceAtDeadline)}</strong>: faltam <strong className="tabular-nums">{brl(sim.gapAtDeadline)}</strong>.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={closeWithFreela}>
                <Zap /> Completar com renda extra
              </Button>
              {sim.reachDate && (
                <Button size="sm" variant="outline" onClick={moveDeadline}>
                  <CalendarClock /> Mudar prazo para {monthLabel(sim.reachDate)}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <ProjectionChart sim={sim} />

      {/* Fontes */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">Todo mês, do seu bolso</p>
        <ul className="space-y-2">
          <SourceRow
            emoji="🏦"
            title="Da sua sobra do mês"
            detail={income ? `Sobra hoje: ${brl(free)} (entra ${brl(income)}, sai ${brl(budget?.expenses ?? 0)})` : 'Preencha "Seu mês" para usar a sua sobra real'}
            on={cfg.sobra.on}
            onToggle={(on) => update((c) => ({ ...c, sobra: { ...c.sobra, on } }))}
            amount={`${brl(cfg.sobra.value)}/mês`}
          >
            <Slider id="pl-sobra" label="Quanto da sobra" value={cfg.sobra.value} min={0} max={Math.max(free, cfg.sobra.value, 500)} step={10} format={(v) => brl(v)} onChange={(v) => update((c) => ({ ...c, sobra: { ...c.sobra, value: v } }))} />
          </SourceRow>
          <SourceRow emoji="✂️" title="Cortar assinaturas e taxas" detail="Streaming, apps e tarifas que você não usa" on={cfg.cortes.on} onToggle={(on) => update((c) => ({ ...c, cortes: { ...c.cortes, on } }))} amount={`${brl(cfg.cortes.value)}/mês`}>
            <Slider id="pl-cortes" label="Quanto cortar" value={cfg.cortes.value} min={0} max={800} step={10} format={(v) => brl(v)} onChange={(v) => update((c) => ({ ...c, cortes: { ...c.cortes, value: v } }))} />
          </SourceRow>
          <SourceRow emoji="🛒" title="Consumo consciente" detail="Mercado com lista, marmita, regra das 48 h" on={cfg.consumo.on} onToggle={(on) => update((c) => ({ ...c, consumo: { ...c.consumo, on } }))} amount={`${brl(cfg.consumo.value)}/mês`}>
            <Slider id="pl-consumo" label="Quanto economizar" value={cfg.consumo.value} min={0} max={1500} step={10} format={(v) => brl(v)} onChange={(v) => update((c) => ({ ...c, consumo: { ...c.consumo, value: v } }))} />
          </SourceRow>
        </ul>

        <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-foreground/55">De uma vez</p>
        <ul className="space-y-2">
          <SourceRow emoji="📦" title="Vender o que não usa" detail="Entra no próximo mês" on={cfg.vendas.on} onToggle={(on) => update((c) => ({ ...c, vendas: { ...c.vendas, on } }))} amount={brl(cfg.vendas.value)}>
            <Slider id="pl-vendas" label="Quanto vender" value={cfg.vendas.value} min={0} max={10000} step={50} format={(v) => brl(v)} onChange={(v) => update((c) => ({ ...c, vendas: { ...c.vendas, value: v } }))} />
          </SourceRow>
          <SourceRow
            emoji="🎁"
            title="13º e extras de fim de ano"
            detail={decs ? `Guardado em cada dezembro: ${decs} ${decs === 1 ? 'dezembro' : 'dezembros'} até o prazo` : 'Não há dezembro antes do prazo'}
            on={cfg.extra13.on}
            onToggle={(on) => update((c) => ({ ...c, extra13: { ...c.extra13, on } }))}
            amount={`${brl(cfg.extra13.value)}${decs > 1 ? ` × ${decs}` : ''}`}
          >
            <Slider id="pl-13" label="Quanto por dezembro" value={cfg.extra13.value} min={0} max={Math.max(income * 1.5, 6000)} step={50} format={(v) => brl(v)} onChange={(v) => update((c) => ({ ...c, extra13: { ...c.extra13, value: v } }))} />
          </SourceRow>
        </ul>

        <p className="flex items-center gap-1.5 pt-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          <Zap className="size-3.5" aria-hidden /> Boost: ganhar mais
        </p>
        <ul className="space-y-2">
          <SourceRow
            emoji="🛠️"
            title="Renda extra com uma habilidade"
            detail={`${cfg.freela.hours} h por semana × ${brl(cfg.freela.hourly)} por hora`}
            on={cfg.freela.on}
            onToggle={(on) => update((c) => ({ ...c, freela: { ...c.freela, on } }))}
            amount={`${brl(freelaMonth)}/mês`}
          >
            <Slider id="pl-horas" label="Horas por semana" value={cfg.freela.hours} min={1} max={30} step={1} format={(v) => `${v} h`} onChange={(v) => update((c) => ({ ...c, freela: { ...c.freela, hours: v } }))} />
            <Slider id="pl-hora" label="Valor da hora" value={cfg.freela.hourly} min={15} max={200} step={5} format={(v) => brl(v)} onChange={(v) => update((c) => ({ ...c, freela: { ...c.freela, hourly: v } }))} />
          </SourceRow>
          <SourceRow
            emoji="📈"
            title="Promoção ou aumento"
            detail={income ? `${cfg.promocao.pct}% de ${brl(income)}, a partir do ${PROMO_FROM}º mês, todo para o sonho` : 'Preencha "Seu mês" para calcular com a sua renda'}
            on={cfg.promocao.on && !!income}
            disabled={!income}
            onToggle={(on) => update((c) => ({ ...c, promocao: { ...c.promocao, on } }))}
            amount={`${brl((income * cfg.promocao.pct) / 100)}/mês`}
          >
            <Slider id="pl-promo" label="Aumento" value={cfg.promocao.pct} min={5} max={50} step={1} format={(v) => `${v}%`} onChange={(v) => update((c) => ({ ...c, promocao: { ...c.promocao, pct: v } }))} />
          </SourceRow>
          <SourceRow
            emoji="🚀"
            title="Negócio paralelo"
            detail={`Lucro por mês, a partir do ${BUSINESS_FROM}º mês (tempo para engrenar)`}
            on={cfg.negocio.on}
            onToggle={(on) => update((c) => ({ ...c, negocio: { ...c.negocio, on } }))}
            amount={`${brl(cfg.negocio.value)}/mês`}
          >
            <Slider id="pl-negocio" label="Lucro por mês" value={cfg.negocio.value} min={200} max={10000} step={100} format={(v) => brl(v)} onChange={(v) => update((c) => ({ ...c, negocio: { ...c.negocio, value: v } }))} />
          </SourceRow>
        </ul>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted/50 p-3 text-sm">
          <input type="checkbox" checked={cfg.inflation} onChange={(e) => update((c) => ({ ...c, inflation: e.target.checked }))} className="mt-0.5 size-4 shrink-0 accent-primary" />
          <span>
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="size-4" aria-hidden /> Contar a inflação ({INFLATION.toLocaleString('pt-BR')}% ao ano)
            </span>
            <span className="text-xs text-foreground/55">
              O preço do sonho sobe com o tempo. O dinheiro guardado rende {rate.toLocaleString('pt-BR')}% ao mês (ajuste em "Seu mês").
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={usePlan}>
          <Check /> Usar este plano
        </Button>
        <Button variant="outline" onClick={reminder} disabled={sim.monthlyNow <= 0}>
          <BellRing /> Lembrete mensal de guardar
        </Button>
      </div>
      <p className="text-xs text-foreground/50">Estimativas para planejar. O plano fica salvo neste sonho.</p>
    </section>
  );
}
