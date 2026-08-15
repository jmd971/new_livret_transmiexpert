-- Grille Option B : le webhook écrit désormais les plans 'pack' et 'accompagnee'
-- (cf. lib/subscription-shared.ts). La contrainte posée le 21/07/2026 n'acceptait que
-- l'ancienne grille mensuelle : tout abonnement vendu faisait échouer l'upsert du
-- webhook, le client payait sans jamais obtenir l'accès. On élargit la contrainte en
-- gardant les anciennes valeurs (lignes historiques).
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('essentiel', 'accompagne', 'pack', 'accompagnee'));

-- Commandes de livre papier à expédier. Deux origines :
--  - 'livre_vierge' : achat direct 90 €, sans compte (mode payment) ;
--  - 'pack' / 'accompagnee' : le livre imprimé au nom du client, inclus dans
--    l'abonnement de première année (mode subscription).
-- Écrite uniquement par le webhook Stripe, lue par l'équipe via /api/commandes.
create table if not exists public.commandes (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('livre_vierge', 'pack', 'accompagnee')),
  stripe_session_id text not null unique,
  stripe_customer_id text,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  nom text,
  telephone text,
  adresse jsonb,
  montant_centimes integer,
  statut text not null default 'a_expedier' check (statut in ('a_expedier', 'expediee', 'annulee')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commandes enable row level security;

-- Aucune policy : la table contient des adresses postales de clients et n'est
-- accessible que par la clé service_role (webhook + route équipe).

create index if not exists commandes_statut_idx on public.commandes (statut, created_at desc);
