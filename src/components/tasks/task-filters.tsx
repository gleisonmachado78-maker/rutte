import { ChevronDown, FilterX, Search, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { useLookups } from '@/hooks/use-data';
import { activeFilterCount } from '@/lib/filter-tasks';
import { LIFE_AREAS } from '@/lib/life-areas';
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { useUI, type DateFilter } from '@/store/ui';
import { PRIORITY_STYLE, STATUS_STYLE } from './badges';

const DATE_CHIPS: { value: DateFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'TOMORROW', label: 'Amanhã' },
  { value: 'OVERDUE', label: 'Atrasadas' },
  { value: 'WEEK', label: 'Próx. 7 dias' },
];

const chip =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all duration-200';
const chipIdle = 'border-border bg-background text-foreground/80 hover:bg-muted';
const chipActive = 'border-neon bg-primary text-white shadow-neon';

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function MultiChip({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(chip, count ? chipActive : chipIdle)}>
        {label}
        {count > 0 && (
          <span className="grid min-w-5 place-items-center rounded-full bg-white/25 px-1 text-xs">{count}</span>
        )}
        <ChevronDown className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function OptionIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-4 text-foreground/60" aria-hidden />;
}

export function TaskFiltersBar() {
  const filters = useUI((s) => s.filters);
  const setFilters = useUI((s) => s.setFilters);
  const resetFilters = useUI((s) => s.resetFilters);
  const { categories, projects } = useLookups();
  const [search, setSearch] = useState(filters.search);

  // Debounce leve da busca
  useEffect(() => {
    const id = setTimeout(() => setFilters({ search }), 150);
    return () => clearTimeout(id);
  }, [search, setFilters]);

  useEffect(() => {
    if (filters.search === '') setSearch('');
  }, [filters.search]);

  const count = activeFilterCount(filters);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground/40" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar afazeres, subtarefas, projetos…"
          aria-label="Buscar afazeres"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm transition-all duration-200 placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-foreground/50 hover:bg-muted"
            aria-label="Limpar busca"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]"
        role="toolbar"
        aria-label="Filtros rápidos"
      >
        {DATE_CHIPS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={filters.date === c.value}
            onClick={() => setFilters({ date: c.value })}
            className={cn(chip, filters.date === c.value ? chipActive : chipIdle)}
          >
            {c.label}
          </button>
        ))}

        <span className="mx-1 w-px shrink-0 self-stretch bg-border" aria-hidden />

        <MultiChip label="Prioridade" count={filters.priorities.length}>
          <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
          {PRIORITIES.map((p) => (
            <DropdownMenuCheckboxItem
              key={p}
              checked={filters.priorities.includes(p)}
              onCheckedChange={() => setFilters({ priorities: toggle(filters.priorities, p) })}
            >
              <OptionIcon icon={PRIORITY_STYLE[p].icon} />
              {PRIORITY_LABEL[p]}
            </DropdownMenuCheckboxItem>
          ))}
        </MultiChip>

        <MultiChip label="Status" count={filters.statuses.length}>
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {STATUSES.map((s) => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={filters.statuses.includes(s)}
              onCheckedChange={() => setFilters({ statuses: toggle(filters.statuses, s) })}
            >
              <OptionIcon icon={STATUS_STYLE[s].icon} />
              {STATUS_LABEL[s]}
            </DropdownMenuCheckboxItem>
          ))}
        </MultiChip>

        <MultiChip label="Categoria" count={filters.categoryIds.length}>
          <DropdownMenuLabel>Categoria</DropdownMenuLabel>
          {categories.map((c) => (
            <DropdownMenuCheckboxItem
              key={c.id}
              checked={filters.categoryIds.includes(c.id)}
              onCheckedChange={() => setFilters({ categoryIds: toggle(filters.categoryIds, c.id) })}
            >
              <span className="size-2.5 rounded-full" style={{ background: c.color }} aria-hidden />
              {c.name}
            </DropdownMenuCheckboxItem>
          ))}
        </MultiChip>

        <MultiChip label="Projeto" count={filters.projectIds.length}>
          <DropdownMenuLabel>Projeto</DropdownMenuLabel>
          {projects.map((p) => (
            <DropdownMenuCheckboxItem
              key={p.id}
              checked={filters.projectIds.includes(p.id)}
              onCheckedChange={() => setFilters({ projectIds: toggle(filters.projectIds, p.id) })}
            >
              <span className="size-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
              {p.name}
            </DropdownMenuCheckboxItem>
          ))}
        </MultiChip>

        <MultiChip label="Área da vida" count={filters.lifeAreaIds.length}>
          <DropdownMenuLabel>Área da vida</DropdownMenuLabel>
          {LIFE_AREAS.map((a) => (
            <DropdownMenuCheckboxItem
              key={a.id}
              checked={filters.lifeAreaIds.includes(a.id)}
              onCheckedChange={() => setFilters({ lifeAreaIds: toggle(filters.lifeAreaIds, a.id) })}
            >
              <a.icon className="size-4" style={{ color: a.color }} aria-hidden />
              {a.name}
            </DropdownMenuCheckboxItem>
          ))}
        </MultiChip>

        <button
          type="button"
          aria-pressed={filters.hideClosed}
          onClick={() => setFilters({ hideClosed: !filters.hideClosed })}
          className={cn(chip, filters.hideClosed ? chipActive : chipIdle)}
        >
          Ocultar concluídas
        </button>

        {count > 0 && (
          <button type="button" onClick={resetFilters} className={cn(chip, 'border-transparent text-primary hover:bg-primary/10')}>
            <FilterX className="size-4" aria-hidden />
            Limpar ({count})
          </button>
        )}
      </div>
    </div>
  );
}
