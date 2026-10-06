import { addDays, startOfDay } from 'date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { useTasks } from '@/hooks/use-data';
import { useGoogleEvents } from '@/hooks/use-google';
import { checkAlerts } from '@/lib/alerts';

/** Verifica os alertas a cada 30 s e sempre que a Rutte volta para a tela. */
export function useAlertsRunner() {
  const { data: tasks = [] } = useTasks();
  const day = startOfDay(new Date()).getTime();
  const [from, to] = useMemo(() => [new Date(day), addDays(new Date(day), 2)], [day]);
  const { data: events = [] } = useGoogleEvents(from, to);
  const latest = useRef({ tasks, events });
  latest.current = { tasks, events };

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
}
