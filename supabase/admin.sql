-- Rutte — perfis e área do administrador (rode uma vez no Supabase: SQL Editor → New query → Run).
-- Cria a tabela `profiles` (uma linha por conta), dá o papel de administrador ao e-mail abaixo e libera para os
-- administradores: ver todas as contas, mudar nome, papel, bloqueio e observação, e apagar contas.
-- Os dados de uso de cada pessoa (afazeres, notas…) continuam só no aparelho dela.

-- 1) Tabela de perfis ------------------------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  name        text,
  name_locked boolean not null default false,   -- true = nome definido pelo administrador (vale no aparelho da pessoa)
  role        text not null default 'user' check (role in ('user', 'admin')),
  blocked     boolean not null default false,
  note        text,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz
);
alter table public.profiles enable row level security;

-- 2) É administrador? (security definer: evita recursão nas regras) -------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 3) Regras: cada um lê o próprio perfil; administrador lê e altera todos ------------------------------------
drop policy if exists "perfis: ler" on public.profiles;
drop policy if exists "perfis: admin altera" on public.profiles;
create policy "perfis: ler" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "perfis: admin altera" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4) Conta nova ganha perfil sozinha (o e-mail do dono já nasce administrador) ---------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, case when lower(new.email) = 'gleisonmachado78@gmail.com' then 'admin' else 'user' end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- contas que já existem
insert into public.profiles (id, email, role, created_at)
select id, email, case when lower(email) = 'gleisonmachado78@gmail.com' then 'admin' else 'user' end, created_at
from auth.users
on conflict (id) do nothing;

-- 5) Ao entrar: registra o último acesso e o nome que a pessoa usa; devolve o perfil -------------------------
create or replace function public.rutte_touch(p_name text) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare r public.profiles;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  insert into public.profiles (id, email) select id, email from auth.users where id = auth.uid() on conflict (id) do nothing;
  update public.profiles
     set last_seen = now(),
         name = case when name_locked or coalesce(trim(p_name), '') = '' then name else trim(p_name) end
   where id = auth.uid()
  returning * into r;
  return r;
end $$;

-- 6) Administrador apaga uma conta (não pode apagar a própria) -------------------------------------------------
create or replace function public.admin_delete_user(p_id uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'apenas administradores'; end if;
  if p_id = auth.uid() then raise exception 'você não pode apagar a própria conta'; end if;
  delete from auth.users where id = p_id;
end $$;

revoke all on function public.rutte_touch(text) from public, anon;
revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.rutte_touch(text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- 7) Sua conta (criada antes de desligar a confirmação) passa a valer sem confirmar o e-mail -----------------
update auth.users set email_confirmed_at = now()
 where lower(email) = 'gleisonmachado78@gmail.com' and email_confirmed_at is null;

-- 8) Administrador define uma nova senha para qualquer conta (e já deixa o e-mail confirmado) -----------------
create or replace function public.admin_set_password(p_id uuid, p_password text) returns void
language plpgsql security definer set search_path = public, auth, extensions as $$
begin
  if not public.is_admin() then raise exception 'apenas administradores'; end if;
  if length(coalesce(p_password, '')) < 6 then raise exception 'a senha precisa ter pelo menos 6 caracteres'; end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         updated_at = now()
   where id = p_id;
end $$;
revoke all on function public.admin_set_password(uuid, text) from public, anon;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
