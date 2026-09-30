import { Kanban, List, ListTodo, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFiltersBar } from '@/components/tasks/task-filters';
import { Button } from '@/components/ui/button';
import { useLookups, useScopedTasks } from '@/hooks/use-data';
import { activeFilterCount, filterTasks } from '@/lib/filter-tasks';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/ui';

export function TasksPage() {
  const { data: tasks = [], isLoading } = useScopedTasks();
  const lookups = useLookups();
  const filters = useUI((s) => s.filters);
  const viewMode = useUI((s) => s.viewMode);
  const setViewMode = useUI((s) => s.setViewMode);
  const openNewTask = useUI((s) => s.openNewTask);
  const resetFilters = useUI((s) => s.resetFilters);

  const filtered = useMemo(
    () => filterTasks(tasks, filters, lookups),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, filters, lookups.categories, lookups.projects],
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Afazeres</h1>
          <p className="text-sm text-foreground/60" aria-live="polite">
            {filtered.length} de {tasks.length} afazeres
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div role="radiogroup" aria-label="Modo de visualização" className="flex rounded-xl border border-border bg-card p-1">
            {(
              [
                { v: 'list', label: 'Lista', icon: List },
                { v: 'kanban', label: 'Kanban', icon: Kanban },
              ] as const
            ).map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={viewMode === v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all duration-200',
                  viewMode === v ? 'bg-navy text-white dark:bg-primary' : 'text-foreground/60 hover:text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
          <Button onClick={() => openNewTask()} className="hidden md:inline-flex">
            <Plus /> Novo afazer
          </Button>
        </div>
      </header>

      <TaskFiltersBar />

      {isLoading ? (
        <div className="space-y-2" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <ListTodo className="mx-auto size-10 text-foreground/30" aria-hidden />
          <p className="mt-3 font-semibold">Nenhum afazer encontrado</p>
          <p className="text-sm text-foreground/60">
            {activeFilterCount(filters) ? 'Tente ajustar a busca ou os filtros.' : 'Crie seu primeiro afazer.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {activeFilterCount(filters) > 0 && (
              <Button variant="outline" onClick={resetFilters}>Limpar filtros</Button>
            )}
            <Button onClick={() => openNewTask()}>
              <Plus /> Novo afazer
            </Button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={filtered} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <li key={t.id}>
              <TaskCard task={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
