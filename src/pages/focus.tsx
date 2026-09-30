import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Coffee, ListTodo, Pause, Play, RotateCcw, Settings2, SkipForward, Target, Timer, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { unlockAudio, useNow } from '@/components/focus/focus-engine';
import { Button } from '@/components/ui/button';
import { askConfirm } from '@/components/ui/confirm';
import { useDeleteFocusSession, useFocusSessions, useTasks } from '@/hooks/use-data';
import { isClosed, isDueToday, isOverdue } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { fmtClock, PHASE_LABEL, phaseTotalMs, remainingAt, useFocus, type FocusPhase } from '@/store/focus';

const PHASES: FocusPhase[] = ['focus', 'short', 'long'];

/** Anel holográfico do tempo (fração restante). */
function FocusRing({ fraction, clock, phase, running, cycle, every }: { fraction: number; clock: string; phase: FocusPhase; running: boolean; cycle: number; every: number }) {
  const R = 118;
  const C = 2 * Math.PI * R;
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  const isFocus = phase === 'focus';
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      <svg viewBox="0 0 300 300" className="size-full" role="img" aria-label={`${PHASE_LABEL[phase]}: ${clock} restantes`}>
        <defs>
          <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="150" cy="150" r="142" fill="none" stroke="rgb(var(--neon) / .15)" strokeWidth="1" strokeDasharray="2 6" className={running ? 'holo-ring' : ''} />
        {ticks.map((i) => {
          const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
          const long = i % 5 === 0;
          const r1 = long ? 128 : 131;
          return (
            <line
              key={i}
              x1={150 + r1 * Math.cos(a)}
              y1={150 + r1 * Math.sin(a)}
              x2={150 + 135 * Math.cos(a)}
              y2={150 + 135 * Math.sin(a)}
              stroke={`rgb(var(--neon) / ${long ? 0.5 : 0.2})`}
              strokeWidth={long ? 2 : 1}
            />
          );
        })}
        <circle cx="150" cy="150" r={R} fill="rgb(var(--neon) / .05)" stroke="rgb(var(--neon) / .15)" strokeWidth="10" />
        <circle
          cx="150"
          cy="150"
          r={R}
          fill="none"
          stroke={isFocus ? 'rgb(var(--neon))' : '#34D399'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          transform="rotate(-90 150 150)"
          filter="url(#ring-glow)"
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn('font-mono text-[11px] font-bold uppercase tracking-[0.25em]', isFocus ? 'text-primary dark:text-neon' : 'text-emerald-500')}>
          {PHASE_LABEL[phase]}
        </span>
        <span className="font-mono text-6xl font-bold tabular-nums tracking-tight sm:text-7xl" aria-live="off">
          {clock}
        </span>
        <span className="mt-1 flex gap-1" aria-label={`${cycle} de ${every} focos até a pausa longa`}>
          {Array.from({ length: every }, (_, i) => (
            <span key={i} className={cn('size-2 rounded-full', i < cycle ? 'bg-primary shadow-neon' : 'bg-foreground/20')} />
          ))}
        </span>
      </div>
    </div>
  );
}

export function FocusPage() {
  const f = useFocus();
  const now = useNow(f.status === 'running', 250);
  const left = remainingAt(f, now);
  const total = phaseTotalMs(f);
  const { data: tasks = [] } = useTasks();
  const { data: sessions = [] } = useFocusSessions();
  const remove = useDeleteFocusSession();
  const [showSettings, setShowSettings] = useState(false);
  const [query, setQuery] = useState('');

  const openTasks = useMemo(
    () =>
      tasks
        .filter((t) => !isClosed(t))
        .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)) || Number(isDueToday(b)) - Number(isDueToday(a))),
    [tasks],
  );
  const q = query.trim().toLowerCase();
  const suggestions = openTasks.filter((t) => !q || t.title.toLowerCase().includes(q)).slice(0, 6);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const today = sessions.filter((s) => s.date === todayKey);
  const todayMin = today.reduce((a, s) => a + s.minutes, 0);
  const byActivity = Object.values(
    today.reduce<Record<string, { activity: string; count: number; minutes: number }>>((acc, s) => {
      const k = s.activity;
      acc[k] ??= { activity: k, count: 0, minutes: 0 };
      acc[k].count++;
      acc[k].minutes += s.minutes;
      return acc;
    }, {}),
  ).sort((a, b) => b.minutes - a.minutes);
  const weekStart = format(subDays(new Date(), 6), 'yyyy-MM-dd');
  const weekMin = sessions.filter((s) => s.date >= weekStart).reduce((a, s) => a + s.minutes, 0);

  const start = () => {
    unlockAudio();
    if (!f.activity.label.trim() && query.trim()) f.setActivity({ label: query.trim() });
    f.start();
  };

  const chooseTask = (id: string, title: string) => {
    f.setActivity({ label: title, taskId: id });
    setQuery('');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Timer className="size-7 text-primary icon-glow" aria-hidden /> Foco
        </h1>
        <p className="text-sm text-foreground/60">Técnica Pomodoro: blocos de foco com pausas curtas. A cada {f.settings.every} focos, uma pausa longa.</p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Timer */}
        <section aria-label="Cronômetro" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div role="tablist" aria-label="Fase" className="mx-auto mb-4 flex max-w-sm gap-1 rounded-xl bg-muted/60 p-1">
            {PHASES.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={f.phase === p}
                onClick={async () => {
                  if (f.status !== 'idle' && !(await askConfirm({ title: 'Trocar de fase?', message: 'O tempo atual será descartado.', confirmLabel: 'Trocar' }))) return;
                  f.setPhase(p);
                }}
                className={cn(
                  'h-9 flex-1 rounded-lg text-xs font-semibold transition-all duration-200 sm:text-sm',
                  f.phase === p ? 'btn-neon text-white' : 'text-foreground/60 hover:text-foreground',
                )}
              >
                {PHASE_LABEL[p]}
              </button>
            ))}
          </div>

          <FocusRing
            fraction={total ? left / total : 0}
            clock={fmtClock(left)}
            phase={f.phase}
            running={f.status === 'running'}
            cycle={f.cycle}
            every={f.settings.every}
          />

          <div className="mt-4 flex items-center justify-center gap-3">
            <Button variant="outline" size="icon" onClick={f.reset} aria-label="Reiniciar fase" title="Reiniciar">
              <RotateCcw />
            </Button>
            {f.status === 'running' ? (
              <Button size="lg" className="h-14 min-w-40 rounded-full text-base" onClick={f.pause}>
                <Pause className="!size-5" /> Pausar
              </Button>
            ) : (
              <Button size="lg" className="h-14 min-w-40 rounded-full text-base" onClick={start}>
                <Play className="!size-5" /> {f.status === 'paused' ? 'Continuar' : f.phase === 'focus' ? 'Começar foco' : 'Começar pausa'}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                if (f.phase === 'focus' && f.status !== 'idle' && !(await askConfirm({ title: 'Pular este foco?', message: 'Ele não será contado como pomodoro concluído.', confirmLabel: 'Pular' }))) return;
                const next: FocusPhase = f.phase === 'focus' ? (f.cycle + 1 >= f.settings.every ? 'long' : 'short') : 'focus';
                f.setPhase(next);
              }}
              aria-label="Pular para a próxima fase"
              title="Pular"
            >
              <SkipForward />
            </Button>
          </div>
          {f.phase !== 'focus' && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-foreground/60">
              <Coffee className="size-4" aria-hidden /> Levante, beba água e descanse os olhos.
            </p>
          )}
        </section>

        {/* Atividade + resumo */}
        <div className="space-y-5">
          <section aria-labelledby="act-title" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h2 id="act-title" className="flex items-center gap-2 font-semibold">
              <Target className="size-4 text-primary" aria-hidden /> O que você vai fazer agora?
            </h2>
            {f.activity.label ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-neon/50 bg-primary/5 p-3 shadow-neon">
                {f.activity.taskId ? <ListTodo className="size-4 shrink-0 text-primary" aria-hidden /> : <Timer className="size-4 shrink-0 text-primary" aria-hidden />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{f.activity.label}</span>
                  <span className="text-xs text-foreground/60">{f.activity.taskId ? 'Afazer vinculado — o pomodoro fica no histórico dele' : 'Atividade livre'}</span>
                </span>
                <Button variant="ghost" size="icon-sm" onClick={() => f.setActivity({ label: '' })} aria-label="Trocar atividade">
                  <X />
                </Button>
              </div>
            ) : (
              <>
                <input
                  id="focus-activity"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      f.setActivity({ label: query.trim() });
                      setQuery('');
                    }
                  }}
                  placeholder="Ex.: Estudar capítulo 3, responder e-mails…"
                  aria-label="Atividade do foco"
                  maxLength={120}
                  className="mt-3 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {query.trim() && (
                    <Button size="sm" onClick={() => (f.setActivity({ label: query.trim() }), setQuery(''))}>
                      Usar “{query.trim().slice(0, 30)}”
                    </Button>
                  )}
                </div>
                {suggestions.length > 0 && (
                  <>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">Ou escolha um afazer</p>
                    <ul className="mt-1.5 space-y-1">
                      {suggestions.map((t) => (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => chooseTask(t.id, t.title)}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
                          >
                            <ListTodo className="size-4 shrink-0 text-foreground/50" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">{t.title}</span>
                            {isOverdue(t) ? (
                              <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">Atrasada</span>
                            ) : isDueToday(t) ? (
                              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">Hoje</span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </section>

          <section aria-labelledby="today-title" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h2 id="today-title" className="font-semibold">Hoje</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { v: today.length, l: today.length === 1 ? 'pomodoro' : 'pomodoros' },
                { v: `${todayMin}`, l: 'min de foco' },
                { v: `${Math.round(weekMin / 60)}h`, l: 'em 7 dias' },
              ].map((k) => (
                <div key={k.l} className="rounded-xl bg-muted/50 p-2">
                  <span className="block font-mono text-2xl font-bold tabular-nums">{k.v}</span>
                  <span className="text-xs text-foreground/60">{k.l}</span>
                </div>
              ))}
            </div>
            {byActivity.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {byActivity.map((a) => (
                  <li key={a.activity} className="flex items-center gap-2 text-sm">
                    <span aria-hidden>🍅</span>
                    <span className="min-w-0 flex-1 truncate">{a.activity}</span>
                    <span className="shrink-0 tabular-nums text-foreground/60">
                      {a.count}× · {a.minutes} min
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-foreground/60">Nenhum pomodoro hoje ainda. Escolha a atividade e comece o primeiro bloco.</p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <button type="button" onClick={() => setShowSettings((v) => !v)} className="flex w-full items-center gap-2 font-semibold" aria-expanded={showSettings}>
              <Settings2 className="size-4 text-primary" aria-hidden /> Ajustes
              <span className="ml-auto text-xs font-normal text-foreground/60">
                {f.settings.focus}/{f.settings.short}/{f.settings.long} min
              </span>
            </button>
            {showSettings && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ['focus', 'Foco', 5, 90],
                      ['short', 'Pausa curta', 1, 30],
                      ['long', 'Pausa longa', 5, 60],
                      ['every', 'Longa a cada', 2, 8],
                    ] as const
                  ).map(([key, label, min, max]) => (
                    <label key={key} className="text-xs font-semibold text-foreground/60">
                      {label}
                      <input
                        type="number"
                        inputMode="numeric"
                        min={min}
                        max={max}
                        value={f.settings[key]}
                        onChange={(e) => {
                          const v = Math.min(max, Math.max(min, Number(e.target.value) || min));
                          f.setSettings({ [key]: v });
                        }}
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm font-normal tabular-nums text-foreground"
                      />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant={f.settings.autoStart ? 'primary' : 'outline'} size="sm" onClick={() => f.setSettings({ autoStart: !f.settings.autoStart })} aria-pressed={f.settings.autoStart}>
                    <Play /> Iniciar próxima fase sozinho
                  </Button>
                  <Button variant={f.settings.sound ? 'primary' : 'outline'} size="sm" onClick={() => f.setSettings({ sound: !f.settings.sound })} aria-pressed={f.settings.sound}>
                    {f.settings.sound ? <Volume2 /> : <VolumeX />} Som ao terminar
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {sessions.length > 0 && (
        <section aria-labelledby="hist-focus" className="space-y-2">
          <h2 id="hist-focus" className="text-lg font-bold">Últimos pomodoros</h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {sessions.slice(0, 12).map((s) => (
              <li key={s.id} className="flex items-center gap-3 p-3 text-sm">
                <span className="w-24 shrink-0 tabular-nums text-foreground/60">{format(parseISO(s.endedAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{s.activity}</span>
                <span className="shrink-0 tabular-nums text-foreground/60">{s.minutes} min</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="hover:text-primary"
                  aria-label={`Remover pomodoro de ${s.activity}`}
                  onClick={async () => (await askConfirm({ title: 'Remover este pomodoro?', confirmLabel: 'Remover', danger: true })) && remove.mutate(s.id)}
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
