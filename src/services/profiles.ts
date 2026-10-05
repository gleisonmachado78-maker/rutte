/**
 * Perfis das contas (tabela `profiles` no Supabase, SQL em `supabase/admin.sql`).
 * Cada pessoa só lê o próprio perfil; administradores leem e alteram todos e podem apagar contas.
 * Os dados de uso (afazeres, notas…) não passam por aqui — ficam no aparelho de cada um.
 */
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  /** nome definido pelo administrador (substitui o nome no aparelho da pessoa) */
  name_locked: boolean;
  role: 'user' | 'admin';
  blocked: boolean;
  note: string | null;
  created_at: string;
  last_seen: string | null;
}

/** Ao entrar: registra o acesso e devolve o perfil. `null` se a tabela ainda não existir ou sem internet. */
export async function touchProfile(localName: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('rutte_touch', { p_name: localName });
  if (error || !data) return null;
  return data as Profile;
}

export async function listProfiles(): Promise<Profile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export type ProfilePatch = Partial<Pick<Profile, 'name' | 'name_locked' | 'role' | 'blocked' | 'note'>>;

export async function updateProfile(id: string, patch: ProfilePatch): Promise<Profile> {
  if (!supabase) throw new Error('Sem conexão com o servidor.');
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function deleteAccount(id: string): Promise<void> {
  if (!supabase) throw new Error('Sem conexão com o servidor.');
  const { error } = await supabase.rpc('admin_delete_user', { p_id: id });
  if (error) throw new Error(error.message);
}
