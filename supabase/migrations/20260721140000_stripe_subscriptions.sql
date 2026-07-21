-- Abonnements Stripe : une ligne par utilisateur, tenue à jour par le webhook
-- /api/stripe/webhook (clé service_role). Les clients ne peuvent que LIRE leur
-- propre ligne (le gating de l'app repose dessus) — jamais écrire.
-- Migration appliquée le 21/07/2026 sur le projet tzskijwvmiwwfyfscbxi.
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  plan text check (plan in ('essentiel', 'accompagne')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Les utilisateurs lisent leur propre abonnement"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Aucune policy insert/update/delete : seules les écritures via service_role
-- (webhook Stripe) sont possibles, la RLS bloque tout le reste.

create index subscriptions_stripe_customer_idx on public.subscriptions (stripe_customer_id);
