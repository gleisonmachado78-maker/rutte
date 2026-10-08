import { Building, Clock, FolderKanban, MapPin, UserRound, Link2, ListChecks, Paperclip, Repeat, Tag, Users, Video } from 'lucide-react';
import type { DragEvent } from 'react';
import { Checkbox } from '@/components/ui/form-controls';
import { useLookups, useUpdateTask } from '@/hooks/use-data';
import { isClosed, isOverdue, relativeDueLabel } from '@/lib/task-utils';
import { LIFE_AREA_BY_ID } from '@/lib/life-areas';
import { shortPlace } from '@/lib/maps';
import { cn } from '@/lib/utils';
import { isFresh } from '@/lib/fx';
import { useState } from 'react';
import { useUI } from '@/store/ui';
import type { Task } from '@/types';
import { ColorBadge, OverdueBadge, PriorityBadge, StatusBadge } from './badges';

interface Props {
  task: Task;
  variant?: 'list' | 'compact' | 'kanban';
  draggable?: boolean;
}

export function TaskCard({ task, variant = 'list', draggable }: Props) {
  const openTask = useUI((s) => s.openTask);
  const update = useUpdateTask();
  const { categoryById, projectById } = useLookups();
  const category = task.categoryId ? categoryById.get(task.categoryId) : undefined;
  const project = task.projectId ? projectById.get(task.projectId) : undefined;
  const done = task.status === 'COMPLETED';
  const closed = isClosed(task);
  const overdue = isOverdue(task);
  const subDone = task.subtasks.filter((s) => s.isCompleted).length;
  const scopeFilter = useUI((s) => s.scope);
  const lifeArea = task.lifeAreaId ? LIFE_AREA_BY_ID[task.lifeAreaId] : undefined;
  const hasAttachments = (task.attachments?.length ?? 0) > 0;
  // recém-criado: entra com um brilho (consulta só na montagem)
  const [fresh] = useState(() => isFresh(task.id));

  const toggle = (checked: boolean) =>
    update.mutate({
      id: task.id,
      patch: { status: checked ? 'COMPLETED' : 'NOT_STARTED' },
      silent: !checked,
    });

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData('text/task-id', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <article
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      className={cn(
        'group relative flex gap-3 rounded-xl border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg',
        done && 'bg-emerald-500/[0.06]',
        fresh && 'animate-pop-in [animation:pop-in_420ms_cubic-bezier(.2,.9,.3,1.2)_both,fresh-glow_1.4s_ease-out_2]',
        overdue ? 'border-brand/40 border-l-4 border-l-brand-neon shadow-[inset_4px_0_12px_-6px_rgb(255_46_59_/_0.6)]' : 'border-border',
        closed && 'opacity-60',
        draggable && 'cursor-grab active:cursor-grabbing',
        variant === 'compact' && 'p-3',
      )}
    >
      <div className="relative z-10 pt-0.5">
        <Checkbox
          checked={done}
          onCheckedChange={(v) => toggle(v === true)}
          aria-label={done ? `Reabrir "${task.title}"` : `Concluir "${task.title}"`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => openTask(task.id)}
          aria-label={`Abrir detalhes: ${task.title}`}
          className="block w-full text-left after:absolute after:inset-0 after:content-[''] focus-visible:ring-0"
        >
          <h3
            className={cn(
              'strike text-sm font-semibold leading-snug text-foreground sm:text-[15px]',
              done && 'strike-on',
            )}
          >
            {task.title}
          </h3>
        </button>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {overdue && <OverdueBadge />}
          {variant !== 'kanban' && task.status !== 'NOT_STARTED' && <StatusBadge status={task.status} />}
          {scopeFilter === 'ALL' && (
            <ColorBadge color={task.scope === 'BUSINESS' ? '#A855F7' : '#FF2E3B'} icon={task.scope === 'BUSINESS' ? Building : UserRound}>
              {task.scope === 'BUSINESS' ? 'Empresa' : 'Pessoal'}
            </ColorBadge>
          )}
          {category && (
            <ColorBadge color={category.color} icon={Tag}>
              {category.name}
            </ColorBadge>
          )}
          {lifeArea && variant !== 'compact' && (
            <ColorBadge color={lifeArea.color} icon={lifeArea.icon}>
              {lifeArea.short}
            </ColorBadge>
          )}
          {project && variant !== 'compact' && (
            <ColorBadge color={project.color} icon={FolderKanban}>
              {project.name}
            </ColorBadge>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/60">
          <span className={cn('inline-flex items-center gap-1', overdue && 'font-semibold text-brand dark:text-brand-neon')}>
            <Clock className="size-3.5" aria-hidden />
            <span className="sr-only">Prazo: </span>
            {relativeDueLabel(task)}
          </span>
          {task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1" title="Subtarefas concluídas">
              <ListChecks className="size-3.5" aria-hidden />
              {subDone}/{task.subtasks.length}
              <span className="sr-only"> subtarefas</span>
            </span>
          )}
          {task.location && (
            <span className="inline-flex min-w-0 max-w-[14rem] items-center gap-1" title={task.location.address}>
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{shortPlace(task.location)}</span>
            </span>
          )}
          {task.meetingUrl && (
            <span className="inline-flex items-center gap-1" title="Possui reunião">
              <Video className="size-3.5" aria-hidden />
              <span className={variant === 'kanban' ? 'sr-only' : ''}>Reunião</span>
            </span>
          )}
          {task.links.length > 0 && (
            <span className="inline-flex items-center gap-1" title="Links">
              <Link2 className="size-3.5" aria-hidden />
              {task.links.length}
              <span className="sr-only"> links</span>
            </span>
          )}
          {hasAttachments && (
            <span className="inline-flex items-center gap-1" title="Anexos">
              <Paperclip className="size-3.5" aria-hidden />
              {task.attachments!.length}
              <span className="sr-only"> anexos</span>
            </span>
          )}
          {(task.contactIds?.length ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1" title="Pessoas vinculadas">
              <Users className="size-3.5" aria-hidden />
              {task.contactIds!.length}
              <span className="sr-only"> pessoas</span>
            </span>
          )}
          {task.recurrenceRule && (
            <span className="inline-flex items-center gap-1" title="Recorrente">
              <Repeat className="size-3.5" aria-hidden />
              <span className="sr-only">Recorrente</span>
            </span>
          )}
        </div>

        {task.subtasks.length > 0 && variant === 'kanban' && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(subDone / task.subtasks.length) * 100}%` }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
