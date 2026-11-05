-- Corrige o índice único de subscriptions.kiwify_subscription_id: o índice parcial original
-- (com "where kiwify_subscription_id is not null") não é compatível com upsert(onConflict:
-- 'kiwify_subscription_id') do supabase-js, que gera um "ON CONFLICT (coluna)" simples — o
-- Postgres exige que o alvo do ON CONFLICT bata exatamente com um índice (parcial inclusive).
-- Um índice único comum já permite vários NULL (NULL nunca é igual a NULL), então não
-- precisa do "where" para o mesmo efeito.
drop index if exists public.subscriptions_kiwify_id_idx;
create unique index subscriptions_kiwify_id_idx on public.subscriptions (kiwify_subscription_id);
