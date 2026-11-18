import { BellRing, Info, CalendarClock, Check, Gift, Landmark, Package, Rocket, Scissors, ShoppingCart, TrendingUp, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/form-controls';
import { useCreateTask, useDreams, useSaveDream } from '@/hooks/use-data';
import { BUSINESS_FROM, brl, decembersIn, defaultPlanConfig, hoursToClose, INFLATION, monthLabel, monthsUntil, PROMO_FROM, simulate, type SimResult } from '@/lib/finance';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { Dream, DreamPlanConfig, FinanceBudget } from '@/types';

/* ----------------------------------- Peças ----------------------------------- */

function Slider({ id, label, value, min, max, step, format, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; format: (n: number) => string; onChange: (n: number) => void }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <label htmlFor={id} className="text-foreground/55">
          {label}
        </label>
        <span className="font-semibold tabular-nums text-foreground/80">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full cursor-pointer accent-primary" />
    </div>
  );
}

function Row({ id, icon: Icon, title, detail, on, onToggle, amount, disabled, children }: { id: string; icon: LucideIcon; title: string; detail: string; on: boolean; onToggle: (v: boolean) => void; amount: string; disabled?: boolean; children?: React.ReactNode }) {
  return (
    <li className={cn('px-4 py-3', disabled && 'opacity-55')}>
      <div className="flex items-center gap-3">
        <Checkbox id={id} checked={on} disabled={disabled} onCheckedChange={(v) => onToggle(v === true)} aria-label={title} />
        <Icon className={cn('size-4 shrink-0', on ? 'text-primary dark:text-neon' : 'text-foreground/40')} aria-hidden />
        <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
          <span className={cn('block text-sm font-medium', !on && 'text-foreground/70')}>{title}</span>
          <span className="block text-xs text-foreground/50">{detail}</span>
        </label>
        <span className={cn('shrink-0 text-right text-sm font-semibold tabular-nums', on ? 'text-foreground' : 'text-foreground/35')}>{amount}</span>
      </div>
      {on && children && <div className="mt-2 grid gap-3 pl-[3.25rem] sm:grid-cols-2">{children}</div>}
    </li>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="border-b border-border bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-foreground/55">{title}</p>
      <ul className="divide-y divide-border">{children}</ul>
    </div>
  );
}

/* ---------------------------------- Gráfico ---------------------------------- */

function ProjectionChart({ sim }: { sim: SimResult }) {
  const W = 600;
  const H = 190;
  const pad = { l: 6, r: 6, t: 16, b: 22 };
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
        aria-label={`Projeção mês a mês. ${sim.reachDate ? `Alcança em ${monthLabel(sim.reachDate)}.` : 'Não alcança com este plano.'}`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} className="stroke-border" strokeWidth={1} />
        <path d={area} className="fill-primary/10" />
        <path d={line('target')} fill="none" className="stroke-foreground/35" strokeWidth={1.5} strokeDasharray="5 5" />
        <path d={line('balance')} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinejoin="round" />
        {sim.n <= maxT && (
          <g>
            <line x1={x(sim.n)} x2={x(sim.n)} y1={pad.t} y2={y(0)} className="stroke-foreground/30" strokeWidth={1} strokeDasharray="2 4" />
            <text x={x(sim.n)} y={pad.t - 5} textAnchor="middle" className="fill-foreground/55 text-[11px] font-medium">
              prazo
            </text>
          </g>
        )}
        {sim.reach !== null && sim.reach <= maxT && <circle cx={x(sim.reach)} cy={y(pts[sim.reach]?.balance ?? 0)} r={5.5} className="fill-primary stroke-card" strokeWidth={2.5} />}
        {hp && (
          <g>
            <line x1={x(hp.t)} x2={x(hp.t)} y1={pad.t} y2={y(0)} className="stroke-foreground/25" strokeWidth={1} />
            <circle cx={x(hp.t)} cy={y(hp.balance)} r={4} className="fill-primary stroke-card" strokeWidth={2} />
          </g>
        )}
        <text x={pad.l} y={H - 5} className="fill-foreground/50 text-[11px]">
          hoje
        </text>
        <text x={W - pad.r} y={H - 5} textAnchor="end" className="fill-foreground/50 text-[11px]">
          {monthLabel(pts[pts.length - 1].date)}
        </text>
      </svg>
      {hp && (
        <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs shadow-md" style={{ left: `${Math.min(84, Math.max(16, (x(hp.t) / W) * 100))}%` }}>
          <p className="font-semibold">{hp.t === 0 ? 'Hoje' : monthLabel(hp.date)}</p>
          <p className="tabular-nums">Guardado {brl(hp.balance)}</p>
          <p className="tabular-nums text-foreground/55">Preço {brl(hp.target)}</p>
        </div>
      )}
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/55">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-primary" aria-hidden /> Quanto você terá
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-foreground/35" aria-hidden /> Preço do sonho
        </span>
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

  useEffect(() => {
    dirty.current = false;
    setCfg(dream.plan ?? defaultPlanConfig(dream, budget, dreams, rate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dream.id]);

  // guarda o plano (só id/título/valor/prazo/plano: não sobrescreve depósitos feitos nesse meio-tempo)
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
  const decs = decembersIn(monthsUntil(dream.deadline));
  const diff = sim.reach !== null ? sim.n - sim.reach : null;

  const closeWithFreela = () => {
    const h = hoursToClose(dream, cfg, budget, rate);
    if (h === null) return toast.error('Nem com 40 h por semana fecha no prazo', { description: 'Ligue outros caminhos ou mude o prazo.' });
    update((c) => ({ ...c, freela: { ...c.freela, on: h > 0, hours: h } }));
    toast.success(`Renda extra ajustada para ${h} h por semana`);
  };
  const moveDeadline = () => {
    if (!sim.reachDate) return;
    const d = sim.reachDate;
    save.mutate({ id: dream.id, title: dream.title, target: dream.target, deadline: d, plan: cfg }, { onSuccess: () => toast.success('Prazo atualizado', { description: `Até ${monthLabel(d)}` }) });
  };
  const usePlan = () => {
    const ids = (Object.keys(METHOD_OF) as (keyof typeof METHOD_OF)[]).filter((k) => cfg[k].on).map((k) => METHOD_OF[k]);
    save.mutate(
      { id: dream.id, title: dream.title, target: dream.target, deadline: dream.deadline, plan: cfg, methods: [...new Set([...dream.methods, ...ids])] },
      { onSuccess: () => toast.success('Plano salvo', { description: 'Os passos de cada caminho estão na aba Passos.' }) },
    );
  };
  const reminder = () =>
    createTask.mutate({
      title: `Guardar ${brl(Math.round(sim.monthlyNow))} para ${dream.title}`,
      whatToDo: 'Transferir para a conta do sonho e registrar o depósito em Sonhos e metas.',
      status: 'NOT_STARTED',
      priority: 'HIGH',
      dueDate: todayISO(),
      recurrenceRule: 'FREQ=MONTHLY',
      scope: 'PERSONAL',
      lifeAreaId: 'financas',
      subtasks: [],
      links: [],
    });

  const set = <K extends keyof DreamPlanConfig>(k: K, patch: Partial<DreamPlanConfig[K]>) => update((c) => ({ ...c, [k]: { ...(c[k] as object), ...patch } }));

  return (
    <div className="space-y-4">
      {/* Resultado */}
      <section aria-label="Resultado do plano" className="rounded-xl border border-border bg-card p-4">
        <div aria-live="polite" className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">Com este plano, você realiza em</p>
            <p className="mt-0.5 text-2xl font-bold first-letter:uppercase">{sim.reachDate ? monthLabel(sim.reachDate) : 'Não chega lá'}</p>
            {diff !== null && (
              <span
                className={cn(
                  'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                  diff > 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : diff === 0 ? 'bg-muted text-foreground/70' : 'bg-primary/10 text-primary dark:text-neon',
                )}
              >
                {diff > 0 ? `${diff} ${diff === 1 ? 'mês' : 'meses'} antes do prazo` : diff === 0 ? 'No prazo' : `${-diff} ${diff === -1 ? 'mês' : 'meses'} depois do prazo`}
              </span>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-1 text-right text-sm">
            <dt className="text-xs text-foreground/55">Seu plano por mês</dt>
            <dt className="text-xs text-foreground/55">Preço no prazo</dt>
            <dd className="font-semibold tabular-nums">{brl(sim.monthlyNow)}</dd>
            <dd className="font-semibold tabular-nums">{brl(sim.targetAtDeadline)}</dd>
          </dl>
        </div>

        {sim.gapAtDeadline > 0 && (
          <div className="mt-3 rounded-lg bg-primary/5 p-3">
            <p className="text-sm">
              No prazo você terá {brl(sim.balanceAtDeadline)}. <strong className="text-primary dark:text-neon">Faltam {brl(sim.gapAtDeadline)}.</strong>
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

        <div className="mt-4">
          <ProjectionChart sim={sim} />
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-foreground/60">
          <Checkbox checked={cfg.inflation} onCheckedChange={(v) => update((c) => ({ ...c, inflation: v === true }))} />
          Corrigir o preço pela inflação ({INFLATION.toLocaleString('pt-BR')}% ao ano) · rendimento de {rate.toLocaleString('pt-BR')}% ao mês
        </label>
      </section>

      {/* Fontes */}
      <section aria-label="De onde vem o dinheiro" className="overflow-hidden rounded-xl border border-border bg-card">
        <Group title="Todo mês">
          <Row
            id="pl-sobra"
            icon={Landmark}
            title="Sobra do mês"
            detail={income ? `Sua sobra hoje: ${brl(free)}` : 'Preencha "Seu mês" para usar sua sobra real'}
            on={cfg.sobra.on}
            onToggle={(on) => set('sobra', { on })}
            amount={brl(cfg.sobra.value)}
          >
            <Slider id="pl-sobra-v" label="Quanto guardar" value={cfg.sobra.value} min={0} max={Math.max(free, cfg.sobra.value, 500)} step={10} format={(v) => brl(v)} onChange={(v) => set('sobra', { value: v })} />
          </Row>
          <Row id="pl-cortes" icon={Scissors} title="Cortar assinaturas e taxas" detail="O que você não usa mais" on={cfg.cortes.on} onToggle={(on) => set('cortes', { on })} amount={brl(cfg.cortes.value)}>
            <Slider id="pl-cortes-v" label="Quanto cortar" value={cfg.cortes.value} min={0} max={800} step={10} format={(v) => brl(v)} onChange={(v) => set('cortes', { value: v })} />
          </Row>
          <Row id="pl-consumo" icon={ShoppingCart} title="Gastar menos no dia a dia" detail="Mercado com lista, comida em casa" on={cfg.consumo.on} onToggle={(on) => set('consumo', { on })} amount={brl(cfg.consumo.value)}>
            <Slider id="pl-consumo-v" label="Quanto economizar" value={cfg.consumo.value} min={0} max={1500} step={10} format={(v) => brl(v)} onChange={(v) => set('consumo', { value: v })} />
          </Row>
        </Group>

        <Group title="De uma vez">
          <Row id="pl-vendas" icon={Package} title="Vender o que não usa" detail="Entra no próximo mês" on={cfg.vendas.on} onToggle={(on) => set('vendas', { on })} amount={brl(cfg.vendas.value)}>
            <Slider id="pl-vendas-v" label="Quanto vender" value={cfg.vendas.value} min={0} max={10000} step={50} format={(v) => brl(v)} onChange={(v) => set('vendas', { value: v })} />
          </Row>
          <Row
            id="pl-13"
            icon={Gift}
            title="13º e extras"
            detail={decs ? `Em cada dezembro até o prazo (${decs}×)` : 'Não há dezembro antes do prazo'}
            on={cfg.extra13.on}
            onToggle={(on) => set('extra13', { on })}
            amount={brl(cfg.extra13.value * Math.max(1, decs))}
          >
            <Slider id="pl-13-v" label="Quanto por dezembro" value={cfg.extra13.value} min={0} max={Math.max(income * 1.5, 6000)} step={50} format={(v) => brl(v)} onChange={(v) => set('extra13', { value: v })} />
          </Row>
        </Group>

        <Group title="Ganhar mais">
          <Row
            id="pl-freela"
            icon={Wrench}
            title="Renda extra"
            detail={`${cfg.freela.hours} h por semana a ${brl(cfg.freela.hourly)} a hora`}
            on={cfg.freela.on}
            onToggle={(on) => set('freela', { on })}
            amount={brl(cfg.freela.hours * cfg.freela.hourly * 4.33)}
          >
            <Slider id="pl-horas" label="Horas por semana" value={cfg.freela.hours} min={1} max={30} step={1} format={(v) => `${v} h`} onChange={(v) => set('freela', { hours: v })} />
            <Slider id="pl-hora" label="Valor da hora" value={cfg.freela.hourly} min={15} max={200} step={5} format={(v) => brl(v)} onChange={(v) => set('freela', { hourly: v })} />
          </Row>
          <Row
            id="pl-promo"
            icon={TrendingUp}
            title="Promoção ou aumento"
            detail={income ? `${cfg.promocao.pct}% a mais, a partir do ${PROMO_FROM}º mês` : 'Preencha "Seu mês" para calcular'}
            on={cfg.promocao.on && !!income}
            disabled={!income}
            onToggle={(on) => set('promocao', { on })}
            amount={brl((income * cfg.promocao.pct) / 100)}
          >
            <Slider id="pl-promo-v" label="Aumento" value={cfg.promocao.pct} min={5} max={50} step={1} format={(v) => `${v}%`} onChange={(v) => set('promocao', { pct: v })} />
          </Row>
          <Row id="pl-negocio" icon={Rocket} title="Negócio paralelo" detail={`Lucro a partir do ${BUSINESS_FROM}º mês`} on={cfg.negocio.on} onToggle={(on) => set('negocio', { on })} amount={brl(cfg.negocio.value)}>
            <Slider id="pl-negocio-v" label="Lucro por mês" value={cfg.negocio.value} min={200} max={10000} step={100} format={(v) => brl(v)} onChange={(v) => set('negocio', { value: v })} />
          </Row>
        </Group>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={usePlan}>
          <Check /> Usar este plano
        </Button>
        <Button variant="outline" onClick={reminder} disabled={sim.monthlyNow <= 0}>
          <BellRing /> Lembrete mensal
        </Button>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-foreground/50">
        <Info className="size-3.5" aria-hidden /> Valores estimados para planejar. O plano fica salvo neste sonho.
      </p>
    </div>
  );
}
