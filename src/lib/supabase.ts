import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Conexão com o Supabase: login (e-mail e senha) e, se ligado, cópia dos dados na nuvem.
 * Só liga quando as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY existem (no .env local ou no Vercel).
 * Sem elas, a Rutte funciona como antes: sem login e com os dados só no navegador.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor. Verifique a internet.';
  if (m.includes('same as the old') || m.includes('different from the old')) return 'A nova senha precisa ser diferente da anterior.';
  return message;
}
