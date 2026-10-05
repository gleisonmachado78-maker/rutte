import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  ChartPie,
  CirclePlay,
  Lightbulb,
  MapPin,
  Navigation,
  Target,
  WandSparkles,
  ListTodo,
  Sparkles,
  TriangleAlert,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RutteLogo } from '@/components/brand/rutte';
import { TaskCard } from '@/components/tasks/task-card';
import { Button } from '@/components/ui/button';
import { useModules, useScopedTasks, useTasks, useUser, useWheelAssessments } from '@/hooks/use-data';
import { firstName, GOALS, tipOfTheDay } from '@/lib/onboarding';
import { directionsUrl, shortPlace } from '@/lib/maps';
import { LIFE_AREAS } from '@/lib/life-areas';
import {
  buildPriorityNow,
  dueDateTime,
  greeting,
  isClosed,
  isDueToday,
  isOverdue,
  type PriorityNowGroup,
} from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { useUI, type DateFilter } from '@/store/ui';
import type { GoalId, TaskStatus } from '@/types';

function Kpi({
  label,
  value,
  icon: Icon,
  tone = 'default',
  onClick,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'danger' | 'success';
  onClick: () => void;
}) {
  const danger = tone === 'danger' && value > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5',
        danger ? 'border-brand-neon bg-brand text-white shadow-neon-brand' : 'border-border bg-card',
      )}
    >
      <span
        className={cn(
          'grid size-9 place-items-center rounded-lg',
          danger ? 'bg-white/20' : tone === 'success' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-foreground/70',
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block text-3xl font-bold tabular-nums">{value}</span>
        <span className={cn('text-sm', danger ? 'text-white/85' : 'text-foreground/60')}>{label}</span>
      </span>
    </button>
  );
}

const GROUP_META: Record<PriorityNowGroup, { label: string; icon: LucideIcon; cls: string }> = {
  OVERDUE: { label: 'Atrasadas', icon: TriangleAlert, cls: 'text-brand dark:text-brand-neon' },
  TODAY: { label: 'Vencem hoje', icon: CalendarClock, cls: 'text-foreground' },
  MEETING: { label: 'Reuniões próximas', icon: Video, cls: 'text-foreground' },
};

export function DashboardPage() {
  const { data: tasks = [], isLoading } = useScopedTasks();
  const setFilters = useUI((s) => s.setFilters);
  const resetFilters = useUI((s) => s.resetFilters);
  const openTask = useUI((s) => s.openTask);
  const navigate = useNavigate();
  const scope = useUI((s) => s.scope);
  const { data: user } = useUser();
  const modules = useModules();
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const nick = user ? firstName(user.name) : '';
  const now = new Date();

  const today = tasks.filter((t) => isDueToday(t));
  const overdue = tasks.filter((t) => isOverdue(t, now));
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completed = tasks.filter((t) => t.status === 'COMPLETED');
  const priorityNow = buildPriorityNow(tasks);
  const agenda = today
    .filter((t) => !isClosed(t) && (t.deadlineTime || t.meetingUrl || t.location))
    .sort((a, b) => dueDateTime(a).getTime() - dueDateTime(b).getTime());

  const goTasks = (patch: { date?: DateFilter; statuses?: TaskStatus[] }) => {
    resetFilters();
    setFilters(patch);
    navigate('/tasks');
  };

  const todayDone = today.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-4">
        <RutteLogo className="w-12 shrink-0 sm:w-14" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground/60 first-letter:uppercase">
            {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
            {scope !== 'ALL' && <> · {scope === 'PERSONAL' ? 'Pessoal' : 'Empresa'}</>}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting(now)}
            {nick && `, ${nick}`}! <span className="wave">👋</span>
          </h1>
          <p className="relative mt-2 inline-block rounded-2xl rounded-tl-sm bg-muted px-4 py-2 text-sm text-foreground/80">
            <strong className="font-brand text-primary dark:text-neon dark:text-glow">Rutte:</strong>{' '}
            {isLoading
              ? 'Organizando seus afazeres…'
              : overdue.length
                ? `você tem ${overdue.length} ${overdue.length === 1 ? 'afazer atrasado' : 'afazeres atrasados'}. Vamos resolver isso primeiro?`
                : today.length
                  ? `${todayDone} de ${today.length} afazeres de hoje concluídos. Continue assim!`
                  : 'nada para hoje. Que tal planejar a semana ou revisar sua Roda da Vida?'}
          </p>
          {user?.struggle && (
            <p className="mt-2 flex max-w-2xl items-start gap-2 text-sm text-foreground/70">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
              <span>
                <strong className="text-foreground">Dica de hoje:</strong> {tipOfTheDay(user.struggle, now)}
              </span>
            </p>
          )}
        </div>
      </header>

      <section aria-label="Indicadores" className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi label="Tarefas hoje" value={today.length} icon={ListTodo} onClick={() => goTasks({ date: 'TODAY' })} />
        <Kpi label="Atrasadas" value={overdue.length} icon={TriangleAlert} tone="danger" onClick={() => goTasks({ date: 'OVERDUE' })} />
        <Kpi label="Em andamento" value={inProgress.length} icon={CirclePlay} onClick={() => goTasks({ statuses: ['IN_PROGRESS'] })} />
        <Kpi label="Concluídas" value={completed.length} icon={CircleCheck} tone="success" onClick={() => goTasks({ statuses: ['COMPLETED'] })} />
      </section>

      {user && user.goals.length > 0 ? (
        <GoalsSummary goals={user.goals} />
      ) : (
        <section aria-label="Personalização" className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
          <WandSparkles className="size-6 shrink-0 text-primary dark:text-neon" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Deixe a Rutte do seu jeito</p>
            <p className="text-sm text-foreground/70">Responda 6 perguntas rápidas e ela ajusta menus, afazeres, horários e dicas aos seus objetivos.</p>
          </div>
          <Button onClick={() => setOnboardingOpen(true)}>
            <WandSparkles /> Responder agora
          </Button>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="prio-title" className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="prio-title" className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5 text-primary icon-glow dark:text-neon" aria-hidden /> Sua prioridade agora
            </h2>
            <Link to="/tasks" onClick={resetFilters} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Ver todas <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          {priorityNow.length === 0 && !isLoading && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <CircleCheck className="mx-auto size-10 text-emerald-500" aria-hidden />
              <p className="mt-2 font-semibold">Tudo em dia!</p>
              <p className="text-sm text-foreground/60">Nada atrasado, vencendo hoje ou reuniões nos próximos dias.</p>
            </div>
          )}

          {(['OVERDUE', 'TODAY', 'MEETING'] as const).map((g) => {
            const items = priorityNow.filter((p) => p.group === g);
            if (!items.length) return null;
            const { label, icon: Icon, cls } = GROUP_META[g];
            return (
              <div key={g} className="space-y-2">
                <h3 className={cn('flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide', cls)}>
                  <Icon className="size-4" aria-hidden /> {label}
                  <span className="text-foreground/40">· {items.length}</span>
                </h3>
                <div className="stagger space-y-2">
                  {items.map(({ task }) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <div className="space-y-6">
        <section aria-labelledby="agenda-title" className="h-fit rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 id="agenda-title" className="flex items-center gap-2 text-lg font-bold">
              <CalendarClock className="size-5 text-primary icon-glow dark:text-neon" aria-hidden /> Agenda de hoje
            </h2>
            <Link to="/calendar" className="text-sm font-semibold text-primary hover:underline">
              Calendário
            </Link>
          </div>
          {agenda.length === 0 ? (
            <p className="mt-4 text-sm text-foreground/60">Nenhum compromisso com horário hoje.</p>
          ) : (
            <ol className="mt-4 space-y-1">
              {agenda.map((t) => {
                const past = isOverdue(t, now);
                return (
                  <li key={t.id}>
                    <div
                      className={cn(
                        'flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted',
                        past && 'opacity-60',
                      )}
                    >
                      <button type="button" onClick={() => openTask(t.id)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                        <span className="w-12 shrink-0 pt-0.5 text-sm font-bold tabular-nums">{t.deadlineTime ?? '—'}</span>
                        <span className={cn('w-1 self-stretch rounded-full', t.meetingUrl ? 'bg-primary' : 'bg-border')} aria-hidden />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{t.title}</span>
                          <span className="flex items-center gap-1 text-xs text-foreground/60">
                            {t.meetingUrl ? (
                              <>
                                <Video className="size-3" aria-hidden /> Reunião
                              </>
                            ) : t.location ? (
                              <>
                                <MapPin className="size-3 shrink-0" aria-hidden /> <span className="truncate">{shortPlace(t.location)}</span>
                              </>
                            ) : (
                              'Prazo'
                            )}
                            {past && ' · horário passou'}
                          </span>
                        </span>
                      </button>
                      {t.location && !t.meetingUrl && (
                        <a
                          href={directionsUrl(t.location)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-neon inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white"
                          aria-label={`Como chegar: ${t.location.address}`}
                        >
                          <Navigation className="size-3" aria-hidden /> Ir
                        </a>
                      )}
                      {t.meetingUrl && (
                        <a
                          href={t.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-neon shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white"
                          aria-label={`Entrar na reunião ${t.title}`}
                        >
                          Entrar
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
        {modules.life && <WheelSummary />}
        </div>
      </div>
    </div>
  );
}

/** Resumo da Roda da Vida: média e área mais fraca da última avaliação. */
function WheelSummary() {
  const { data: assessments = [] } = useWheelAssessments();
  const latest = assessments.at(-1);
  const weakest = latest ? [...LIFE_AREAS].sort((a, b) => latest.scores[a.id] - latest.scores[b.id])[0] : undefined;
  const average = latest ? LIFE_AREAS.reduce((s, a) => s + latest.scores[a.id], 0) / LIFE_AREAS.length : 0;
  return (
    <section aria-labelledby="wheel-sum" className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 id="wheel-sum" className="flex items-center gap-2 text-lg font-bold">
          <ChartPie className="size-5 text-primary icon-glow dark:text-neon" aria-hidden /> Roda da Vida
        </h2>
        <Link to="/life" className="text-sm font-semibold text-primary hover:underline">Abrir</Link>
      </div>
      {latest && weakest ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold tabular-nums">{average.toFixed(1)}</span>
            <span className="pb-1 text-sm text-foreground/60">de média</span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
            {LIFE_AREAS.map((a) => (
              <span key={a.id} style={{ width: `${latest.scores[a.id]}%`, background: a.color }}
                title={`${a.short}: ${latest.scores[a.id]}`} />
            ))}
          </div>
          <p className="flex items-center gap-2 text-sm">
            <weakest.icon className="size-4 shrink-0" style={{ color: weakest.color }} aria-hidden />
            <span>
              Precisa de atenção: <strong>{weakest.name}</strong> ({latest.scores[weakest.id]}/10)
            </span>
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-foreground/60">Faça sua primeira avaliação para ver seu equilíbrio.</p>
      )}
    </section>
  );
}

/** Objetivos escolhidos na personalização, com o andamento de cada um nesta semana. */
function GoalsSummary({ goals }: { goals: GoalId[] }) {
  const { data: tasks = [] } = useTasks();
  const setFilters = useUI((s) => s.setFilters);
  const resetFilters = useUI((s) => s.resetFilters);
  const navigate = useNavigate();
  const weekAgo = Date.now() - 7 * 86_400_000;

  return (
    <section aria-labelledby="goals-title" className="space-y-3">
      <h2 id="goals-title" className="flex items-center gap-2 text-lg font-bold">
        <Target className="size-5 text-primary icon-glow dark:text-neon" aria-hidden /> Seus objetivos
      </h2>
      <ul className={cn('grid grid-cols-1 gap-3', goals.length === 2 ? 'sm:grid-cols-2' : goals.length >= 3 ? 'sm:grid-cols-3' : '')}>
        {goals.map((g) => {
          const def = GOALS[g];
          const Icon = def.icon;
          const related = tasks.filter((t) => t.lifeAreaId && def.areas.includes(t.lifeAreaId));
          const open = related.filter((t) => !isClosed(t)).length;
          const doneWeek = related.filter((t) => t.completedAt && new Date(t.completedAt).getTime() >= weekAgo).length;
          return (
            <li key={g}>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setFilters({ lifeAreaIds: def.areas });
                  navigate('/tasks');
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-neon hover:shadow-neon"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary dark:text-neon">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{def.label}</span>
                  <span className="block text-xs text-foreground/60">
                    {doneWeek} {doneWeek === 1 ? 'feito' : 'feitos'} nesta semana · {open} {open === 1 ? 'aberto' : 'abertos'}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-foreground/40" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
