-- Rutte — tabela dos dados de cada conta (rode uma vez no Supabase: SQL Editor → New query → Run)
-- Cada pessoa tem UMA linha com todos os seus dados (JSON). Com RLS, ninguém lê nem altera os dados de outra pessoa.

create table if not exists public.rutte_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.rutte_data enable row level security;

drop policy if exists "rutte: ler os próprios dados" on public.rutte_data;
drop policy if exists "rutte: criar os próprios dados" on public.rutte_data;
drop policy if exists "rutte: atualizar os próprios dados" on public.rutte_data;
drop policy if exists "rutte: apagar os próprios dados" on public.rutte_data;

create policy "rutte: ler os próprios dados" on public.rutte_data
  for select to authenticated using (auth.uid() = user_id);
create policy "rutte: criar os próprios dados" on public.rutte_data
  for insert to authenticated with check (auth.uid() = user_id);
create policy "rutte: atualizar os próprios dados" on public.rutte_data
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rutte: apagar os próprios dados" on public.rutte_data
  for delete to authenticated using (auth.uid() = user_id);
