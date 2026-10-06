import { addDays, startOfDay } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/use-data';
import { useGoogleEvents } from '@/hooks/use-google';
import { checkAlerts, firePushMessage, getAlertSettings, planAlerts } from '@/lib/alerts';
import { pushSupported, syncReminders } from '@/lib/push';

/**
 * Verifica os alertas a cada 30 s (e quando a Rutte volta para a tela) e, se o push estiver ligado,
 * mantém no servidor a lista dos próximos 7 dias para avisar mesmo com o app fechado.
 */
export function useAlertsRunner() {
  const navigate = useNavigate();
  const { data: tasks = [] } = useTasks();
  const day = startOfDay(new Date()).getTime();
  const [from, to] = useMemo(() => [new Date(day), addDays(new Date(day), 2)], [day]);
  const { data: events = [] } = useGoogleEvents(from, to);
  const latest = useRef({ tasks, events });
  latest.current = { tasks, events };

  // verificação local
  useEffect(() => {
    const run = () => void checkAlerts(latest.current.tasks, latest.current.events);
    run();
    const id = window.setInterval(run, 30_000);
    const onVis = () => document.visibilityState === 'visible' && run();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // "Abrir" no aviso da tela e toques vindos do service worker
  useEffect(() => {
    const go = (e: Event) => navigate((e as CustomEvent<string>).detail || '/');
    window.addEventListener('rutte:navigate', go);
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; title?: string; body?: string; url?: string; tag?: string } | null;
      if (d?.type === 'rutte-push' && d.title) firePushMessage({ title: d.title, body: d.body, url: d.url, tag: d.tag });
    };
    navigator.serviceWorker?.addEventListener('message', onMsg);
    return () => {
      window.removeEventListener('rutte:navigate', go);
      navigator.serviceWorker?.removeEventListener('message', onMsg);
    };
  }, [navigate]);

  // lista dos próximos alertas no servidor (push com o app fechado)
  useEffect(() => {
    const s = getAlertSettings();
    if (!s.enabled || !s.push || !pushSupported()) return;
    const t = window.setTimeout(() => {
      const now = new Date();
      void syncReminders(planAlerts(tasks, events, now, addDays(now, 7), s)).catch(() => {});
    }, 2500);
    return () => window.clearTimeout(t);
  }, [tasks, events]);
}
