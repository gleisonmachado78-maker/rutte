import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Priority, Task, TaskStatus } from '@/types';

export const PRIORITY_ORDER: Record<Priority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export const PRIORITY_LABEL: Record<Priority, string> = {
  URGENT: 'Urgente',
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  NOT_STARTED: 'Não iniciada',
  IN_PROGRESS: 'Em andamento',
  PAUSED: 'Pausada',
  BLOCKED: 'Bloqueada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export const STATUSES: TaskStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'PAUSED',
  'BLOCKED',
  'COMPLETED',
  'CANCELLED',
];
export const PRIORITIES: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export const RECURRENCE_OPTIONS = [
  { value: '', label: 'Não se repete' },
  { value: 'FREQ=DAILY', label: 'Diariamente' },
  { value: 'FREQ=WEEKLY', label: 'Semanalmente' },
  { value: 'FREQ=MONTHLY', label: 'Mensalmente' },
  { value: 'FREQ=YEARLY', label: 'Anualmente' },
];

export const todayISO = () => format(new Date(), 'yyyy-MM-dd');
export const toISODate = (d: Date) => format(d, 'yyyy-MM-dd');

export function isClosed(task: Task) {
  return task.status === 'COMPLETED' || task.status === 'CANCELLED';
}

/** Data/hora limite da tarefa (sem horário = fim do dia). */
export function dueDateTime(task: Task) {
  return parseISO(`${task.dueDate}T${task.deadlineTime || '23:59'}:00`);
}

export function isOverdue(task: Task, now = new Date()) {
  return !isClosed(task) && dueDateTime(task).getTime() < now.getTime();
}

export function isDueToday(task: Task) {
  return task.dueDate === todayISO();
}

export function isDueTomorrow(task: Task) {
  return task.dueDate === toISODate(addDays(new Date(), 1));
}

export function isMeeting(task: Task) {
  return Boolean(task.meetingUrl);
}

export function comparePriorityThenTime(a: Task, b: Task) {
  const t = dueDateTime(a).getTime() - dueDateTime(b).getTime();
  if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
    // Dentro do mesmo dia, prioridade manda; entre dias diferentes, a data vem primeiro.
    if (a.dueDate === b.dueDate) return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  }
  return t;
}

export type PriorityNowGroup = 'OVERDUE' | 'TODAY' | 'MEETING';

/** 1º Atrasadas, 2º Vencem hoje, 3º Reuniões próximas (7 dias). */
export function buildPriorityNow(tasks: Task[]) {
  const now = new Date();
  const open = tasks.filter((t) => !isClosed(t));
  const overdue = open.filter((t) => isOverdue(t, now)).sort(comparePriorityThenTime);
  const today = open
    .filter((t) => isDueToday(t) && !isOverdue(t, now))
    .sort(comparePriorityThenTime);
  const meetings = open
    .filter((t) => {
      if (!isMeeting(t) || isOverdue(t, now) || isDueToday(t)) return false;
      const diff = differenceInCalendarDays(parseISO(t.dueDate), now);
      return diff > 0 && diff <= 7;
    })
    .sort((a, b) => dueDateTime(a).getTime() - dueDateTime(b).getTime());

  return [
    ...overdue.map((task) => ({ task, group: 'OVERDUE' as const })),
    ...today.map((task) => ({ task, group: 'TODAY' as const })),
    ...meetings.map((task) => ({ task, group: 'MEETING' as const })),
  ];
}

export function relativeDueLabel(task: Task) {
  const d = parseISO(task.dueDate);
  let day: string;
  if (isToday(d)) day = 'Hoje';
  else if (isTomorrow(d)) day = 'Amanhã';
  else if (isYesterday(d)) day = 'Ontem';
  else {
    const diff = differenceInCalendarDays(d, new Date());
    day = Math.abs(diff) < 180 ? format(d, "EEE, d 'de' MMM", { locale: ptBR }) : format(d, 'dd/MM/yyyy');
  }
  return task.deadlineTime ? `${day} · ${task.deadlineTime}` : day;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Próxima data de uma regra simples de recorrência (FREQ=DAILY|WEEKLY|MONTHLY|YEARLY[;INTERVAL=n]). */
export function nextOccurrence(dateISO: string, rule: string): string | null {
  const parts = Object.fromEntries(
    rule.split(';').map((p) => p.split('=') as [string, string]),
  );
  const interval = Math.max(1, Number(parts.INTERVAL ?? 1) || 1);
  const d = parseISO(dateISO);
  switch (parts.FREQ) {
    case 'DAILY':
      return toISODate(addDays(d, interval));
    case 'WEEKLY':
      return toISODate(addWeeks(d, interval));
    case 'MONTHLY':
      return toISODate(addMonths(d, interval));
    case 'YEARLY':
      return toISODate(addYears(d, interval));
    default:
      return null;
  }
}

export function recurrenceLabel(rule?: string) {
  if (!rule) return null;
  return RECURRENCE_OPTIONS.find((o) => o.value === rule)?.label ?? rule;
}
