/*
  # Schéma complet — Base V4 Livret de Succession TransmiExpert

  À exécuter sur le NOUVEAU projet Supabase dédié à la V4.
  Reproduit la structure de l'application existante pour que les données puissent y être copiées
  sans transformation. RLS activée sur toutes les tables : chaque utilisateur ne voit que ses dossiers.

  Tables : case_files, identity_profile, family_context, key_contacts, trust_people,
  accounts, insurances, properties, debts, documents_index, legal_documents_status,
  funeral_wishes, emergency_checklist, digital_assets.

  Fonction : initialize_default_case_file(p_user_id) — crée un dossier vide pour un nouvel utilisateur.
*/

-- =========================================================================
-- Table principale
-- =========================================================================
CREATE TABLE IF NOT EXISTS case_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Mon dossier de succession',
  status text NOT NULL DEFAULT 'draft',
  completion_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own case files"
  ON case_files FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- =========================================================================
-- Helper : vérifier que le dossier appartient à l'utilisateur courant
-- =========================================================================
CREATE OR REPLACE FUNCTION owns_case_file(cf_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM case_files WHERE id = cf_id AND owner_user_id = auth.uid()
  );
$$;

-- =========================================================================
-- Tables enfants (une politique RLS générique par table)
-- =========================================================================

CREATE TABLE IF NOT EXISTS identity_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  nom_naissance text, nom_usage text, prenoms text,
  date_naissance text, lieu_naissance text, adresse text,
  telephone text, email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  statut_conjugal text, regime_matrimonial text,
  contrat_mariage_existe boolean NOT NULL DEFAULT false,
  enfants_mineurs boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS key_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'autre', nom text NOT NULL,
  tel text, email text, adresse text, en_charge_de text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  name text NOT NULL, relationship text NOT NULL DEFAULT 'autre',
  email text, phone text, what_they_receive text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  bank_name text NOT NULL, iban_last4 text, note text
);

CREATE TABLE IF NOT EXISTS insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  type text NOT NULL, company text NOT NULL, contract_ref text, note text
);

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  label text NOT NULL, address text, loan_exists boolean DEFAULT false, note text
);

CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  creditor text NOT NULL, amount_estimate numeric, note text
);

CREATE TABLE IF NOT EXISTS documents_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  doc_type text NOT NULL, status text NOT NULL DEFAULT 'manquant',
  location_hint text DEFAULT '', expiry_date text, note text
);

CREATE TABLE IF NOT EXISTS legal_documents_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  doc_type text NOT NULL, existe boolean NOT NULL DEFAULT false,
  date_document text, depose_chez text, contact_id uuid, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS funeral_wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  ceremonie_type text NOT NULL DEFAULT 'non_defini',
  choix text NOT NULL DEFAULT 'non_defini',
  lieu text, pompe_funebre_contact text, volontes_libres text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  task_key text NOT NULL, status text NOT NULL DEFAULT 'todo', notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_file_id uuid NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'autre', fournisseur text NOT NULL,
  identifiant text, ou_trouver_acces text NOT NULL DEFAULT '',
  valeur_estimee numeric, note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================================
-- RLS générique sur toutes les tables enfants
-- =========================================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'identity_profile','family_context','key_contacts','trust_people','accounts',
    'insurances','properties','debts','documents_index','legal_documents_status',
    'funeral_wishes','emergency_checklist','digital_assets'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format($f$
      CREATE POLICY "Users manage own %1$s"
        ON %1$I FOR ALL TO authenticated
        USING (owns_case_file(case_file_id))
        WITH CHECK (owns_case_file(case_file_id));
    $f$, t);
  END LOOP;
END $$;

-- =========================================================================
-- RPC : initialise un dossier vide pour un nouvel utilisateur
-- =========================================================================
CREATE OR REPLACE FUNCTION initialize_default_case_file(p_user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO case_files (owner_user_id, title)
  VALUES (p_user_id, 'Mon dossier de succession')
  RETURNING id INTO new_id;
  RETURN new_id;
END $$;
