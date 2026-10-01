import { askConfirm } from '@/components/ui/confirm';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartPie, Check, CirclePlay, Lightbulb, Plus, Target, Repeat, Save, Shuffle, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RutteLogo } from '@/components/brand/rutte';
import { WheelChart } from '@/components/life/wheel-chart';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form-controls';
import { useCreateTask, useDeleteWheel, useSaveWheel, useTasks, useUser, useWheelAssessments } from '@/hooks/use-data';
import { focusAreas } from '@/lib/onboarding';
import { emptyScores, LIFE_AREAS, LIFE_TIPS, type LifeTip } from '@/lib/life-areas';
import { isClosed, recurrenceLabel, todayISO } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { topicForArea } from '@/lib/library';
import { useUI } from '@/store/ui';
import type { LifeAreaId } from '@/types';

const avg = (s: Record<LifeAreaId, number>) =>
  Math.round((LIFE_AREAS.reduce((acc, a) => acc + (s[a.id] ?? 0), 0) / LIFE_AREAS.length) * 10) / 10;

export function LifePage() {
  const { data: assessments = [], isLoading } = useWheelAssessments();
  const { data: tasks = [] } = useTasks();
  const { data: user } = useUser();
  const navigate = useNavigate();
  const focus = user ? focusAreas(user.goals) : [];
  const save = useSaveWheel();
  const remove = useDeleteWheel();
  const openNewTask = useUI((s) => s.openNewTask);
  const setFilters = useUI((s) => s.setFilters);
  const resetFilters = useUI((s) => s.resetFilters);

  const latest = assessments.at(-1);
  const [scores, setScores] = useState<Record<LifeAreaId, number>>(emptyScores);
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<LifeAreaId | null>(null);
  const [dirty, setDirty] = useState(false);

  // Começa a partir da última avaliação
  useEffect(() => {
    if (latest && !dirty) {
      setScores({ ...emptyScores(), ...latest.scores });
      setNote(latest.date === todayISO() ? (latest.note ?? '') : '');
    }
  }, [latest, dirty]);

  // Avaliação anterior para comparar (a última que não é de hoje)
  const previous = [...assessments].reverse().find((a) => a.date !== todayISO());

  const openByArea = useMemo(() => {
    const m = new Map<LifeAreaId, number>();
    for (const t of tasks) if (t.lifeAreaId && !isClosed(t)) m.set(t.lifeAreaId, (m.get(t.lifeAreaId) ?? 0) + 1);
    return m;
  }, [tasks]);

  const weakest = [...LIFE_AREAS].sort((a, b) => scores[a.id] - scores[b.id]).slice(0, 3);
  const average = avg(scores);
  const delta = previous ? Math.round((average - avg(previous.scores)) * 10) / 10 : null;

  const setScore = (id: LifeAreaId, v: number) => {
    setScores((s) => ({ ...s, [id]: v }));
    setDirty(true);
  };

  const onSave = async () => {
    await save.mutateAsync({ date: todayISO(), scores, note: note.trim() || undefined });
    setDirty(false);
  };

  const showVideos = (id: LifeAreaId) => navigate('/library', { state: { tab: 'videos', topic: topicForArea(id) } });

  const seeTasks = (id: LifeAreaId) => {
    resetFilters();
    setFilters({ lifeAreaIds: [id] });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-4">
        <RutteLogo className="w-12 shrink-0 sm:w-14" />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <ChartPie className="size-7 text-primary" aria-hidden /> Roda da Vida
          </h1>
          <p className="mt-1 max-w-2xl text-foreground/60">
            “Dê uma nota de 0 a 10 para cada área. Eu mostro onde está o desequilíbrio e te ajudo a transformar isso em afazeres.” — <strong className="text-foreground">Rutte</strong>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Gráfico */}
        <section aria-labelledby="wheel-title" className="flex flex-col items-center rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <h2 id="wheel-title" className="font-bold">Seu equilíbrio</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-muted px-3 py-1 font-semibold tabular-nums">Média {average.toFixed(1)}</span>
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                    delta > 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-primary/10 text-primary',
                  )}
                >
                  {delta > 0 ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
                  {delta > 0 ? '+' : ''}
                  {delta} vs anterior
                </span>
              )}
            </div>
          </div>
          <WheelChart scores={scores} previous={previous?.scores} selected={selected} onSelect={(id) => setSelected((s) => (s === id ? null : id))} />
          {previous && (
            <p className="text-xs text-foreground/60">
              <span className="mr-1 inline-block w-5 border-t-2 border-dashed border-foreground/70 align-middle" aria-hidden />
              Avaliação de {format(parseISO(previous.date), "d 'de' MMM", { locale: ptBR })}
            </p>
          )}
        </section>

        {/* Notas */}
        <section aria-labelledby="scores-title" className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 id="scores-title" className="font-bold">Avaliação de hoje</h2>
            {latest && (
              <span className="text-xs text-foreground/50">
                Última: {format(parseISO(latest.date), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
          <ul className="mt-4 space-y-3">
            {LIFE_AREAS.map((a) => {
              const Icon = a.icon;
              return (
                <li
                  key={a.id}
                  className={cn('rounded-xl p-2 transition-colors', selected === a.id && 'bg-muted')}
                  onMouseEnter={() => setSelected(a.id)}
                  onMouseLeave={() => setSelected(null)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0" style={{ color: a.color }} aria-hidden />
                    <label htmlFor={`sc-${a.id}`} className="flex flex-1 flex-wrap items-center gap-1.5 text-sm font-medium">
                      {a.name}
                      {focus.includes(a.id) && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:text-neon">
                          <Target className="size-3" aria-hidden /> Seu foco
                        </span>
                      )}
                    </label>
                    <span className="w-8 text-right text-sm font-bold tabular-nums">{scores[a.id]}</span>
                  </div>
                  <input
                    id={`sc-${a.id}`}
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={scores[a.id]}
                    onChange={(e) => setScore(a.id, Number(e.target.value))}
                    onFocus={() => setSelected(a.id)}
                    aria-describedby={`q-${a.id}`}
                    className="mt-1 w-full accent-primary"
                  />
                  <p id={`q-${a.id}`} className="text-xs text-foreground/50">{a.question}</p>
                </li>
              );
            })}
          </ul>
          <Textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setDirty(true);
            }}
            placeholder="Anotações (opcional): o que está pesando? o que quer mudar?"
            aria-label="Anotações da avaliação"
            className="mt-4 min-h-[70px]"
          />
          <Button onClick={onSave} disabled={save.isPending || isLoading} className="mt-3 w-full">
            <Save /> Salvar avaliação de hoje
          </Button>
        </section>
      </div>

      {/* Onde focar */}
      <section aria-labelledby="focus-title" className="space-y-3">
        <h2 id="focus-title" className="text-lg font-bold">Onde focar agora</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {weakest.map((a) => {
            const Icon = a.icon;
            const open = openByArea.get(a.id) ?? 0;
            return (
              <article key={a.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-lg" style={{ background: `${a.color}22`, color: a.color }}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{a.name}</h3>
                    <p className="text-xs text-foreground/60">
                      Nota {scores[a.id]}/10 · {open} {open === 1 ? 'afazer aberto' : 'afazeres abertos'}
                    </p>
                  </div>
                </div>
                <TipsList area={a.id} />
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => openNewTask({ lifeAreaId: a.id, scope: 'PERSONAL' })}>
                    <Plus /> Criar afazer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => showVideos(a.id)}>
                    <CirclePlay /> Vídeos
                  </Button>
                  {open > 0 && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/tasks" onClick={() => seeTasks(a.id)}>Ver afazeres</Link>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Histórico */}
      {assessments.length > 0 && (
        <section aria-labelledby="hist-title" className="space-y-3">
          <h2 id="hist-title" className="text-lg font-bold">Histórico de avaliações</h2>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {[...assessments].reverse().map((a) => (
              <li key={a.id} className="flex items-center gap-3 p-3">
                <span className="w-24 shrink-0 text-sm font-semibold tabular-nums">{format(parseISO(a.date), 'dd/MM/yyyy')}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums">Média {avg(a.scores).toFixed(1)}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground/60">{a.note}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={async () => (await askConfirm({ title: 'Remover esta avaliação?', confirmLabel: 'Remover', danger: true })) && remove.mutate(a.id)}
                  aria-label={`Remover avaliação de ${format(parseISO(a.date), 'dd/MM/yyyy')}`}
                  className="hover:text-primary"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}

/** Dicas de atividades da área: mostra 3 por vez; um clique vira afazer (Pessoal, ligado à área). */
function TipsList({ area }: { area: LifeAreaId }) {
  const tips = LIFE_TIPS[area];
  const create = useCreateTask();
  const [offset, setOffset] = useState(0);
  const [added, setAdded] = useState<string[]>([]);
  const visible = [0, 1, 2].map((i) => tips[(offset + i) % tips.length]);

  const add = async (tip: LifeTip) => {
    await create.mutateAsync({
      title: tip.title,
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: todayISO(),
      recurrenceRule: tip.recurrence,
      scope: 'PERSONAL',
      lifeAreaId: area,
      subtasks: [],
      links: [],
    });
    setAdded((a) => [...a, tip.title]);
  };

  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/70">
          <Lightbulb className="size-3.5 text-amber-500" aria-hidden /> Dicas da Rutte
        </span>
        {tips.length > 3 && (
          <button
            type="button"
            onClick={() => setOffset((o) => (o + 3) % tips.length)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-foreground/60 hover:bg-muted hover:text-foreground"
          >
            <Shuffle className="size-3" aria-hidden /> Outras
          </button>
        )}
      </div>
      <ul className="space-y-1">
        {visible.map((tip) => {
          const done = added.includes(tip.title);
          return (
            <li key={tip.title} className="flex items-center gap-2 rounded-md px-1 py-1 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block leading-snug">{tip.title}</span>
                {tip.recurrence && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-foreground/50">
                    <Repeat className="size-3" aria-hidden /> {recurrenceLabel(tip.recurrence)}
                  </span>
                )}
              </span>
              <button
                type="button"
                disabled={done || create.isPending}
                onClick={() => add(tip)}
                aria-label={done ? `Já adicionado: ${tip.title}` : `Adicionar como afazer: ${tip.title}`}
                title={done ? 'Adicionado' : 'Adicionar como afazer'}
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full transition-all duration-200',
                  done ? 'bg-emerald-500 text-white' : 'btn-neon text-white hover:brightness-110',
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
