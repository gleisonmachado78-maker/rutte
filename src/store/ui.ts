import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LifeAreaId, Priority, Scope, TaskStatus } from '@/types';

export type DateFilter = 'ALL' | 'TODAY' | 'TOMORROW' | 'OVERDUE' | 'WEEK';

export interface TaskFilters {
  search: string;
  date: DateFilter;
  priorities: Priority[];
  statuses: TaskStatus[];
  categoryIds: string[];
  projectIds: string[];
  lifeAreaIds: LifeAreaId[];
  hideClosed: boolean;
}

export const EMPTY_FILTERS: TaskFilters = {
  search: '',
  date: 'ALL',
  priorities: [],
  statuses: [],
  categoryIds: [],
  projectIds: [],
  lifeAreaIds: [],
  hideClosed: false,
};

export interface TaskDefaults {
  dueDate?: string;
  scope?: Scope;
  lifeAreaId?: LifeAreaId;
}

export type ScopeFilter = 'ALL' | Scope;

export interface DrawerState {
  open: boolean;
  /** null = nova tarefa */
  taskId: string | null;
  /** valores iniciais para nova tarefa (ex: data clicada no calendário) */
  defaults?: TaskDefaults;
  /** muda a cada abertura para remontar o formulário */
  nonce: number;
}

interface UIState {
  theme: 'light' | 'dark';
  scope: ScopeFilter;
  setScope: (scope: ScopeFilter) => void;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  viewMode: 'list' | 'kanban';
  filters: TaskFilters;
  drawer: DrawerState;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  setViewMode: (mode: 'list' | 'kanban') => void;
  setFilters: (patch: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  openTask: (taskId: string) => void;
  openNewTask: (defaults?: DrawerState['defaults']) => void;
  closeDrawer: () => void;
}

const initialTheme = (): 'light' | 'dark' =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: initialTheme(),
      scope: 'ALL',
      setScope: (scope) => set({ scope }),
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      viewMode: 'list',
      filters: EMPTY_FILTERS,
      drawer: { open: false, taskId: null, nonce: 0 },
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileMenu: (open) => set({ mobileMenuOpen: open }),
      setViewMode: (viewMode) => set({ viewMode }),
      setFilters: (patch) => set((s) => ({ filters: { ...EMPTY_FILTERS, ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: EMPTY_FILTERS }),
      openTask: (taskId) =>
        set((s) => ({ drawer: { open: true, taskId, nonce: s.drawer.nonce + 1 } })),
      openNewTask: (defaults) =>
        set((s) => ({ drawer: { open: true, taskId: null, defaults, nonce: s.drawer.nonce + 1 } })),
      closeDrawer: () => set((s) => ({ drawer: { ...s.drawer, open: false } })),
    }),
    {
      name: 'secretaria:ui',
      // Garante campos novos de filtro quando o estado salvo é de uma versão anterior
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<UIState>;
        return { ...current, ...p, filters: { ...EMPTY_FILTERS, ...p.filters } };
      },
      partialize: (s) => ({
        theme: s.theme,
        scope: s.scope,
        sidebarCollapsed: s.sidebarCollapsed,
        viewMode: s.viewMode,
        filters: s.filters,
      }),
    },
  ),
);
