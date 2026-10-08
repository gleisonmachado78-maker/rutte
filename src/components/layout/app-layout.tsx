import {
  Building,
  CalendarDays,
  ChartPie,
  DatabaseBackup,
  Dumbbell,
  Ellipsis,
  GraduationCap,
  HandHeart,
  Layers,
  LayoutDashboard,
  Library,
  ListTodo,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
  Timer,
  UserRound,
  WandSparkles,
  ShieldCheck,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DevCredit } from '@/components/brand/credit';
import { BRAND, RutteLogo } from '@/components/brand/rutte';
import { FocusEngine, FocusPill } from '@/components/focus/focus-engine';
import { Onboarding } from '@/components/onboarding/onboarding';
import { Tour, welcomeSteps } from '@/components/tour/tour';
import { useAuth } from '@/components/auth/auth-gate';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown';
import { Dialog, DialogTitle, SheetContent } from '@/components/ui/sheet';
import { useModules, useScopedTasks, useUser, useTutorialDone } from '@/hooks/use-data';
import { firstName } from '@/lib/onboarding';
import { isOverdue } from '@/lib/task-utils';
import { cn, initials } from '@/lib/utils';
import { useUI, type ScopeFilter } from '@/store/ui';
import { useAlertsRunner } from '@/hooks/use-alerts';

interface NavEntry {
  to: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  end?: boolean;
  personalOnly?: boolean;
  module?: 'gym' | 'life';
  group: 'organizar' | 'evoluir' | 'ajustes';
  /** aparece na barra inferior do celular (o resto fica em "Mais") */
  primary?: boolean;
}

const NAV: NavEntry[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true, group: 'organizar', primary: true },
  { to: '/tasks', label: 'Afazeres', icon: ListTodo, group: 'organizar', primary: true },
  { to: '/calendar', label: 'Calendário', short: 'Agenda', icon: CalendarDays, group: 'organizar', primary: true },
  { to: '/focus', label: 'Foco', icon: Timer, group: 'organizar', primary: true },
  { to: '/notes', label: 'Notas', icon: StickyNote, group: 'organizar' },
  { to: '/assistant', label: 'Rutte IA', short: 'IA', icon: Sparkles, group: 'organizar' },
  { to: '/life', label: 'Roda da Vida', short: 'Roda', icon: ChartPie, module: 'life', group: 'evoluir' },
  { to: '/gym', label: 'Academia', short: 'Treino', icon: Dumbbell, personalOnly: true, module: 'gym', group: 'evoluir' },
  { to: '/gratitude', label: 'Gratidão', icon: HandHeart, group: 'evoluir' },
  { to: '/library', label: 'Biblioteca', short: 'Livros', icon: Library, group: 'evoluir' },
  { to: '/settings', label: 'Configurações', short: 'Ajustes', icon: Settings, group: 'ajustes' },
];

const GROUP_LABEL = { organizar: 'Organizar', evoluir: 'Evoluir', ajustes: 'Ajustes' } as const;

/** Itens visíveis: respeita os módulos escolhidos e o contexto (Academia some no modo Empresa). */
function useNav() {
  const scope = useUI((s) => s.scope);
  const modules = useModules();
  return NAV.filter((n) => !(n.personalOnly && scope === 'BUSINESS') && (!n.module || modules[n.module]));
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
    <div role="radiogroup" aria-label="Contexto: pessoal ou empresa" className={cn('flex shrink-0 gap-0.5 rounded-lg bg-white/[0.06] p-0.5', collapsed && 'flex-col')}>
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
            'flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1.5 text-[11px] font-semibold transition-colors duration-200',
            collapsed && 'flex-none',
            compact ? 'h-7' : 'h-8',
            scope === value
              ? value === 'PERSONAL'
                ? 'bg-brand text-white'
                : value === 'BUSINESS'
                  ? 'bg-business text-white'
                  : 'bg-white text-navy'
              : 'text-white/60 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          {!collapsed && !(compact && value === 'ALL') && <span className={cn(compact && 'hidden min-[380px]:inline')}>{label}</span>}
        </button>
      ))}
    </div>
  );
}

function NavLinkItem({ entry, collapsed, onNavigate, badge }: { entry: NavEntry; collapsed?: boolean; onNavigate?: () => void; badge?: number }) {
  const { to, label, icon: Icon, end } = entry;
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      data-tour={`nav-${to}`}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'relative flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium [@media(max-height:820px)]:h-9 transition-colors duration-200',
          isActive ? 'bg-white/10 text-white before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-primary' : 'text-white/65 hover:bg-white/[0.06] hover:text-white',
          collapsed && 'justify-center px-0',
        )
      }
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      {!collapsed && <span>{label}</span>}
      {!!badge && (
        <span
          className={cn('grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white', collapsed ? 'absolute right-1 top-1' : 'ml-auto')}
          aria-label={`${badge} atrasadas`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function NavGroups({ collapsed, onNavigate, only }: { collapsed?: boolean; onNavigate?: () => void; only?: NavEntry[] }) {
  const { data: tasks = [] } = useScopedTasks();
  const overdue = tasks.filter((t) => isOverdue(t)).length;
  const visible = useNav();
  const nav = only ?? visible;
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-4">
      {(['organizar', 'evoluir', 'ajustes'] as const).map((g) => {
        const items = nav.filter((n) => n.group === g);
        if (!items.length) return null;
        return (
          <div key={g} className="stagger flex flex-col gap-0.5">
            {!collapsed && <span className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{GROUP_LABEL[g]}</span>}
            {items.map((n) => (
              <NavLinkItem key={n.to} entry={n} collapsed={collapsed} onNavigate={onNavigate} badge={n.to === '/tasks' ? overdue : undefined} />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

/** Nome da pessoa + menu de configurações (tema, personalizar, backup, exemplos). */
function AccountMenu({ collapsed }: { collapsed?: boolean }) {
  const { data: user } = useUser();
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const setTourOpen = useUI((s) => s.setTourOpen);
  const setMobileMenu = useUI((s) => s.setMobileMenu);
  const auth = useAuth();
  const navigate = useNavigate();
  const go = (to: string) => {
    setMobileMenu(false);
    navigate(to);
  };
  const name = user?.name && user.name !== 'Você' ? user.name : 'Você';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left text-white transition-colors hover:bg-white/[0.06]',
            collapsed && 'justify-center',
          )}
          aria-label="Configurações"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">{initials(name) || <UserRound className="size-4" />}</span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-semibold">{firstName(name)}</span>
                <span className="block text-[11px] text-white/45">Configurações</span>
              </span>
              <Settings className="size-4 shrink-0 text-white/45" aria-hidden />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-60">
          <DropdownMenuItem onSelect={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />} {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </DropdownMenuItem>
          {auth.isAdmin && (
            <DropdownMenuItem
              onSelect={() => {
                setMobileMenu(false);
                navigate('/admin');
              }}
            >
              <ShieldCheck /> Administração (contas)
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() => {
              setMobileMenu(false);
              setOnboardingOpen(true);
            }}
          >
            <WandSparkles /> Personalizar a Rutte
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setMobileMenu(false);
              setTourOpen(true);
            }}
          >
            <GraduationCap /> Ver tutorial de novo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => go('/settings')}>
            <Settings /> Configurações
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=alertas')}>
            <Bell /> Alertas no aparelho
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=google')}>
            <CalendarDays /> Google Agenda
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=ia')}>
            <Sparkles /> Rutte IA (Gemini ou Claude)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => go('/settings?tab=dados')}>
            <DatabaseBackup /> Backup e dados
          </DropdownMenuItem>
          {auth.email && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => auth.signOut()}>
                <LogOut /> <span className="min-w-0">Sair<span className="block truncate text-xs text-foreground/50">{auth.email}</span></span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function AppLayout() {
  const modules = useModules();
  const { data: user, isLoading: userLoading } = useUser();
  const onboardingOpen = useUI((s) => s.onboardingOpen);
  const setOnboardingOpen = useUI((s) => s.setOnboardingOpen);
  const setScope = useUI((s) => s.setScope);
  const scope = useUI((s) => s.scope);
  const theme = useUI((s) => s.theme);
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const mobileMenuOpen = useUI((s) => s.mobileMenuOpen);
  const setMobileMenu = useUI((s) => s.setMobileMenu);
  const openNewTask = useUI((s) => s.openNewTask);
  const location = useLocation();
  useAlertsRunner();
  const nav = useNav();
  const primary = nav.filter((n) => n.primary);
  const more = nav.filter((n) => !n.primary);
  const showOnboarding = onboardingOpen || (!userLoading && user === null);
  const tourOpen = useUI((s) => s.tourOpen);
  const setTourOpen = useUI((s) => s.setTourOpen);
  const tutorialDone = useTutorialDone();
  // Tutorial: na primeira vez (depois da personalização) ou quando pedido no menu
  const showTour = !showOnboarding && !!user && (tourOpen || !user.tutorialDoneAt);

  // Sem o módulo Empresa não há separação: mostra tudo
  useEffect(() => {
    if (!modules.business && scope !== 'ALL') setScope('ALL');
  }, [modules.business, scope, setScope]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const motion = useUI((s) => s.motion);
  useEffect(() => {
    document.documentElement.dataset.motion = motion;
  }, [motion]);

  // Contexto Empresa troca o acento da interface (vermelho → azul de mesmo tom)
  useEffect(() => {
    document.documentElement.dataset.scope = scope;
  }, [scope]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenu(false);
  }, [location.pathname, setMobileMenu]);

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
  const moreActive = more.some((n) => location.pathname.startsWith(n.to));

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>

      {/* Menu lateral (computador) */}
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden flex-col gap-5 bg-navy px-3 py-4 [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:py-3 transition-all duration-200 md:flex', collapsed ? 'w-[72px]' : 'w-60')}>
        <div className={cn('flex shrink-0 items-center gap-2.5 px-1', collapsed && 'flex-col')}>
          <RutteLogo className="w-9 shrink-0" />
          {!collapsed && (
            <span className="font-brand min-w-0 flex-1 truncate text-xl font-bold text-white" title={BRAND.tagline}>
              {BRAND.name}
            </span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <Button onClick={() => openNewTask()} className={cn('h-10 shrink-0', collapsed && 'px-0')} aria-label="Novo afazer" title="Novo afazer (N)" data-tour="new-task">
          <Plus className="!size-[18px]" /> {!collapsed && 'Novo afazer'}
        </Button>

        {modules.business && <ScopeSwitcher collapsed={collapsed} />}

        {/* em telas baixas (notebook) a lista rola e o rodapé com as configurações fica sempre visível */}
        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255_/_.15)_transparent]">
          <NavGroups collapsed={collapsed} />
        </div>

        <div className="shrink-0 border-t border-white/10 pt-3">
          <div data-tour="account">
            <AccountMenu collapsed={collapsed} />
          </div>
          {!collapsed && <DevCredit className="mt-2 px-2" />}
        </div>
      </aside>

      {/* Topo (celular) */}
      <header className="sticky top-0 z-20 flex h-[calc(3.25rem+env(safe-area-inset-top))] items-center gap-2.5 bg-navy px-4 pt-[env(safe-area-inset-top)] text-white md:hidden">
        <RutteLogo className="w-8" />
        <span className="font-brand truncate text-lg font-bold">{title ?? BRAND.name}</span>
        <div className="ml-auto">{modules.business && <ScopeSwitcher compact />}</div>
      </header>

      {/* "Mais" (celular): demais seções + configurações */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenu}>
        <SheetContent side="left" className="gap-5 bg-navy px-3 py-4" aria-describedby={undefined}>
          <DialogTitle className="flex items-center gap-2.5 px-1 text-white">
            <RutteLogo className="w-9" />
            <span className="font-brand text-xl font-bold">{BRAND.name}</span>
          </DialogTitle>
          {modules.business && <ScopeSwitcher />}
          <NavGroups onNavigate={() => setMobileMenu(false)} />
          <div className="mt-auto border-t border-white/10 pt-3">
            <AccountMenu />
            <DevCredit className="mt-2 px-2" />
          </div>
        </SheetContent>
      </Dialog>

      <main id="main" className={cn('pb-28 transition-all duration-200 md:pb-10', collapsed ? 'md:pl-[72px]' : 'md:pl-60')}>
        <div key={location.pathname} className="mx-auto w-full max-w-6xl animate-page-in px-4 py-5 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>

      {/* Barra inferior (celular): 4 atalhos + Mais */}
      <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-white/10 bg-navy pb-safe md:hidden">
        {primary.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            data-tour={`nav-${to}`}
            className={({ isActive }) => cn('flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors', isActive ? 'text-white' : 'text-white/45')}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('size-5', isActive && 'text-primary dark:text-neon')} aria-hidden />
                {short ?? label}
                <span className={cn('h-0.5 w-5 rounded-full', isActive ? 'bg-primary' : 'bg-transparent')} aria-hidden />
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMobileMenu(true)}
          data-tour="more"
          className={cn('flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors', moreActive ? 'text-white' : 'text-white/45')}
          aria-label="Mais opções"
        >
          <Ellipsis className={cn('size-5', moreActive && 'text-primary dark:text-neon')} aria-hidden />
          Mais
          <span className={cn('h-0.5 w-5 rounded-full', moreActive ? 'bg-primary' : 'bg-transparent')} aria-hidden />
        </button>
      </nav>

      {/* Botão flutuante (celular), fora da tela de Foco */}
      {location.pathname !== '/focus' && (
        <button
          type="button"
          onClick={() => openNewTask()}
          data-tour="new-task"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-12 items-center gap-1.5 rounded-full bg-primary pl-3.5 pr-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:brightness-110 active:scale-95 md:hidden"
          aria-label="Novo afazer"
        >
          <Plus className="size-5" aria-hidden />
          Novo Afazer
        </button>
      )}

      <TaskDrawer />
      <FocusEngine />
      <FocusPill />
      {showOnboarding && <Onboarding existing={user ?? null} onClose={() => setOnboardingOpen(false)} />}
      {showTour && (
        <Tour
          steps={welcomeSteps(user?.name && user.name !== 'Você' ? user.name.split(' ')[0] : '')}
          onFinish={(completed) => {
            setTourOpen(false);
            if (!user?.tutorialDoneAt) tutorialDone.mutate();
            if (completed) openNewTask();
          }}
        />
      )}
    </div>
  );
}
