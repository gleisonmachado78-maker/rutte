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
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin, Plus, Video } from 'lucide-react';
import { RouteLinks } from '@/components/tasks/location-field';
import { shortPlace } from '@/lib/maps';
import { useMemo, useState } from 'react';
import { PriorityBadge } from '@/components/tasks/badges';
import { Button } from '@/components/ui/button';
import { useScopedTasks } from '@/hooks/use-data';
import { dueDateTime, isClosed, isOverdue, toISODate } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/ui';
import type { Task } from '@/types';
import { LIFE_AREAS, LIFE_AREA_BY_ID } from '@/lib/life-areas';
import type { CSSProperties } from 'react';
import { useGoogleEvents, useGoogleStatus } from '@/hooks/use-google';
import { connectGoogle, type GEvent } from '@/lib/google-calendar';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const WEEK_OPTS = { weekStartsOn: 0 as const, locale: ptBR };

/** Cor da área da vida do afazer (barra lateral + fundo suave + brilho ao passar o mouse). */
function areaStyle(task: Task): CSSProperties | undefined {
  const c = task.lifeAreaId ? LIFE_AREA_BY_ID[task.lifeAreaId]?.color : undefined;
  if (!c) return undefined;
  return { '--area': c, borderLeftColor: c, backgroundColor: `color-mix(in srgb, ${c} 24%, transparent)` } as CSSProperties;
}

function CalendarItem({ task, compact }: { task: Task; compact?: boolean }) {
  const openTask = useUI((s) => s.openTask);
  const overdue = isOverdue(task);
  const closed = isClosed(task);
  const area = task.lifeAreaId ? LIFE_AREA_BY_ID[task.lifeAreaId] : undefined;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openTask(task.id);
      }}
      title={`${task.title}${area ? ` · ${area.short}` : ''}${overdue ? ' · atrasada' : ''}`}
      style={areaStyle(task)}
      className={cn(
        'flex w-full items-center gap-1 truncate rounded-md border-l-[3px] px-1.5 py-0.5 text-left text-[11px] font-semibold text-foreground transition-all duration-200 hover:-translate-y-px',
        area ? 'hover:shadow-[0_0_0_1px_var(--area),0_4px_12px_-4px_var(--area)]' : 'border-l-foreground/30 bg-muted hover:bg-border',
        closed && 'line-through opacity-50',
        !compact && 'py-1.5 text-xs',
      )}
    >
      {overdue && !closed && <span className="size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_6px_rgb(var(--neon))]" aria-hidden />}
      {task.meetingUrl && <Video className="size-3 shrink-0" aria-label="Reunião" />}
      {task.deadlineTime && <span className="shrink-0 tabular-nums opacity-80">{task.deadlineTime}</span>}
      <span className="truncate">{task.title}</span>
    </button>
  );
}

function GoogleItem({ ev }: { ev: GEvent }) {
  return (
    <a href={ev.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} title={`Google Agenda: ${ev.title}`} className="flex w-full items-center gap-1 truncate rounded-md bg-sky-600/90 px-1.5 py-0.5 text-left text-[11px] font-medium text-white hover:bg-sky-600">
      {ev.time && <span className="shrink-0 tabular-nums opacity-85">{ev.time}</span>}
      <span className="truncate">{ev.title}</span>
    </a>
  );
}

function DayList({ date, tasks, events = [] }: { date: Date; tasks: Task[]; events?: GEvent[] }) {
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
      {events.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Google Agenda">
          {events.map((ev) => (
            <li key={ev.id}>
              <a href={ev.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/[0.06] p-3 transition-colors hover:bg-sky-500/10">
                <span className="w-12 shrink-0 text-sm font-bold tabular-nums">{ev.time ?? 'Dia'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{ev.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-sky-700 dark:text-sky-300">
                    <CalendarDays className="size-3" aria-hidden /> Google Agenda
                    {ev.location && <span className="truncate text-foreground/55">· {ev.location}</span>}
                  </span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-foreground/40" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
      {tasks.length === 0 && events.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">Nada agendado neste dia.</p>
      ) : tasks.length === 0 ? null : (
        <ul className="mt-3 space-y-2">
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => openTask(t.id)}
                style={areaStyle(t)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border border-l-4 border-border p-3 text-left transition-all duration-200 hover:-translate-y-px',
                  t.lifeAreaId ? 'hover:shadow-[0_6px_18px_-8px_var(--area)]' : 'border-l-foreground/25 hover:bg-muted',
                  isClosed(t) && 'opacity-60',
                )}
              >
                <span className="w-12 shrink-0 text-sm font-bold tabular-nums">{t.deadlineTime ?? 'Dia'}</span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-sm font-medium', isClosed(t) && 'line-through')}>{t.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    {t.lifeAreaId && LIFE_AREA_BY_ID[t.lifeAreaId] && (() => {
                      const a = LIFE_AREA_BY_ID[t.lifeAreaId!];
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: a.color }}>
                          <a.icon className="size-3" aria-hidden /> {a.short}
                        </span>
                      );
                    })()}
                    <PriorityBadge priority={t.priority} />
                    {t.meetingUrl && (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground/60">
                        <Video className="size-3" aria-hidden /> Reunião
                      </span>
                    )}
                    {t.location && (
                      <span className="inline-flex min-w-0 items-center gap-1 text-xs text-foreground/60">
                        <MapPin className="size-3 shrink-0" aria-hidden /> <span className="truncate">{shortPlace(t.location)}</span>
                      </span>
                    )}
                  </span>
                </span>
              </button>
              {t.location && (
                <div className="mt-1.5 pl-[3.75rem]">
                  <RouteLinks location={t.location} compact />
                </div>
              )}
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

  const g = useGoogleStatus();
  const qc = useQueryClient();
  const gq = useGoogleEvents(days[0], addDays(days[days.length - 1], 1));
  const gByDay = useMemo(() => {
    const map = new Map<string, GEvent[]>();
    for (const e of gq.data ?? []) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return map;
  }, [gq.data]);
  const gFor = (d: Date) => gByDay.get(toISODate(d)) ?? [];
  const connectG = async () => {
    try {
      await connectGoogle(true);
      qc.invalidateQueries({ queryKey: ['gcal'] });
      toast.success('Google Agenda conectado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

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
  const usedAreas = new Set(days.flatMap((d) => itemsFor(d).map((t) => t.lifeAreaId)).filter(Boolean));

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
          {g.configured && (
            g.connected ? (
              <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 text-sm font-medium text-sky-700 dark:text-sky-300" title={gq.error instanceof Error ? gq.error.message : 'Google Agenda conectado'}>
                <CalendarDays className="size-4" aria-hidden /> {gq.isError ? <button type="button" onClick={connectG} className="underline">Reconectar Google</button> : 'Google conectado'}
              </span>
            ) : (
              <Button variant="outline" onClick={connectG}>
                <CalendarDays /> Conectar Google Agenda
              </Button>
            )
          )}
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
        {LIFE_AREAS.filter((a) => usedAreas.has(a.id)).map((a) => (
          <span key={a.id} className="inline-flex items-center gap-1.5">
            <span className="grid size-4 place-items-center rounded text-white" style={{ backgroundColor: a.color }}><a.icon className="size-2.5" aria-hidden /></span> {a.short}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded border-l-[3px] border-foreground/30 bg-muted" aria-hidden /> Sem área</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" aria-hidden /> Atrasada</span>
        <span className="inline-flex items-center gap-1.5"><Video className="size-3.5" aria-hidden /> Reunião</span>
        {g.connected && <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-sky-600" aria-hidden /> Google Agenda</span>}
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
              const gev = gFor(d);
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
                  aria-label={`${format(d, "d 'de' MMMM", { locale: ptBR })}, ${items.length + gev.length} itens`}
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
                    {gev.slice(0, 2).map((e) => <span key={e.id} className="size-1.5 rounded-full bg-sky-500" aria-hidden />)}
                    {items.slice(0, 4).map((t) => (
                      <span
                        key={t.id}
                        className={cn('size-1.5 rounded-full', !t.lifeAreaId && 'bg-foreground/40', isOverdue(t) && 'ring-1 ring-brand ring-offset-1 ring-offset-card')}
                        style={t.lifeAreaId ? { backgroundColor: LIFE_AREA_BY_ID[t.lifeAreaId]?.color } : undefined}
                        aria-hidden
                      />
                    ))}
                    {hasOverdue && <span className="sr-only">Possui atrasadas</span>}
                  </div>
                  <div className={'hidden flex-col gap-1 sm:flex'}>
                    {gev.slice(0, max).map((e) => <GoogleItem key={e.id} ev={e} />)}
                    {items.slice(0, Math.max(0, max - gev.length)).map((t) => (
                      <CalendarItem key={t.id} task={t} compact />
                    ))}
                    {items.length + gev.length > max && (
                      <span className="px-1 text-[11px] font-semibold text-foreground/60">+{items.length + gev.length - max} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DayList date={selected} tasks={itemsFor(selected)} events={gFor(selected)} />
      </div>
      <p className="hidden text-xs text-foreground/50 sm:block">Dica: dê um duplo clique em um dia para criar um afazer nele.</p>
    </div>
  );
}

