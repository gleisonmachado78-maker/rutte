-- Rutte — alertas com o app fechado (Web Push). Rode no SQL Editor depois de admin.sql.
-- Guarda: os aparelhos inscritos (endpoint do navegador) e a lista dos próximos alertas de cada conta
-- (horário, título e texto curto). Cada pessoa só vê e mexe nos próprios registros.

create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push: ver os próprios" on public.push_subscriptions;
create policy "push: ver os próprios" on public.push_subscriptions for select to authenticated using (user_id = auth.uid());

create table if not exists public.reminders (
  user_id uuid not null references auth.users (id) on delete cascade,
  id      text not null,
  at      timestamptz not null,
  title   text not null,
  body    text,
  url     text,
  sent    boolean not null default false,
  primary key (user_id, id)
);
create index if not exists reminders_due on public.reminders (at) where not sent;
alter table public.reminders enable row level security;
drop policy if exists "lembretes: ver os próprios" on public.reminders;
create policy "lembretes: ver os próprios" on public.reminders for select to authenticated using (user_id = auth.uid());

-- inscrição do aparelho (o mesmo navegador pode trocar de conta)
create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth) values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end $$;

create or replace function public.delete_push_subscription(p_endpoint text) returns void
language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
$$;

-- substitui os alertas futuros ainda não enviados da conta pela lista nova
create or replace function public.sync_reminders(p_items jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  delete from public.reminders where user_id = auth.uid() and not sent;
  insert into public.reminders (user_id, id, at, title, body, url)
  select auth.uid(), x->>'id', (x->>'at')::timestamptz, left(x->>'title', 200), left(x->>'body', 300), left(x->>'url', 500)
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) x
  where (x->>'at')::timestamptz > now() - interval '5 minutes'
  on conflict (user_id, id) do nothing;
  -- limpeza: enviados há mais de 2 dias
  delete from public.reminders where user_id = auth.uid() and sent and at < now() - interval '2 days';
end $$;

revoke all on function public.save_push_subscription(text, text, text) from public, anon;
revoke all on function public.delete_push_subscription(text) from public, anon;
revoke all on function public.sync_reminders(jsonb) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;
grant execute on function public.delete_push_subscription(text) to authenticated;
grant execute on function public.sync_reminders(jsonb) to authenticated;

-- agenda: chama a função "send-reminders" a cada minuto
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('rutte-send-reminders') where exists (select 1 from cron.job where jobname = 'rutte-send-reminders');
select cron.schedule('rutte-send-reminders', '* * * * *', $$
  select net.http_post(
    url := 'https://rpasribolewljtanpolu.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
$$);
