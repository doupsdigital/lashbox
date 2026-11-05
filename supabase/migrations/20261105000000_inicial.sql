-- LashBox · estrutura inicial
-- Acesso por ASSINATURA (Kiwify), não por compra única. Cada usuária só lê e escreve os
-- próprios dados, e só enquanto has_access() for verdadeiro.

-- ───────────── Assinaturas (só o service role escreve; a própria usuária pode ler a sua) ─────────────
create table public.subscriptions (
  id bigint generated always as identity primary key,
  email text not null check (email = lower(btrim(email))),
  kiwify_subscription_id text,
  plan text not null check (plan in ('mensal', 'anual')),
  status text not null check (status in ('active', 'late', 'canceled', 'refunded')),
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
create index subscriptions_email_idx on public.subscriptions (email);
create unique index subscriptions_kiwify_id_idx on public.subscriptions (kiwify_subscription_id) where kiwify_subscription_id is not null;

alter table public.subscriptions enable row level security;
revoke all on table public.subscriptions from anon, authenticated;

create policy "assinatura: ler a própria" on public.subscriptions
  for select to authenticated
  using (email = lower(coalesce((select auth.jwt() ->> 'email'), '')));

-- ───────────── Compras avulsas de kits sazonais (só o service role acessa) ─────────────
create table public.purchases (
  id bigint generated always as identity primary key,
  email text not null check (email = lower(btrim(email))),
  kiwify_order_id text,
  product_key text not null,
  status text not null check (status in ('active', 'revoked')),
  product text,
  updated_at timestamptz not null default now(),
  unique (kiwify_order_id, product_key)
);
create index purchases_email_idx on public.purchases (email);

alter table public.purchases enable row level security;
revoke all on table public.purchases from anon, authenticated;

-- ───────────── has_access(): a assinatura logada está dentro do período pago? ─────────────
-- active/late: liberado enquanto a Kiwify ainda tentar cobrar (current_period_end no futuro).
-- canceled: liberado até o fim do período já pago.
-- refunded: bloqueia na hora, mesmo dentro do período.
create or replace function public.has_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and s.status in ('active', 'late', 'canceled')
      and s.current_period_end is not null
      and s.current_period_end > now()
  );
$$;
revoke all on function public.has_access() from public, anon;
grant execute on function public.has_access() to authenticated;

-- ───────────── my_products(): quais kits sazonais a usuária logada já comprou ─────────────
create or replace function public.my_products()
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_agg(distinct p.product_key), '{}')
  from public.purchases p
  where p.email = lower(coalesce(auth.jwt() ->> 'email', ''))
    and p.status = 'active';
$$;
revoke all on function public.my_products() from public, anon;
grant execute on function public.my_products() to authenticated;

-- ───────────── Perfil (Meu Estúdio) ─────────────
-- client_list (Minhas clientes) NÃO entra aqui: fica só no aparelho.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text check (char_length(name) <= 60),
  studio jsonb,
  onboarding jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) and (select public.has_access()));

create policy "perfil: criar o próprio" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and (select public.has_access()));

create policy "perfil: alterar o próprio" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) and (select public.has_access()))
  with check (id = (select auth.uid()));

revoke all on table public.profiles from anon;

-- ───────────── Registro de todos os webhooks recebidos da Kiwify (para depuração) ─────────────
create table public.webhook_logs (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  source text not null default 'kiwify',
  event_type text,
  order_id text,
  email text,
  signature_valid boolean not null,
  -- processed | ignored | rejected | error
  result text not null,
  message text,
  payload jsonb,
  raw_body text
);
create index webhook_logs_received_idx on public.webhook_logs (received_at desc);
create index webhook_logs_order_idx on public.webhook_logs (order_id);

alter table public.webhook_logs enable row level security;
revoke all on table public.webhook_logs from anon, authenticated;
