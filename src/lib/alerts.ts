/**
 * Alertas no aparelho (notificações do sistema): aviso antes de cada afazer com horário, resumo da manhã e
 * eventos do Google Agenda. Funcionam com a Rutte aberta ou em segundo plano (aba/app minimizado); com o
 * app totalmente fechado o navegador não acorda a página — para isso seria preciso "push" vindo de um servidor.
 */
import { addMinutes, format, parseISO } from 'date-fns';
import type { GEvent } from './google-calendar';
import type { Task } from '@/types';

export interface AlertSettings {
  enabled: boolean;
  /** minutos de antecedência para afazeres e eventos com horário */
  lead: number;
  /** "HH:mm" do resumo do dia; vazio = sem resumo */
  morning: string;
}

const KEY = 'rutte:alerts';
const SENT = 'rutte:alerts-sent';
const DEFAULTS: AlertSettings = { enabled: false, lead: 15, morning: '08:00' };

const safe = <T,>(fn: () => T, fb: T): T => {
  try {
    return fn();
  } catch {
    return fb;
  }
};
export const getAlertSettings = (): AlertSettings => ({ ...DEFAULTS, ...safe(() => JSON.parse(localStorage.getItem(KEY) || '{}'), {}) });
export const saveAlertSettings = (s: AlertSettings) => safe(() => localStorage.setItem(KEY, JSON.stringify(s)), undefined);

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;
export const permission = (): NotificationPermission | 'unsupported' => (notificationsSupported() ? Notification.permission : 'unsupported');
export async function askPermission() {
  if (!notificationsSupported()) return 'unsupported' as const;
  return Notification.requestPermission();
}

/** Mostra a notificação pelo service worker (funciona melhor no celular); sem ele, usa a API simples. */
export async function notify(title: string, body: string, opts: { tag?: string; url?: string } = {}) {
  if (permission() !== 'granted') return false;
  const options: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
    body,
    tag: opts.tag,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: opts.url ?? './' },
    vibrate: [120, 60, 120],
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    /* cai para a API simples */
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------- quem já foi avisado (não repetir) -------------------------------- */

function sentSet(): Record<string, number> {
  return safe(() => JSON.parse(localStorage.getItem(SENT) || '{}'), {});
}
function markSent(key: string) {
  const all = sentSet();
  all[key] = Date.now();
  // guarda só os últimos 3 dias
  for (const [k, at] of Object.entries(all)) if (Date.now() - at > 3 * 864e5) delete all[k];
  safe(() => localStorage.setItem(SENT, JSON.stringify(all)), undefined);
}
const wasSent = (key: string) => key in sentSet();

/* --------------------------------------------- verificação --------------------------------------------- */

const isOpen = (t: Task) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED';

/** Roda a cada ~30 s: dispara o que estiver na hora. */
export async function checkAlerts(tasks: Task[], events: GEvent[], now = new Date()) {
  const s = getAlertSettings();
  if (!s.enabled || permission() !== 'granted') return;
  const today = format(now, 'yyyy-MM-dd');

  // 1) antes de cada afazer com horário
  for (const t of tasks) {
    if (!isOpen(t) || !t.deadlineTime) continue;
    const due = parseISO(`${t.dueDate}T${t.deadlineTime}:00`);
    const at = addMinutes(due, -s.lead);
    const key = `t:${t.id}:${t.dueDate}T${t.deadlineTime}`;
    if (now >= at && now.getTime() < due.getTime() + 30 * 60e3 && !wasSent(key)) {
      markSent(key);
      const mins = Math.max(0, Math.round((due.getTime() - now.getTime()) / 60e3));
      await notify(mins > 0 ? `⏰ Em ${mins} min: ${t.title}` : `⏰ Agora: ${t.title}`, t.meetingUrl ? 'Toque para abrir e entrar na reunião.' : t.location?.address ?? 'Toque para ver o afazer na Rutte.', { tag: key, url: './#/tasks' });
    }
  }

  // 2) eventos do Google Agenda
  for (const e of events) {
    if (e.allDay) continue;
    const at = addMinutes(e.start, -s.lead);
    const key = `g:${e.id}:${e.start.toISOString()}`;
    if (now >= at && now.getTime() < e.start.getTime() + 15 * 60e3 && !wasSent(key)) {
      markSent(key);
      const mins = Math.max(0, Math.round((e.start.getTime() - now.getTime()) / 60e3));
      await notify(mins > 0 ? `📅 Em ${mins} min: ${e.title}` : `📅 Agora: ${e.title}`, e.location ?? 'Evento do Google Agenda', { tag: key, url: e.link ?? './#/calendar' });
    }
  }

  // 3) resumo da manhã (uma vez por dia, a partir do horário escolhido)
  if (s.morning) {
    const key = `m:${today}`;
    const at = parseISO(`${today}T${s.morning}:00`);
    if (now >= at && now.getHours() < 23 && !wasSent(key)) {
      const open = tasks.filter(isOpen);
      const due = open.filter((t) => t.dueDate === today).length;
      const late = open.filter((t) => t.dueDate < today).length;
      const evs = events.filter((e) => e.date === today).length;
      markSent(key);
      if (due + late + evs > 0) {
        const parts = [due && `${due} afazer${due > 1 ? 'es' : ''} para hoje`, late && `${late} atrasado${late > 1 ? 's' : ''}`, evs && `${evs} evento${evs > 1 ? 's' : ''} na agenda`].filter(Boolean);
        await notify('☀️ Bom dia! Seu dia na Rutte', parts.join(' · '), { tag: key, url: './#/' });
      }
    }
  }
}
