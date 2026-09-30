import { addDays } from 'date-fns';
import type { TaskFilters } from '@/store/ui';
import type { Category, Project, Task } from '@/types';
import { LIFE_AREA_BY_ID } from './life-areas';
import {
  comparePriorityThenTime,
  isClosed,
  isDueToday,
  isDueTomorrow,
  isOverdue,
  todayISO,
  toISODate,
} from './task-utils';

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Aplica busca textual + combinação (AND entre grupos, OR dentro do grupo) dos chips. */
export function filterTasks(
  tasks: Task[],
  f: TaskFilters,
  lookups: { categoryById: Map<string, Category>; projectById: Map<string, Project> },
) {
  const q = normalize(f.search.trim());
  const now = new Date();
  const weekEnd = toISODate(addDays(now, 7));

  return tasks
    .filter((t) => {
      if (f.hideClosed && isClosed(t)) return false;
      switch (f.date) {
        case 'TODAY':
          if (!isDueToday(t)) return false;
          break;
        case 'TOMORROW':
          if (!isDueTomorrow(t)) return false;
          break;
        case 'OVERDUE':
          if (!isOverdue(t, now)) return false;
          break;
        case 'WEEK':
          if (t.dueDate < todayISO() || t.dueDate > weekEnd) return false;
          break;
      }
      if (f.priorities.length && !f.priorities.includes(t.priority)) return false;
      if (f.statuses.length && !f.statuses.includes(t.status)) return false;
      if (f.categoryIds.length && !(t.categoryId && f.categoryIds.includes(t.categoryId))) return false;
      if (f.projectIds.length && !(t.projectId && f.projectIds.includes(t.projectId))) return false;
      if (f.lifeAreaIds.length && !(t.lifeAreaId && f.lifeAreaIds.includes(t.lifeAreaId))) return false;
      if (q) {
        const hay = [
          t.title,
          t.description,
          t.whatToDo,
          t.howTo,
          t.expectedResult,
          t.categoryId && lookups.categoryById.get(t.categoryId)?.name,
          t.projectId && lookups.projectById.get(t.projectId)?.name,
          t.lifeAreaId && LIFE_AREA_BY_ID[t.lifeAreaId]?.name,
          ...t.subtasks.map((s) => s.title),
        ]
          .filter(Boolean)
          .join(' ');
        if (!normalize(hay).includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Abertas primeiro; depois por data e prioridade
      const ca = isClosed(a) ? 1 : 0;
      const cb = isClosed(b) ? 1 : 0;
      if (ca !== cb) return ca - cb;
      return comparePriorityThenTime(a, b);
    });
}

export function activeFilterCount(f: TaskFilters) {
  return (
    (f.date !== 'ALL' ? 1 : 0) +
    f.priorities.length +
    f.statuses.length +
    f.categoryIds.length +
    f.projectIds.length +
    f.lifeAreaIds.length +
    (f.hideClosed ? 1 : 0) +
    (f.search.trim() ? 1 : 0)
  );
}

