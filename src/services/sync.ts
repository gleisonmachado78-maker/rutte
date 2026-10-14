/**
 * Sincronização dos dados da conta com o Supabase.
 * Modelo simples e robusto: o banco inteiro da pessoa é um JSON numa linha da tabela `rutte_data`
 * (protegida por RLS: cada um só lê e grava a própria linha). O app continua lendo/gravando no
 * armazenamento local (rápido e funciona offline) e cada mudança é enviada à nuvem com uma pequena pausa.
 */
import { cloudData, supabase } from '@/lib/supabase';
import { currentDb, readLocalDb, replaceLocalDb, setPersistListener, setStorageNamespace } from './api';
import { createEmpty } from './seed';
import { contentSize, mergeValue } from './merge-db';

const TABLE = 'rutte_data';
export type SyncState = 'saved' | 'saving' | 'offline' | 'error' | 'local';
let cloudOff = false;

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
  if (!supabase || !userId || !cloudData || cloudOff) return;
  if (!navigator.onLine) {
    setState('offline');
    return;
  }
  setState('saving');
  const stamp = new Date().toISOString();
  const { error } = await supabase.from(TABLE).upsert({ user_id: userId, data: currentDb(), updated_at: stamp });
  if (error) {
    console.warn('[Rutte] não salvou na nuvem:', error.message);
    setVal('lastError', `${new Date().toISOString()} ${error.message}`);
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
    setState('local');
    return;
  }

  const { data, error } = await supabase.from(TABLE).select('data, updated_at').eq('user_id', uid).maybeSingle();
  // a tabela da nuvem ainda não foi criada no Supabase: segue só com o aparelho (não bloqueia o login)
  if (error && /PGRST205|42P01|schema cache|does not exist/i.test(`${error.code} ${error.message}`)) {
    cloudOff = true;
    replaceLocalDb(local ?? createEmpty());
    setState('local');
    return;
  }
  cloudOff = false;
  if (error) {
    // sem conexão: usa o que já está no aparelho (se houver)
    if (!local) throw new Error(navigator.onLine ? `Não foi possível carregar seus dados (${error.message}).` : 'Sem internet para carregar seus dados pela primeira vez.');
    setState('offline');
  } else if (data) {
    const remoteTs = Date.parse(data.updated_at);
    const firstLink = !getNum('remote'); // este aparelho nunca sincronizou esta conta
    const dirty = !!getNum('dirty');
    const differs = local && JSON.stringify(local) !== JSON.stringify(data.data);
    if (local && differs) {
      // cópia de segurança do que havia neste aparelho antes de mexer
      try {
        localStorage.setItem(k('backup'), JSON.stringify({ at: new Date().toISOString(), db: local }));
      } catch {
        /* sem espaço: segue */
      }
    }
    if (local && differs && (firstLink || dirty)) {
      // primeira vez neste aparelho (ou mudanças feitas sem internet): junta os dois lados, sem perder nada
      replaceLocalDb(mergeValue(local, data.data) as Parameters<typeof replaceLocalDb>[0]);
      await push();
    } else {
      replaceLocalDb(data.data);
      setVal('dirty', '0');
      setVal('remote', String(remoteTs));
      setState('saved');
    }
    await recoverBackup();
  } else {
    // primeiro login: conta começa vazia (ou com o que já existia neste aparelho para esta conta)
    replaceLocalDb(local ?? createEmpty());
    await push();
  }

  setPersistListener(schedule);
  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onHide);
}

/**
 * Recupera (uma única vez) a cópia de segurança deste aparelho, juntando-a com os dados atuais.
 * Corrige o caso em que outro aparelho, sem dados, chegou primeiro à nuvem e "escondeu" os daqui.
 */
async function recoverBackup() {
  if (localStorage.getItem(k('backup-merged'))) return;
  const raw = localStorage.getItem(k('backup'));
  setVal('backup-merged', '1');
  if (!raw) return;
  try {
    const { db } = JSON.parse(raw) as { db: unknown };
    const cur = currentDb();
    if (contentSize(db) === 0) return;
    const merged = mergeValue(db, cur) as typeof cur;
    if (JSON.stringify(merged) === JSON.stringify(cur)) return;
    replaceLocalDb(merged);
    await push();
  } catch {
    /* cópia ilegível: ignora */
  }
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
