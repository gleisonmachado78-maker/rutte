import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Conexão com o Supabase: login (e-mail e senha) e, se ligado, cópia dos dados na nuvem.
 * Usa VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY quando existem; senão, o projeto padrão da Rutte abaixo (assim o site
 * no Vercel tem login mesmo sem variáveis cadastradas). A chave "publishable" é feita para ficar no navegador — a proteção
 * são as regras (RLS) do banco. Nunca coloque aqui a chave secreta (service_role / secret).
 * O arquivo único para celular (modo "single") não usa o padrão: roda sem login, com os dados só no aparelho.
 */
const DEFAULT_URL = 'https://rpasribolewljtanpolu.supabase.co';
const DEFAULT_KEY = 'sb_publishable_Xkou8LFYPQ3l5eqo7E0O-w_UUHYaN-M';
const single = import.meta.env.MODE === 'single';
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || (single ? undefined : DEFAULT_URL);
export const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || (single ? undefined : DEFAULT_KEY);
const url = supabaseUrl;
const anon = supabaseKey;

export const cloudEnabled = !!(url && anon);
/**
 * Dados na nuvem: só com VITE_SUPABASE_SYNC=1. Por padrão o Supabase cuida apenas do login (a lista de quem
 * se cadastrou fica no painel) e os dados de cada conta ficam só no aparelho, separados por conta.
 */
export const cloudData = cloudEnabled && import.meta.env.VITE_SUPABASE_SYNC === '1';
/** Botão "Continuar com Google" (só se o provedor Google estiver ligado no Supabase). */
export const googleEnabled = cloudEnabled && import.meta.env.VITE_SUPABASE_GOOGLE === '1';

export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'rutte:auth' } })
  : null;

/** Endereço para onde os e-mails de confirmação/recuperação devolvem a pessoa. */
export const siteUrl = () => (location.protocol.startsWith('http') ? `${location.origin}/` : undefined);

/** Mensagens do Supabase em português. */
export function authErrorPt(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja a caixa de entrada e o spam).';
  if (m.includes('user already registered') || m.includes('already been registered')) return 'Esse e-mail já tem conta. Entre com a sua senha.';
  if (m.includes('password should be at least') || m.includes('weak password')) return 'A senha precisa ter pelo menos 6 caracteres (use letras e números).';
  if (m.includes('unable to validate email') || m.includes('invalid email') || m.includes('email address') && m.includes('invalid')) return 'Esse e-mail não parece válido.';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  if (m.includes('signups') && m.includes('disabled')) return 'Os cadastros estão fechados no momento. Fale com o administrador da Rutte.';
  if (m.includes('logins') && m.includes('disabled')) return 'O login por e-mail está desligado no momento. Fale com o administrador da Rutte.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor. Verifique a internet.';
  if (m.includes('same as the old') || m.includes('different from the old')) return 'A nova senha precisa ser diferente da anterior.';
  return message;
}
