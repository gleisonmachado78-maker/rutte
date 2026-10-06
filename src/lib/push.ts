/**
 * Alertas com o app fechado (Web Push). O aparelho se inscreve no push do navegador e a Rutte envia ao
 * Supabase só a lista dos próximos alertas (horário, título e texto curto). Uma função no servidor
 * (supabase/functions/send-reminders) roda a cada minuto e manda a notificação na hora certa.
 * Requer login (Supabase) e o SQL em supabase/push.sql.
 */
import { supabase } from './supabase';
import type { PlannedAlert } from './alerts';

/** Chave pública VAPID (a privada fica só nos segredos da função no Supabase). */
export const VAPID_PUBLIC_KEY = 'BK9sgXITZJuqNiaSPDgFR_FN4Mwz2PcQNgdWJqBQn2GrVQFllZU8HpThnpjozBG1ClSFqGh5V66FHwfzCsLqdbk';

export const pushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && location.protocol === 'https:' && !!supabase;

function keyBytes(b64url: string) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
  const raw = atob((b64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Inscreve este aparelho no push e registra no servidor. */
export async function enablePush(): Promise<void> {
  if (!pushSupported()) throw new Error('Este navegador não aceita alertas com o app fechado. No iPhone, instale a Rutte na tela de início.');
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) });
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  const { error } = await supabase!.rpc('save_push_subscription', { p_endpoint: json.endpoint, p_p256dh: json.keys.p256dh, p_auth: json.keys.auth });
  if (error) throw new Error(error.message.includes('save_push_subscription') ? 'O servidor de alertas ainda não foi configurado.' : error.message);
}

/** Cancela o push deste aparelho e apaga os alertas pendentes no servidor. */
export async function disablePush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await supabase?.rpc('delete_push_subscription', { p_endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
  } finally {
    await supabase?.rpc('sync_reminders', { p_items: [] });
  }
}

/** Envia a lista dos próximos alertas (substitui os pendentes desta conta). */
export async function syncReminders(items: PlannedAlert[]): Promise<void> {
  if (!supabase) return;
  const payload = items.map((a) => ({ id: a.key, at: a.at.toISOString(), title: a.title, body: a.body, url: a.url }));
  const { error } = await supabase.rpc('sync_reminders', { p_items: payload });
  if (error) throw new Error(error.message);
}
