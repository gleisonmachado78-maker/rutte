import { BrowserRouter, HashRouter, Link, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthGate } from '@/components/auth/auth-gate';
import { ConfirmHost } from '@/components/ui/confirm';
import { UpdateDuck } from '@/components/layout/update-duck';
import { lazy, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { PrivacyPage, TermsPage } from '@/pages/public-pages';
import { LandingPage } from '@/pages/landing';
import { DashboardPage } from '@/pages/dashboard';
import { useUI } from '@/store/ui';

// Telas carregadas sob demanda: o início abre rápido e cada tela só é baixada quando você entra nela
const AdminPage = lazy(() => import('@/pages/admin').then((m) => ({ default: m.AdminPage })));
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })));
const AssistantPage = lazy(() => import('@/pages/assistant').then((m) => ({ default: m.AssistantPage })));
const CalendarPage = lazy(() => import('@/pages/calendar').then((m) => ({ default: m.CalendarPage })));
const FocusPage = lazy(() => import('@/pages/focus').then((m) => ({ default: m.FocusPage })));
const GymPage = lazy(() => import('@/pages/gym').then((m) => ({ default: m.GymPage })));
const LibraryPage = lazy(() => import('@/pages/library').then((m) => ({ default: m.LibraryPage })));
const GratitudePage = lazy(() => import('@/pages/gratitude').then((m) => ({ default: m.GratitudePage })));
const LifePage = lazy(() => import('@/pages/life').then((m) => ({ default: m.LifePage })));
const NotesPage = lazy(() => import('@/pages/notes').then((m) => ({ default: m.NotesPage })));
const LinksPage = lazy(() => import('@/pages/links').then((m) => ({ default: m.LinksPage })));
const TasksPage = lazy(() => import('@/pages/tasks').then((m) => ({ default: m.TasksPage })));


function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <p className="font-brand text-7xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-2xl font-bold">Esta página não existe</h1>
      <p className="mt-2 text-foreground/60">O endereço pode ter mudado ou foi digitado errado. Use o menu ao lado ou volte ao início.</p>
      <Link to="/" className="btn-neon mt-6 inline-flex h-11 items-center rounded-xl px-5 font-semibold text-white">
        Voltar ao início
      </Link>
    </div>
  );
}

// No HTML único (aberto via file://) a navegação usa #/rota
const Router = import.meta.env.MODE === 'single' ? HashRouter : BrowserRouter;

function PrivateRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="life" element={<LifePage />} />
        <Route path="gym" element={<GymPage />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="links" element={<LinksPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="gratitude" element={<GratitudePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const theme = useUI((s) => s.theme);
  // Alguns leitores de HTML (ex.: no iPhone) não guardam dados: avisa uma vez
  useEffect(() => {
    if (!api.storageAvailable()) {
      toast.warning('Este navegador não está salvando seus dados', {
        description: 'O que você cadastrar pode sumir ao fechar. Use outro navegador ou faça backup com frequência.',
        duration: 12000,
      });
    }
  }, []);
  return (
    <Router>
      <Routes>
        {/* páginas públicas (sem login) */}
        <Route path="/sobre" element={<LandingPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/termos" element={<TermsPage />} />
        <Route path="*" element={<AuthGate><PrivateRoutes /></AuthGate>} />
      </Routes>
      <ConfirmHost />
      <UpdateDuck />
      <Toaster
        theme={theme}
        position="top-center"
        richColors
        closeButton
        toastOptions={{ classNames: { toast: 'rounded-xl font-sans', actionButton: '!bg-primary !text-white' } }}
      />
    </Router>
  );
}
