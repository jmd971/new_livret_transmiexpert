/*
  # Migration V4.1 — Patrimoine étendu

  Trois nouvelles dimensions du patrimoine, choisies pour renforcer le positionnement
  du livret sans le diluer :

  1. business_interests   — l'entreprise et l'activité professionnelle (cœur de la promesse
                            TransmiExpert : la transmission ne concerne pas que l'immobilier).
  2. past_donations       — les donations déjà consenties (le sujet le plus conflictuel d'une
                            succession ; le consigner factuellement sert la promesse d'apaisement).
  3. existing_indivisions — les indivisions dont le client est DÉJÀ co-indivisaire (cas très
                            fréquent aux Antilles ; prolonge le glossaire Letchimy en outil personnel).

  Plus deux champs sur `insurances` : le statut de la clause bénéficiaire d'assurance-vie
  (premier actif hors succession en France, jusqu'ici listé sans cette information décisive).

  RLS : mêmes politiques génériques que les autres tables enfants (owns_case_file).
  À exécuter sur la base V4 après 20260701000000_v4_complete_schema.sql.
*/

-- =========================================================================
-- Entreprise & activité professionnelle
-- =========================================================================
CREATE TABLE IF NOT EXISTS business_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  nom_entreprise text NOT NULL,
  forme_juridique text,
  role text,
  parts_detenues text,
  associes text,
  expert_comptable text,
  devenir_souhaite text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================================
-- Donations déjà consenties
-- =========================================================================
CREATE TABLE IF NOT EXISTS past_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  beneficiaire text NOT NULL,
  nature text,
  date_donation text,
  formalisation text NOT NULL DEFAULT 'non_precise',
  valeur_estimee numeric,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================================
-- Indivisions en cours (dont le client est co-indivisaire)
-- =========================================================================
CREATE TABLE IF NOT EXISTS existing_indivisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  bien text NOT NULL,
  localisation text,
  origine text,
  depuis_annee text,
  co_indivisaires text,
  situation text NOT NULL DEFAULT 'non_precise',
  notaire_contact text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================================
-- Assurances : statut de la clause bénéficiaire
-- =========================================================================
ALTER TABLE insurances
  ADD COLUMN IF NOT EXISTS clause_beneficiaire_statut text NOT NULL DEFAULT 'non_renseigne',
  ADD COLUMN IF NOT EXISTS clause_derniere_revision text;

-- =========================================================================
-- RLS générique sur les trois nouvelles tables
-- =========================================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['business_interests','past_donations','existing_indivisions']) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format($f$
      CREATE POLICY "Users manage own %1$s"
        ON %1$I FOR ALL TO authenticated
        USING (owns_case_file(case_file_id))
        WITH CHECK (owns_case_file(case_file_id));
    $f$, t);
  END LOOP;
END $$;
