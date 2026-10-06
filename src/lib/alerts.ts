/**
 * Alertas da Rutte, sonoros e visuais:
 *  • dentro do app (tela aberta): aviso destacado na tela + som + vibração;
 *  • fora do app (minimizado): notificação do sistema com som;
 *  • com o app fechado: notificação por push enviada pelo servidor (ver lib/push.ts e supabase/push.sql).
 * Avisa X min antes de afazeres com horário e de eventos do Google Agenda, e manda o resumo da manhã.
 */
import { addMinutes, format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import type { GEvent } from './google-calendar';
import type { Task } from '@/types';

export interface AlertSettings {
  enabled: boolean;
  /** minutos de antecedência para afazeres e eventos com horário */
  lead: number;
  /** "HH:mm" do resumo do dia; vazio = sem resumo */
  morning: string;
  /** toca um som junto com o aviso */
  sound: boolean;
  /** também avisa com o app fechado (push pelo servidor) */
  push: boolean;
}

const KEY = 'rutte:alerts';
const SENT = 'rutte:alerts-sent';
const DEFAULTS: AlertSettings = { enabled: false, lead: 15, morning: '08:00', sound: true, push: false };

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

/* ------------------------------------------------ som ------------------------------------------------ */

let ctx: AudioContext | null = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
// navegadores só liberam som depois de um toque: destrava no primeiro clique
if (typeof window !== 'undefined') {
  const unlock = () => {
    audio();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

/** Toque curto e agradável (três notas subindo), gerado na hora — sem arquivo de áudio. */
export function playChime() {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + 0.02;
  [784, 988, 1319].forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    const t = t0 + i * 0.16;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + 0.6);
  });
}

/* ---------------------------------------------- avisar ---------------------------------------------- */

/** Notificação do sistema (pelo service worker, que funciona melhor no celular). */
export async function notify(title: string, body: string, opts: { tag?: string; url?: string; silent?: boolean } = {}) {
  if (permission() !== 'granted') return false;
  const options: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
    body,
    tag: opts.tag,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    silent: opts.silent ?? false,
    requireInteraction: true,
    data: { url: opts.url ?? './' },
    vibrate: [200, 100, 200],
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

/** Endereço do alerta: links externos abrem em nova aba; rotas da Rutte ("./#/tasks") navegam dentro do app. */
export function openAlertUrl(url: string) {
  if (/^https?:/.test(url)) return void window.open(url, '_blank', 'noopener');
  const path = url.replace(/^\.?\/?#?/, '/').replace(/^\/+/, '/');
  window.dispatchEvent(new CustomEvent('rutte:navigate', { detail: path }));
}

/**
 * Dispara um alerta completo: com a Rutte na tela, aviso destacado + som + vibração;
 * fora da tela, notificação do sistema (com som do aparelho) e o toque da Rutte.
 */
export async function fireAlert(title: string, body: string, opts: { tag?: string; url?: string } = {}) {
  const s = getAlertSettings();
  const visible = typeof document !== 'undefined' && document.visibilityState === 'visible';
  if (s.sound) playChime();
  if (visible) {
    navigator.vibrate?.([200, 100, 200]);
    toast(title, {
      description: body,
      duration: 20000,
      icon: '🔔',
      classNames: { toast: '!border-2 !border-primary !shadow-neon-lg', title: '!text-base !font-bold' },
      action: opts.url ? { label: 'Abrir', onClick: () => openAlertUrl(opts.url!) } : undefined,
    });
    return true;
  }
  return notify(title, body, { ...opts, silent: false });
}

/* -------------------------------- quem já foi avisado (não repetir) -------------------------------- */

function sentSet(): Record<string, number> {
  return safe(() => JSON.parse(localStorage.getItem(SENT) || '{}'), {});
}
function markSent(key: string) {
  const all = sentSet();
  all[key] = Date.now();
  for (const [k, at] of Object.entries(all)) if (Date.now() - at > 3 * 864e5) delete all[k];
  safe(() => localStorage.setItem(SENT, JSON.stringify(all)), undefined);
}
const wasSent = (key: string) => key in sentSet();

/** Push que chegou com a Rutte aberta na tela (o service worker repassa): mostra uma vez só. */
export function firePushMessage(d: { title: string; body?: string; url?: string; tag?: string }) {
  if (d.tag && wasSent(d.tag)) return;
  if (d.tag) markSent(d.tag);
  void fireAlert(d.title, d.body ?? '', { tag: d.tag, url: d.url });
}

/* ------------------------------------- lista dos próximos alertas ------------------------------------- */

const isOpen = (t: Task) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED';

export interface PlannedAlert {
  key: string;
  at: Date;
  /** quando o compromisso acontece (para o texto "Em X min") */
  due?: Date;
  title: string;
  body: string;
  url: string;
}

/** Todos os alertas previstos entre `from` e `to` (usado no app e enviado ao servidor para o push). */
export function planAlerts(tasks: Task[], events: GEvent[], from: Date, to: Date, s = getAlertSettings()): PlannedAlert[] {
  const out: PlannedAlert[] = [];
  const inRange = (d: Date) => d >= from && d <= to;
  for (const t of tasks) {
    if (!isOpen(t) || !t.deadlineTime) continue;
    const due = parseISO(`${t.dueDate}T${t.deadlineTime}:00`);
    const at = addMinutes(due, -s.lead);
    if (!inRange(at)) continue;
    out.push({
      key: `t:${t.id}:${t.dueDate}T${t.deadlineTime}`,
      at,
      due,
      title: s.lead > 0 ? `⏰ Em ${s.lead} min: ${t.title}` : `⏰ Agora: ${t.title}`,
      body: t.meetingUrl ? 'Toque para abrir e entrar na reunião.' : t.location?.address ?? 'Toque para ver o afazer na Rutte.',
      url: './#/tasks',
    });
  }
  for (const e of events) {
    if (e.allDay) continue;
    const at = addMinutes(e.start, -s.lead);
    if (!inRange(at)) continue;
    out.push({ key: `g:${e.id}:${e.start.toISOString()}`, at, due: e.start, title: s.lead > 0 ? `📅 Em ${s.lead} min: ${e.title}` : `📅 Agora: ${e.title}`, body: e.location ?? 'Evento do Google Agenda', url: e.link ?? './#/calendar' });
  }
  if (s.morning) {
    for (let d = new Date(from); d <= to; d = addMinutes(d, 24 * 60)) {
      const day = format(d, 'yyyy-MM-dd');
      const at = parseISO(`${day}T${s.morning}:00`);
      if (!inRange(at)) continue;
      const open = tasks.filter(isOpen);
      const due = open.filter((t) => t.dueDate === day).length;
      const late = open.filter((t) => t.dueDate < day).length;
      const evs = events.filter((e) => e.date === day).length;
      if (due + late + evs === 0) continue;
      const parts = [due && `${due} afazer${due > 1 ? 'es' : ''} para hoje`, late && `${late} atrasado${late > 1 ? 's' : ''}`, evs && `${evs} evento${evs > 1 ? 's' : ''} na agenda`].filter(Boolean);
      out.push({ key: `m:${day}`, at, title: '☀️ Bom dia! Seu dia na Rutte', body: parts.join(' · '), url: './#/' });
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** Roda a cada ~30 s com o app aberto/minimizado: dispara o que estiver na hora. */
export async function checkAlerts(tasks: Task[], events: GEvent[], now = new Date()) {
  const s = getAlertSettings();
  if (!s.enabled) return;
  // janela: o que venceu nos últimos 30 min (ou o resumo do dia, até 23 h)
  const due = planAlerts(tasks, events, addMinutes(now, -30), now, s).filter((a) => !wasSent(a.key));
  for (const a of due) {
    if (a.key.startsWith('m:') && now.getHours() >= 23) continue;
    markSent(a.key);
    let title = a.title;
    if (a.due) {
      const mins = Math.max(0, Math.round((a.due.getTime() - now.getTime()) / 60e3));
      title = title.replace(/Em \d+ min|Agora/, mins > 0 ? `Em ${mins} min` : 'Agora');
    }
    await fireAlert(title, a.body, { tag: a.key, url: a.url });
  }
}
