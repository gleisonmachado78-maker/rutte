/**
 * Google Agenda: login do Google direto no navegador (Google Identity Services, modelo de token) e API do Calendar.
 * Nada passa por servidor nosso: o token fica só neste aparelho e vale ~1 h (renovamos em silêncio quando dá).
 * O "Client ID" é público (vai no site). Ele vem de VITE_GOOGLE_CLIENT_ID ou do campo no menu "Google Agenda".
 */
import { addHours, formatISO, parseISO } from 'date-fns';
import type { Task } from '@/types';

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const CLIENT_KEY = 'rutte:gcal-client-id';
const TOKEN_KEY = 'rutte:gcal-token';
const WANT_KEY = 'rutte:gcal-on';

export interface GEvent {
  id: string;
  title: string;
  /** dia (yyyy-MM-dd) */
  date: string;
  /** "HH:mm" quando tem horário */
  time?: string;
  start: Date;
  allDay: boolean;
  link?: string;
  location?: string;
}

/* ----------------------------------------- configuração ----------------------------------------- */

const safe = <T,>(fn: () => T, fb: T): T => {
  try {
    return fn();
  } catch {
    return fb;
  }
};
export const getClientId = () => safe(() => localStorage.getItem(CLIENT_KEY), null) || ((import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '');
export const setClientId = (id: string) => safe(() => (id.trim() ? localStorage.setItem(CLIENT_KEY, id.trim()) : localStorage.removeItem(CLIENT_KEY)), undefined);
export const isConfigured = () => /\.apps\.googleusercontent\.com$/.test(getClientId());
/** a pessoa ligou a integração (tentamos renovar o token em silêncio) */
export const wantsGoogle = () => safe(() => localStorage.getItem(WANT_KEY) === '1', false);

/* -------------------------------------------- token -------------------------------------------- */

type Stored = { token: string; exp: number };
let mem: Stored | null = safe(() => JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null') as Stored | null, null);
const listeners = new Set<() => void>();
export const onGoogleChange = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const emit = () => listeners.forEach((f) => f());
export const hasToken = () => !!mem && mem.exp > Date.now() + 60_000;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
  }
}
let gisLoading: Promise<void> | null = null;
function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  gisLoading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisLoading = null;
      reject(new Error('Não consegui carregar o login do Google. Verifique a internet.'));
    };
    document.head.appendChild(s);
  });
  return gisLoading;
}

/** Pede o acesso. interactive=false tenta sem janela (só funciona se a pessoa já autorizou antes). */
export async function connectGoogle(interactive = true): Promise<void> {
  if (!isConfigured()) throw new Error('Falta configurar o Client ID do Google.');
  await loadGis();
  await new Promise<void>((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: getClientId(),
      scope: SCOPE,
      prompt: interactive ? '' : 'none',
      callback: (r: any) => {
        if (r.error || !r.access_token) return reject(new Error(r.error_description || r.error || 'Acesso negado.'));
        mem = { token: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1000 };
        safe(() => {
          localStorage.setItem(TOKEN_KEY, JSON.stringify(mem));
          localStorage.setItem(WANT_KEY, '1');
        }, undefined);
        emit();
        resolve();
      },
      error_callback: (e: any) => reject(new Error(e?.type === 'popup_closed' ? 'A janela do Google foi fechada.' : e?.message || 'Não foi possível conectar.')),
    });
    client.requestAccessToken();
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function disconnectGoogle() {
  const tok = mem?.token;
  mem = null;
  safe(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WANT_KEY);
  }, undefined);
  if (tok) window.google?.accounts?.oauth2?.revoke?.(tok, () => {});
  emit();
}

/** Garante um token válido (renova em silêncio quando possível). */
async function token(): Promise<string> {
  if (hasToken()) return mem!.token;
  if (!wantsGoogle()) throw new Error('Google Agenda não conectado.');
  await connectGoogle(false);
  return mem!.token;
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const tok = await token();
  const res = await fetch(url, { ...init, headers: { ...(init?.headers || {}), Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' } });
  if (res.status === 401) {
    mem = null;
    emit();
    throw new Error('O acesso ao Google expirou. Conecte de novo.');
  }
  if (!res.ok) throw new Error(`Google Agenda respondeu ${res.status}.`);
  return res.json() as Promise<T>;
}

/* -------------------------------------------- eventos -------------------------------------------- */

interface RawEvent {
  id: string;
  summary?: string;
  htmlLink?: string;
  location?: string;
  status?: string;
  start?: { date?: string; dateTime?: string };
}

export async function listEvents(from: Date, to: Date): Promise<GEvent[]> {
  const q = new URLSearchParams({ timeMin: from.toISOString(), timeMax: to.toISOString(), singleEvents: 'true', orderBy: 'startTime', maxResults: '250' });
  const data = await call<{ items?: RawEvent[] }>(`${API}?${q}`);
  return (data.items ?? [])
    .filter((e) => e.status !== 'cancelled' && (e.start?.date || e.start?.dateTime))
    .map((e) => {
      const allDay = !!e.start!.date;
      const start = allDay ? parseISO(e.start!.date!) : new Date(e.start!.dateTime!);
      return {
        id: e.id,
        title: e.summary || '(sem título)',
        date: formatISO(start, { representation: 'date' }),
        time: allDay ? undefined : start.toTimeString().slice(0, 5),
        start,
        allDay,
        link: e.htmlLink,
        location: e.location,
      };
    });
}

/** Cria no Google Agenda um evento a partir do afazer (1 h quando tem horário; senão, dia inteiro). */
export async function addTaskToGoogle(task: Task): Promise<string | undefined> {
  const desc = [task.description, task.whatToDo, task.meetingUrl && `Reunião: ${task.meetingUrl}`, 'Criado pela Rutte'].filter(Boolean).join('\n\n');
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let start: Record<string, string>, end: Record<string, string>;
  if (task.deadlineTime) {
    const s = parseISO(`${task.dueDate}T${task.deadlineTime}:00`);
    start = { dateTime: formatISO(s), timeZone: tz };
    end = { dateTime: formatISO(addHours(s, 1)), timeZone: tz };
  } else {
    const next = formatISO(addHours(parseISO(task.dueDate), 24), { representation: 'date' });
    start = { date: task.dueDate };
    end = { date: next };
  }
  const body = {
    summary: task.title,
    description: desc,
    location: task.location?.address ?? task.location?.name,
    start,
    end,
    reminders: { useDefault: true },
  };
  const ev = await call<RawEvent>(API, { method: 'POST', body: JSON.stringify(body) });
  return ev.htmlLink;
}
