import { askConfirm } from '@/components/ui/confirm';
import {
  Building,
  DatabaseBackup,
  Timer,
  WandSparkles,
  Dumbbell,
  CalendarDays,
  ChartPie,
  Layers,
  LayoutDashboard,
  UserRound,
  ListTodo,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { BackupDialog } from './backup-dialog';
import { FocusEngine, FocusPill } from '@/components/focus/focus-engine';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, SheetContent } from '@/components/ui/sheet';
import { BRAND, RutteLogo } from '@/components/brand/rutte';
import { useModules, useResetData, useScopedTasks, useUser } from '@/hooks/use-data';
import { Onboarding } from '@/components/onboarding/onboarding';
import { isOverdue } from '@/lib/task-utils';
import { cn } from '@/lib/utils';
import { useUI, type ScopeFilter } from '@/store/ui';

const NAV: { to: string; label: string; short?: string; icon: LucideIcon; end?: boolean; personalOnly?: boolean; module?: 'gym' | 'life' }[] = [
  { to: '/', label: 'Dashboard', short: 'Início', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Afazeres', icon: ListTodo },
  { to: '/calendar', label: 'Calendário', icon: CalendarDays },
  { to: '/focus', label: 'Foco', icon: Timer },
  { to: '/life', label: 'Roda da Vida', short: 'Roda', icon: ChartPie, module: 'life' },
  { to: '/gym', label: 'Academia', short: 'Treino', icon: Dumbbell, personalOnly: true, module: 'gym' },
];

/** Itens visíveis: respeita os módulos escolhidos e o contexto (Academia some no modo Empresa). */
function useNav() {
  const scope = useUI((s) => s.scope);
  const modules = useModules();
  return NAV.filter((n) => !(n.personalOnly && scope === 'BUSINESS') && (!n.module || modules[n.module]));
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex w-full flex-col items-center gap-2 text-center">
      <RutteLogo glow className={collapsed ? 'w-12' : 'w-28'} />
      {!collapsed && (
        <span className="leading-tight">
          <span className="font-brand block text-3xl font-bold text-white">{BRAND.name}</span>
          <span className="block text-xs font-medium uppercase tracking-[0.18em] text-white/50">{BRAND.tagline}</span>
        </span>
      )}
    </div>
  );
}

const SCOPES: { value: ScopeFilter; label: string; icon: LucideIcon }[] = [
  { value: 'ALL', label: 'Todos', icon: Layers },
  { value: 'PERSONAL', label: 'Pessoal', icon: UserRound },
  { value: 'BUSINESS', label: 'Empresa', icon: Building },
];

/** Alterna o contexto global: tudo, só Pessoal (seu CPF) ou só Empresa. */
export function ScopeSwitcher({ collapsed, compact }: { collapsed?: boolean; compact?: boolean }) {
  const scope = useUI((s) => s.scope);
  const setScope = useUI((s) => s.setScope);
  return (
    <div
      role="radiogroup"
      aria-label="Contexto: pessoal ou empresa"
      className={cn('flex gap-1 rounded-xl bg-white/5 p-1', collapsed && 'flex-col')}
    >
      {SCOPES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={scope === value}
          aria-label={label}
          title={label}
          onClick={() => setScope(value)}
          className={cn(
            'flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition-all duration-200',
            compact ? 'h-8' : 'h-9',
            scope === value
              ? value === 'PERSONAL'
                ? 'bg-brand text-white shadow-neon-brand'
                : value === 'BUSINESS'
                  ? 'bg-business text-white shadow-[0_0_0_1px_rgb(46_139_255_/_.4),0_0_18px_rgb(46_139_255_/_.5)]'
                  : 'bg-white text-navy shadow'
              : 'text-white/60 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {!collapsed && !(compact && value === 'ALL') && <span className={cn(compact && 'hidden min-[380px]:inline')}>{label}</span>}
        </button>
      ))}
    </div>
  );
}

function NavItems({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { data: tasks = [] } = useScopedTasks();
  const overdue = tasks.filter((t) => isOverdue(t)).length;
  const nav = useNav();
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              'relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200',
              isActive ? 'btn-neon text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <Icon className="size-5 shrink-0" aria-hidden />
          {!collapsed && <span>{label}</span>}
          {to === '/tasks' && overdue > 0 && (
            <span
              className={cn(
                'grid min-w-5 place-items-center rounded-full bg-brand-neon px-1.5 text-[11px] font-bold text-white shadow-neon-brand',
                collapsed ? 'absolute right-1 top-1' : 'ml-auto',
              )}
              aria-label={`${overdue} atrasadas`}
            >
              {overdue}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({ collapsed }: { collapsed?: boolean }) {
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const reset = useResetData();
  const [backupOpen, setBackupOpen] = useState(false);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const setMobileMenu = useUI((s) => s.setMobileMenu);
  const btn = cn(
    'flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white',
    collapsed && 'justify-center px-0',
  );
  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={toggleTheme} className={btn} aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}>
        {theme === 'dark' ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
        {!collapsed && (theme === 'dark' ? 'Modo claro' : 'Modo escuro')}
      </button>
      <button
        type="button"
        className={btn}
        onClick={async () =>
          (await askConfirm({ title: 'Restaurar dados de exemplo?', message: 'Todos os seus afazeres, treinos e avaliações serão substituídos pelos exemplos. Faça um backup antes, se quiser guardar.', confirmLabel: 'Substituir tudo', danger: true })) &&
          reset.mutate()
        }
        aria-label="Restaurar dados de exemplo"
      >
        <RotateCcw className="size-5" aria-hidden />
        {!collapsed && 'Restaurar exemplos'}
      </button>
      <button type="button" className={btn} onClick={() => setBackupOpen(true)} aria-label="Backup dos dados">
        <DatabaseBackup className="size-5" aria-hidden />
        {!collapsed && 'Backup dos dados'}
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => {
          setMobileMenu(false);
          setOnboardingOpen(true);
        }}
        aria-label="Personalizar a Rutte"
      >
        <WandSparkles className="size-5" aria-hidden />
        {!collapsed && 'Personalizar a Rutte'}
      </button>
      <BackupDialog open={backupOpen} onOpenChange={setBackupOpen} />
    </div>
  );
}

export function AppLayout() {
  const modules = useModules();
  const { data: user, isLoading: userLoading } = useUser();
  const onboardingOpen = useUI((s) => s.onboardingOpen);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const setScope = useUI((s) => s.setScope);
  const currentScope = useUI((s) => s.scope);
  // Sem o módulo Empresa não há separação: mostra tudo
  useEffect(() => {
    if (!modules.business && currentScope !== 'ALL') setScope('ALL');
  }, [modules.business, currentScope, setScope]);
  const showOnboarding = onboardingOpen || (!userLoading && user === null);
  const theme = useUI((s) => s.theme);
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const mobileMenuOpen = useUI((s) => s.mobileMenuOpen);
  const setMobileMenu = useUI((s) => s.setMobileMenu);
  const openNewTask = useUI((s) => s.openNewTask);
  const location = useLocation();
  const nav = useNav();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Contexto Empresa troca o acento da interface (vermelho → azul de mesmo tom)
  const scope = useUI((s) => s.scope);
  useEffect(() => {
    document.documentElement.dataset.scope = scope;
  }, [scope]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Atalho: "n" abre um novo afazer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !el?.closest?.('input, textarea, select, [contenteditable], [role=dialog]')) {
        e.preventDefault();
        openNewTask();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openNewTask]);

  const title = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label;

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>

      {/* Sidebar desktop (retrátil) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col gap-6 bg-navy p-4 transition-all duration-200 md:flex',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
          <Brand collapsed={collapsed} />
        </div>
        <Button onClick={() => openNewTask()} className={cn('h-11', collapsed && 'px-0')} aria-label="Novo afazer" title="Novo afazer (N)">
          <Plus className="!size-5" /> {!collapsed && 'Novo afazer'}
        </Button>
        {modules.business && <ScopeSwitcher collapsed={collapsed} />}
        <NavItems collapsed={collapsed} />
        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
          <SidebarFooter collapsed={collapsed} />
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0',
            )}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            {!collapsed && 'Recolher'}
          </button>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="sticky top-0 z-20 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center gap-2 bg-navy px-2 pt-[env(safe-area-inset-top)] text-white md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileMenu(true)} aria-label="Abrir menu" className="hover:bg-white/10">
          <Menu className="!size-5" />
        </Button>
        <RutteLogo glow className="w-10" />
        <span className="font-brand truncate text-lg font-bold">{title ?? BRAND.name}</span>
        <div className="ml-auto">
          {modules.business && <ScopeSwitcher compact />}
        </div>
      </header>

      {/* Drawer de menu mobile */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenu}>
        <SheetContent side="left" className="gap-6 bg-navy p-4" aria-describedby={undefined} hideClose>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <Brand />
          {modules.business && <ScopeSwitcher />}
          <NavItems onNavigate={() => setMobileMenu(false)} />
          <div className="mt-auto border-t border-white/10 pt-4">
            <SidebarFooter />
          </div>
        </SheetContent>
      </Dialog>

      <main
        id="main"
        className={cn('pb-28 transition-all duration-200 md:pb-10', collapsed ? 'md:pl-20' : 'md:pl-64')}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>

      {/* Navegação inferior mobile */}
      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-20 grid border-t border-white/10 bg-navy pb-safe md:hidden"
        style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
      >
        {nav.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-white' : 'text-white/50',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-all', isActive && 'btn-neon')}>
                  <Icon className="size-5" aria-hidden />
                </span>
                {short ?? label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FAB mobile (fora da tela de Foco, onde atrapalharia o timer) */}
      {location.pathname !== '/focus' && (
      <button
        type="button"
        onClick={() => openNewTask()}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 items-center gap-2 rounded-full btn-neon pl-4 pr-5 font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 md:hidden"
        aria-label="Novo afazer"
      >
        <Plus className="size-6" aria-hidden />
        Novo Afazer
      </button>
      )}

      <TaskDrawer />
      <FocusEngine />
      <FocusPill />
      {showOnboarding && <Onboarding existing={user ?? null} onClose={() => setOnboardingOpen(false)} />}
    </div>
  );
}
