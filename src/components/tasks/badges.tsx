import {
  ArrowDown,
  ArrowUp,
  Ban,
  Circle,
  CircleCheck,
  CirclePause,
  CirclePlay,
  CircleX,
  Equal,
  Flame,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PRIORITY_LABEL, STATUS_LABEL } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/types';

const base =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5 whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0';

/** Ícone + texto em todos os badges (não depende só de cor — acessível para daltonismo). */
export const PRIORITY_STYLE: Record<Priority, { icon: LucideIcon; cls: string }> = {
  URGENT: { icon: Flame, cls: 'bg-brand text-white shadow-neon-brand' },
  HIGH: { icon: ArrowUp, cls: 'bg-wine text-white' },
  MEDIUM: { icon: Equal, cls: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300' },
  LOW: { icon: ArrowDown, cls: 'bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-300' },
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const { icon: Icon, cls } = PRIORITY_STYLE[priority];
  return (
    <span className={cn(base, cls, className)} title={`Prioridade ${PRIORITY_LABEL[priority]}`}>
      <Icon aria-hidden />
      <span className="sr-only">Prioridade </span>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export const STATUS_STYLE: Record<TaskStatus, { icon: LucideIcon; cls: string; dot: string }> = {
  NOT_STARTED: { icon: Circle, cls: 'bg-muted text-foreground/70', dot: 'bg-foreground/30' },
  IN_PROGRESS: { icon: CirclePlay, cls: 'bg-blue-100 text-blue-900 dark:bg-blue-400/15 dark:text-blue-300', dot: 'bg-blue-500' },
  PAUSED: { icon: CirclePause, cls: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300', dot: 'bg-amber-500' },
  BLOCKED: { icon: Ban, cls: 'bg-wine/10 text-wine dark:bg-brand/20 dark:text-red-300', dot: 'bg-wine' },
  COMPLETED: { icon: CircleCheck, cls: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-300', dot: 'bg-emerald-500' },
  CANCELLED: { icon: CircleX, cls: 'bg-muted text-foreground/50 line-through', dot: 'bg-foreground/20' },
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const { icon: Icon, cls } = STATUS_STYLE[status];
  return (
    <span className={cn(base, cls, className)}>
      <Icon aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ColorBadge({
  color,
  children,
  icon: Icon,
  className,
}: {
  color: string;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(base, 'border border-border bg-background font-medium text-foreground/80', className)}
    >
      {Icon ? (
        <Icon aria-hidden style={{ color }} />
      ) : (
        <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />
      )}
      {children}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className={cn(base, 'bg-brand/10 text-brand dark:bg-brand/25 dark:text-red-200')}>
      <TriangleAlert aria-hidden />
      Atrasada
    </span>
  );
}
