import { BrowserRouter, HashRouter, Link, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthGate } from '@/components/auth/auth-gate';
import { ConfirmHost } from '@/components/ui/confirm';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { AdminPage } from '@/pages/admin';
import { AboutPage, PrivacyPage, TermsPage } from '@/pages/public-pages';
import { AssistantPage } from '@/pages/assistant';
import { CalendarPage } from '@/pages/calendar';
import { DashboardPage } from '@/pages/dashboard';
import { FocusPage } from '@/pages/focus';
import { GymPage } from '@/pages/gym';
import { LibraryPage } from '@/pages/library';
import { GratitudePage } from '@/pages/gratitude';
import { LifePage } from '@/pages/life';
import { NotesPage } from '@/pages/notes';
import { TasksPage } from '@/pages/tasks';
import { useUI } from '@/store/ui';

function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <p className="mt-2 text-foreground/60">Página não encontrada.</p>
      <Link to="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
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
        <Route path="library" element={<LibraryPage />} />
        <Route path="gratitude" element={<GratitudePage />} />
        <Route path="admin" element={<AdminPage />} />
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
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/termos" element={<TermsPage />} />
        <Route path="*" element={<AuthGate><PrivateRoutes /></AuthGate>} />
      </Routes>
      <ConfirmHost />
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
