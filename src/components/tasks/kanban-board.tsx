import { useState, type DragEvent } from 'react';
import { useUpdateTask } from '@/hooks/use-data';
import { STATUSES, STATUS_LABEL } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import { STATUS_STYLE } from './badges';
import { TaskCard } from './task-card';

/** Kanban por status. Arraste um card para outra coluna para mudar o status (ou altere no detalhe). */
export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const update = useUpdateTask();
  const [over, setOver] = useState<TaskStatus | null>(null);

  const onDrop = (status: TaskStatus) => (e: DragEvent) => {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData('text/task-id');
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== status) update.mutate({ id, patch: { status } });
  };

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
      {STATUSES.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        const { icon: Icon, dot } = STATUS_STYLE[status];
        return (
          <section
            key={status}
            aria-label={`Coluna ${STATUS_LABEL[status]}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(status);
            }}
            onDragLeave={() => setOver((s) => (s === status ? null : s))}
            onDrop={onDrop(status)}
            className={cn(
              'flex w-[85vw] max-w-[320px] shrink-0 snap-start flex-col rounded-2xl border border-border bg-muted/40 transition-all duration-200 sm:w-72',
              over === status && 'border-primary bg-primary/5 ring-2 ring-primary/20',
            )}
          >
            <header className="flex items-center gap-2 px-4 py-3">
              <span className={cn('size-2 rounded-full', dot)} aria-hidden />
              <Icon className="size-4 text-foreground/60" aria-hidden />
              <h2 className="text-sm font-semibold">{STATUS_LABEL[status]}</h2>
              <span className="ml-auto rounded-full bg-background px-2 text-xs font-semibold text-foreground/60">
                {items.length}
              </span>
            </header>
            <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
              {items.map((t) => (
                <TaskCard key={t.id} task={t} variant="kanban" draggable />
              ))}
              {items.length === 0 && (
                <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-foreground/40">
                  Arraste afazeres para cá
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
