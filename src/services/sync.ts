/**
 * Sincronização dos dados da conta com o Supabase.
 * Modelo simples e robusto: o banco inteiro da pessoa é um JSON numa linha da tabela `rutte_data`
 * (protegida por RLS: cada um só lê e grava a própria linha). O app continua lendo/gravando no
 * armazenamento local (rápido e funciona offline) e cada mudança é enviada à nuvem com uma pequena pausa.
 */
import { cloudData, supabase } from '@/lib/supabase';
import { currentDb, readLocalDb, replaceLocalDb, setPersistListener, setStorageNamespace } from './api';
import { createEmpty } from './seed';

const TABLE = 'rutte_data';
export type SyncState = 'saved' | 'saving' | 'offline' | 'error';

let userId: string | null = null;
let timer = 0;
let state: SyncState = 'saved';
const listeners = new Set<(s: SyncState) => void>();
const setState = (s: SyncState) => {
  state = s;
  listeners.forEach((fn) => fn(s));
};
export const getSyncState = () => state;
export const onSyncState = (fn: (s: SyncState) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const k = (name: string) => `rutte:sync:${userId}:${name}`;
const getNum = (name: string) => Number(localStorage.getItem(k(name)) || 0);
const setVal = (name: string, v: string) => {
  try {
    localStorage.setItem(k(name), v);
  } catch {
    /* sem armazenamento */
  }
};

async function push() {
  window.clearTimeout(timer);
  timer = 0;
  if (!supabase || !userId || !cloudData) return;
  if (!navigator.onLine) {
    setState('offline');
    return;
  }
  setState('saving');
  const stamp = new Date().toISOString();
  const { error } = await supabase.from(TABLE).upsert({ user_id: userId, data: currentDb(), updated_at: stamp });
  if (error) {
    setState(navigator.onLine ? 'error' : 'offline');
    return;
  }
  setVal('dirty', '0');
  setVal('remote', String(Date.parse(stamp)));
  setState('saved');
}

function schedule() {
  setVal('dirty', '1');
  setVal('local', String(Date.now()));
  setState(navigator.onLine ? 'saving' : 'offline');
  window.clearTimeout(timer);
  timer = window.setTimeout(push, 1200);
}

const onOnline = () => {
  if (getNum('dirty')) push();
};
const onHide = () => {
  if (document.visibilityState === 'hidden' && timer) push();
};

/**
 * Liga a conta: escolhe o espaço local da pessoa, baixa os dados da nuvem (ou cria a conta vazia)
 * e passa a enviar as mudanças. Se estiver sem internet, segue com o que há no aparelho.
 */
export async function startSync(uid: string): Promise<void> {
  if (!supabase) return;
  userId = uid;
  setStorageNamespace(uid);
  setPersistListener(null);
  const local = readLocalDb();

  // Só login: os dados da conta ficam neste aparelho (cada conta no seu espaço), nada vai para a nuvem.
  if (!cloudData) {
    replaceLocalDb(local ?? createEmpty());
    setState('saved');
    return;
  }

  const { data, error } = await supabase.from(TABLE).select('data, updated_at').eq('user_id', uid).maybeSingle();
  if (error) {
    // sem conexão: usa o que já está no aparelho (se houver)
    if (!local) throw new Error(navigator.onLine ? `Não foi possível carregar seus dados (${error.message}).` : 'Sem internet para carregar seus dados pela primeira vez.');
    setState('offline');
  } else if (data) {
    const remoteTs = Date.parse(data.updated_at);
    const localNewer = local && getNum('dirty') && getNum('local') > remoteTs;
    if (localNewer) {
      replaceLocalDb(local);
      await push(); // mudanças feitas offline vencem
    } else {
      replaceLocalDb(data.data);
      setVal('dirty', '0');
      setVal('remote', String(remoteTs));
      setState('saved');
    }
  } else {
    // primeiro login: conta começa vazia (ou com o que já existia neste aparelho para esta conta)
    replaceLocalDb(local ?? createEmpty());
    await push();
  }

  setPersistListener(schedule);
  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onHide);
}

/** Envia o que estiver pendente (antes de sair). */
export async function flushSync() {
  if (timer || (userId && getNum('dirty'))) await push();
}

export function stopSync() {
  window.clearTimeout(timer);
  timer = 0;
  setPersistListener(null);
  window.removeEventListener('online', onOnline);
  document.removeEventListener('visibilitychange', onHide);
  userId = null;
  setStorageNamespace(null);
}
