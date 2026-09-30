import { askConfirm } from '@/components/ui/confirm';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, ChartLine, Check, ClipboardList, Dumbbell, History, Pencil, ScanEye, Sparkles, Trash2, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarChart, LineChart } from '@/components/gym/charts';
import { BodyStats } from '@/components/gym/body-stats';
import { PlanEditor } from '@/components/gym/plan-editor';
import { ExerciseLibrary } from '@/components/gym/exercise-library';
import { WorkoutLogger } from '@/components/gym/workout-logger';
import { WorkoutGenerator } from '@/components/gym/workout-generator';
import { Button } from '@/components/ui/button';
import { Label, Select } from '@/components/ui/form-controls';
import { useDeleteSession, useGym } from '@/hooks/use-data';
import {
  formatKg,
  formatVolume,
  monthlyBest,
  monthlySummary,
  MUSCLE_LABEL,
  personalRecords,
  sessionVolume,
  WEEKDAYS_SHORT,
} from '@/lib/gym';
import { todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { GymData } from '@/types';

type Tab = 'today' | 'generator' | 'plan' | 'library' | 'progress' | 'history';

const TABS: { id: Tab; label: string; icon: typeof Dumbbell }[] = [
  { id: 'today', label: 'Treino do dia', icon: Dumbbell },
  { id: 'generator', label: 'Gerar treino', icon: Sparkles },
  { id: 'plan', label: 'Plano semanal', icon: ClipboardList },
  { id: 'library', label: 'Exercícios', icon: ScanEye },
  { id: 'progress', label: 'Evolução & PRs', icon: ChartLine },
  { id: 'history', label: 'Histórico', icon: History },
];

/** Faixa da semana atual: o que está planejado e o que já foi feito. */
function WeekStrip({ gym, onPick }: { gym: GymData; onPick: (date: string) => void }) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = todayISO();
  const done = new Set(gym.sessions.map((s) => s.date));
  const planned = days.filter((d) => gym.plan.find((p) => p.weekday === d.getDay())?.title).length;
  const doneCount = days.filter((d) => done.has(format(d, 'yyyy-MM-dd'))).length;

  return (
    <section aria-label="Semana atual" className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <CalendarCheck className="size-4 text-primary" aria-hidden /> Esta semana
        </h2>
        <span className="text-sm font-semibold tabular-nums">
          {doneCount}/{planned} treinos
        </span>
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const iso = format(d, 'yyyy-MM-dd');
          const plan = gym.plan.find((p) => p.weekday === d.getDay());
          const isDone = done.has(iso);
          const isToday = iso === today;
          return (
            <li key={iso}>
              <button
                type="button"
                onClick={() => onPick(iso)}
                title={plan?.title || 'Descanso'}
                aria-label={`${format(d, 'EEEE', { locale: ptBR })}: ${plan?.title || 'descanso'}${isDone ? ', feito' : ''}`}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-lg border px-0.5 py-2 text-center transition-all duration-200 hover:bg-muted',
                  isToday ? 'border-neon shadow-neon' : 'border-border',
                )}
              >
                <span className="text-[11px] font-bold uppercase text-foreground/60">{WEEKDAYS_SHORT[d.getDay()]}</span>
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-full text-xs font-bold',
                    isDone ? 'bg-emerald-500 text-white' : plan?.title ? 'bg-muted' : 'text-foreground/30',
                  )}
                >
                  {isDone ? <Check className="size-4" aria-hidden /> : format(d, 'd')}
                </span>
                <span className="hidden sm:block"><span className="line-clamp-2 min-h-[2lh] text-[10px] leading-tight text-foreground/60">{plan?.title || 'Descanso'}</span></span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Progress({ gym }: { gym: GymData }) {
  const records = useMemo(() => personalRecords(gym.sessions), [gym.sessions]);
  const trained = gym.exercises.filter((e) => records.has(e.id));
  const [exerciseId, setExerciseId] = useState(trained[0]?.id ?? '');
  const summary = monthlySummary(gym.sessions);
  const thisMonth = todayISO().slice(0, 7);
  const cur = summary.find((m) => m.month === thisMonth);
  const prev = summary.filter((m) => m.month < thisMonth).at(-1);
  const prsThisMonth = [...records.values()].filter((r) => r.date.startsWith(thisMonth)).length;
  const best = monthlyBest(gym.sessions, exerciseId);
  const pr = records.get(exerciseId);
  const first = best[0]?.value ?? 0;
  const gain = pr && first ? pr.kg - first : 0;

  const kpis = [
    { label: 'Treinos no mês', value: String(cur?.sessions ?? 0), hint: prev ? `${prev.sessions} no mês anterior` : undefined },
    { label: 'Volume no mês', value: formatVolume(cur?.volume ?? 0), hint: prev ? `${formatVolume(prev.volume)} no anterior` : undefined },
    { label: 'PRs no mês', value: String(prsThisMonth), hint: `${records.size} exercícios com recorde` },
    { label: 'Horas treinadas', value: `${Math.round((cur?.minutes ?? 0) / 60)} h`, hint: 'neste mês' },
  ];

  return (
    <div className="space-y-5">
      <BodyStats gym={gym} />

      <section aria-label="Resumo do mês" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <span className="block text-2xl font-bold tabular-nums">{k.value}</span>
            <span className="block text-sm text-foreground/70">{k.label}</span>
            {k.hint && <span className="block text-xs text-foreground/50">{k.hint}</span>}
          </div>
        ))}
      </section>

      <section aria-label="Evolução por exercício" className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-end">
          <div>
            <Label htmlFor="pg-ex">Exercício</Label>
            <Select id="pg-ex" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
              {trained.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
          </div>
          {pr && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-navy">
                <Trophy className="size-4" aria-hidden /> PR {formatKg(pr.kg)} × {pr.reps}
              </span>
              <span className="text-xs text-foreground/60">
                em {format(parseISO(pr.date), 'dd/MM/yyyy')} · 1RM estimado {formatKg(Math.round(pr.est1RM))}
                {gain > 0 && ` · +${formatKg(gain)} desde o início`}
              </span>
            </div>
          )}
        </div>
        <LineChart
          points={best.map((b) => ({ label: b.label, value: b.value }))}
          title="Carga máxima por mês"
          subtitle="Maior peso levantado no exercício em cada mês"
          format={(v) => formatKg(v)}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart points={summary.map((m) => ({ label: m.label, value: m.sessions }))} title="Treinos por mês" format={(v) => `${Math.round(v)}`} />
        <BarChart
          points={summary.map((m) => ({ label: m.label, value: m.volume }))}
          title="Volume por mês"
          subtitle="Soma de carga × repetições"
          format={formatVolume}
        />
      </div>

      <section aria-labelledby="pr-board" className="rounded-xl border border-border bg-card p-4">
        <h2 id="pr-board" className="mb-3 flex items-center gap-2 font-semibold">
          <Trophy className="size-4 text-amber-500" aria-hidden /> Quadro de recordes (PR)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-xs text-foreground/60">
                <th className="py-1 font-medium">Exercício</th>
                <th className="py-1 font-medium">Grupo</th>
                <th className="py-1 text-right font-medium">PR</th>
                <th className="py-1 text-right font-medium">1RM est.</th>
                <th className="py-1 text-right font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {trained
                .map((e) => ({ e, r: records.get(e.id)! }))
                .sort((a, b) => b.r.date.localeCompare(a.r.date))
                .map(({ e, r }) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="py-2 font-medium">{e.name}</td>
                    <td className="py-2 text-foreground/60">{MUSCLE_LABEL[e.muscle]}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {formatKg(r.kg)} × {r.reps}
                    </td>
                    <td className="py-2 text-right tabular-nums text-foreground/60">{formatKg(Math.round(r.est1RM))}</td>
                    <td className="py-2 text-right tabular-nums text-foreground/60">{format(parseISO(r.date), 'dd/MM/yy')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HistoryList({ gym, onEdit }: { gym: GymData; onEdit: (date: string) => void }) {
  const remove = useDeleteSession();
  const sessions = [...gym.sessions].sort((a, b) => b.date.localeCompare(a.date));
  const exName = (id: string) => gym.exercises.find((e) => e.id === id)?.name ?? id;
  if (!sessions.length) return <p className="text-sm text-foreground/60">Nenhum treino registrado ainda.</p>;
  return (
    <ul className="space-y-2">
      {sessions.map((s) => (
        <li key={s.id}>
          <details className="group rounded-xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
              <span className="w-16 shrink-0 text-center">
                <span className="block text-lg font-bold tabular-nums">{format(parseISO(s.date), 'dd/MM')}</span>
                <span className="block text-[11px] uppercase text-foreground/50">{format(parseISO(s.date), 'EEE', { locale: ptBR })}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{s.title}</span>
                <span className="block text-xs text-foreground/60">
                  {s.entries.length} exercícios · {s.entries.reduce((a, e) => a + e.sets.length, 0)} séries · {formatVolume(sessionVolume(s))}
                  {s.durationMin ? ` · ${s.durationMin} min` : ''}
                </span>
              </span>
              <Button variant="ghost" size="icon-sm" onClick={(e) => { e.preventDefault(); onEdit(s.date); }} aria-label={`Editar treino de ${format(parseISO(s.date), 'dd/MM')}`}>
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  void askConfirm({ title: 'Remover este treino?', message: 'As séries registradas neste dia serão apagadas.', confirmLabel: 'Remover', danger: true }).then((ok) => ok && remove.mutate(s.id));
                }}
                aria-label={`Remover treino de ${format(parseISO(s.date), 'dd/MM')}`}
              >
                <Trash2 />
              </Button>
            </summary>
            <div className="border-t border-border px-4 py-3">
              <ul className="space-y-1 text-sm">
                {s.entries.map((e) => (
                  <li key={e.exerciseId} className="flex flex-wrap gap-x-2">
                    <span className="font-medium">{exName(e.exerciseId)}:</span>
                    <span className="tabular-nums text-foreground/70">{e.sets.map((st) => `${formatKg(st.kg)} × ${st.reps}`).join(' · ')}</span>
                  </li>
                ))}
              </ul>
              {s.note && <p className="mt-2 text-sm italic text-foreground/60">“{s.note}”</p>}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

export function GymPage() {
  const { data: gym, isLoading } = useGym();
  const [tab, setTab] = useState<Tab>('today');
  const [date, setDate] = useState(todayISO());

  const pickDate = (d: string) => {
    setDate(d);
    setTab('today');
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Dumbbell className="size-7 text-primary icon-glow" aria-hidden /> Academia
        </h1>
        <p className="text-sm text-foreground/60">Pessoal · registre seus treinos, cargas e acompanhe seus PRs e sua evolução mês a mês.</p>
      </header>

      {isLoading || !gym ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" aria-busy />
      ) : (
        <>
          <WeekStrip gym={gym} onPick={pickDate} />

          <div role="tablist" aria-label="Seções da academia" className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200',
                  tab === id ? 'btn-neon text-white' : 'border border-border bg-card text-foreground/70 hover:bg-muted',
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>

          <div role="tabpanel">
            {tab === 'today' && <WorkoutLogger gym={gym} date={date} onDateChange={setDate} />}
            {tab === 'generator' && <WorkoutGenerator gym={gym} onApplied={() => setTab('plan')} />}
            {tab === 'plan' && <PlanEditor gym={gym} />}
            {tab === 'library' && <ExerciseLibrary gym={gym} />}
            {tab === 'progress' && <Progress gym={gym} />}
            {tab === 'history' && <HistoryList gym={gym} onEdit={pickDate} />}
          </div>
        </>
      )}
    </div>
  );
}
