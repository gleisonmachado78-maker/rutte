import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Video } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PriorityBadge } from '@/components/tasks/badges';
import { Button } from '@/components/ui/button';
import { useScopedTasks } from '@/hooks/use-data';
import { dueDateTime, isClosed, isOverdue, toISODate } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/ui';
import type { Task } from '@/types';

const WEEK_OPTS = { weekStartsOn: 0 as const, locale: ptBR };

function CalendarItem({ task, compact }: { task: Task; compact?: boolean }) {
  const openTask = useUI((s) => s.openTask);
  const overdue = isOverdue(task);
  const closed = isClosed(task);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openTask(task.id);
      }}
      title={task.title}
      className={cn(
        'flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium transition-all duration-200',
        task.meetingUrl
          ? 'bg-navy text-white dark:bg-white/15'
          : overdue
            ? 'bg-brand text-white'
            : 'bg-muted text-foreground hover:bg-border',
        closed && 'line-through opacity-50',
        !compact && 'py-1.5 text-xs',
      )}
    >
      {task.meetingUrl && <Video className="size-3 shrink-0" aria-label="Reunião" />}
      {task.deadlineTime && <span className="shrink-0 tabular-nums opacity-80">{task.deadlineTime}</span>}
      <span className="truncate">{task.title}</span>
    </button>
  );
}

function DayList({ date, tasks }: { date: Date; tasks: Task[] }) {
  const openTask = useUI((s) => s.openTask);
  const openNewTask = useUI((s) => s.openNewTask);
  return (
    <section className="rounded-xl border border-border bg-card p-4" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="font-bold first-letter:uppercase">{format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}</h2>
        <Button size="sm" variant="outline" onClick={() => openNewTask({ dueDate: toISODate(date) })}>
          <Plus /> Adicionar
        </Button>
      </div>
      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">Nada agendado neste dia.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => openTask(t.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-all duration-200 hover:bg-muted',
                  isClosed(t) && 'opacity-60',
                )}
              >
                <span className="w-12 shrink-0 text-sm font-bold tabular-nums">{t.deadlineTime ?? 'Dia'}</span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-sm font-medium', isClosed(t) && 'line-through')}>{t.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={t.priority} />
                    {t.meetingUrl && (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground/60">
                        <Video className="size-3" aria-hidden /> Reunião
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CalendarPage() {
  const { data: tasks = [] } = useScopedTasks();
  const openNewTask = useUI((s) => s.openNewTask);
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = map.get(t.dueDate) ?? [];
      list.push(t);
      map.set(t.dueDate, list);
    }
    for (const list of map.values()) list.sort((a, b) => dueDateTime(a).getTime() - dueDateTime(b).getTime());
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    if (mode === 'week') return eachDayOfInterval({ start: startOfWeek(cursor, WEEK_OPTS), end: endOfWeek(cursor, WEEK_OPTS) });
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(cursor), WEEK_OPTS),
      end: endOfWeek(endOfMonth(cursor), WEEK_OPTS),
    });
  }, [cursor, mode]);

  const move = (dir: 1 | -1) => {
    const next = mode === 'month' ? addMonths(cursor, dir) : addWeeks(cursor, dir);
    setCursor(next);
    setSelected(mode === 'month' ? startOfMonth(next) : startOfWeek(next, WEEK_OPTS));
  };

  const goToday = () => {
    setCursor(new Date());
    setSelected(new Date());
  };

  const label =
    mode === 'month'
      ? format(cursor, 'MMMM yyyy', { locale: ptBR })
      : `${format(days[0], 'd MMM', { locale: ptBR })} – ${format(days[6], "d MMM yyyy", { locale: ptBR })}`;

  const weekdays = eachDayOfInterval({ start: startOfWeek(new Date(), WEEK_OPTS), end: addDays(startOfWeek(new Date(), WEEK_OPTS), 6) });
  const itemsFor = (d: Date) => byDay.get(toISODate(d)) ?? [];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Calendário</h1>
          <p className="text-sm capitalize text-foreground/60">{label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Visualização" className="flex rounded-xl border border-border bg-card p-1">
            {(['month', 'week'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  'h-8 rounded-lg px-3 text-sm font-medium transition-all duration-200',
                  mode === m ? 'bg-navy text-white dark:bg-primary' : 'text-foreground/60 hover:text-foreground',
                )}
              >
                {m === 'month' ? 'Mês' : 'Semana'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label={mode === 'month' ? 'Mês anterior' : 'Semana anterior'}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={goToday}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={() => move(1)} aria-label={mode === 'month' ? 'Próximo mês' : 'Próxima semana'}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60" aria-label="Legenda">
        <span className="inline-flex items-center gap-1.5"><span className="inline-flex size-4 items-center justify-center rounded bg-navy text-white dark:bg-white/15"><Video className="size-2.5" aria-hidden /></span> Reunião</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-brand" aria-hidden /> Atrasada</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-muted" aria-hidden /> Afazer</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/50">
            {weekdays.map((d) => (
              <div key={d.toISOString()} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
                <span className="sm:hidden">{format(d, 'EEEEE', { locale: ptBR })}</span>
                <span className="hidden sm:inline">{format(d, 'EEE', { locale: ptBR })}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7" role="grid" aria-label="Dias">
            {days.map((d) => {
              const items = itemsFor(d);
              const outside = mode === 'month' && !isSameMonth(d, cursor);
              const isSel = isSameDay(d, selected);
              const hasOverdue = items.some((t) => isOverdue(t));
              const max = mode === 'week' ? 8 : 3;
              return (
                <div
                  key={d.toISOString()}
                  role="gridcell"
                  tabIndex={0}
                  aria-selected={isSel}
                  aria-label={`${format(d, "d 'de' MMMM", { locale: ptBR })}, ${items.length} itens`}
                  onClick={() => setSelected(d)}
                  onDoubleClick={() => openNewTask({ dueDate: toISODate(d) })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(d);
                    }
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 border-b border-r border-border p-1 transition-colors duration-200 hover:bg-muted/50 [&:nth-child(7n)]:border-r-0 sm:p-1.5',
                    mode === 'month' ? 'min-h-16 sm:min-h-28' : 'min-h-24 sm:min-h-72',
                    outside && 'bg-muted/30 text-foreground/40',
                    isSel && 'bg-primary/5 ring-2 ring-inset ring-primary',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-7 place-items-center self-center rounded-full text-xs font-semibold sm:self-start',
                      isToday(d) && 'bg-primary text-white shadow-neon',
                    )}
                  >
                    {format(d, 'd')}
                  </span>
                  {/* Mobile: pontos; telas maiores: títulos */}
                  <div className={'flex flex-wrap justify-center gap-0.5 sm:hidden'}>
                    {items.slice(0, 4).map((t) => (
                      <span
                        key={t.id}
                        className={cn('size-1.5 rounded-full', t.meetingUrl ? 'bg-navy dark:bg-white' : isOverdue(t) ? 'bg-brand' : 'bg-foreground/40')}
                        aria-hidden
                      />
                    ))}
                    {hasOverdue && <span className="sr-only">Possui atrasadas</span>}
                  </div>
                  <div className={'hidden flex-col gap-1 sm:flex'}>
                    {items.slice(0, max).map((t) => (
                      <CalendarItem key={t.id} task={t} compact />
                    ))}
                    {items.length > max && (
                      <span className="px-1 text-[11px] font-semibold text-foreground/60">+{items.length - max} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DayList date={selected} tasks={itemsFor(selected)} />
      </div>
      <p className="hidden text-xs text-foreground/50 sm:block">Dica: dê um duplo clique em um dia para criar um afazer nele.</p>
    </div>
  );
}

