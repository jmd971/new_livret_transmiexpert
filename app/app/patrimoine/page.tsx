'use client';

import { useState } from 'react';
import { CrudSection } from '@/components/forms/crud-section';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'biens', label: 'Biens immobiliers' },
  { key: 'comptes', label: 'Comptes' },
  { key: 'assurances', label: 'Assurances' },
  { key: 'dettes', label: 'Dettes' },
  { key: 'entreprise', label: 'Entreprise' },
  { key: 'donations', label: 'Donations' },
  { key: 'indivisions', label: 'Indivisions' },
] as const;

export default function PatrimoinePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('biens');

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-2">Votre patrimoine</p>
      <h1 className="font-serif text-3xl text-ink mb-6">Votre patrimoine</h1>

      <div className="flex gap-1 border-b border-gold/30 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm transition-colors',
              tab === t.key ? 'border-b-2 border-gold text-forest font-medium' : 'text-ink/60 hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'biens' && (
        <CrudSection
          table="properties"
          kicker=""
          title="Vos biens immobiliers"
          intro="Ce que vous possédez, seul ou en indivision."
          emptyMessage="Aucun bien renseigné pour le moment."
          fields={[
            { key: 'label', label: 'Bien', placeholder: 'Maison familiale, terrain…', required: true },
            { key: 'address', label: 'Adresse' },
            { key: 'note', label: 'Notes' },
          ]}
        />
      )}
      {tab === 'comptes' && (
        <CrudSection
          table="accounts"
          kicker=""
          title="Vos comptes bancaires"
          intro="Pour ne rien oublier le moment venu."
          emptyMessage="Aucun compte renseigné pour le moment."
          fields={[
            { key: 'bank_name', label: 'Banque', required: true },
            { key: 'iban_last4', label: 'IBAN (4 derniers chiffres)' },
            { key: 'note', label: 'Notes' },
          ]}
        />
      )}
      {tab === 'assurances' && (
        <CrudSection
          table="insurances"
          kicker=""
          title="Vos assurances"
          intro="Contrats d'assurance, y compris assurance-vie. En assurance-vie, la clause bénéficiaire détermine à qui revient le capital — vérifier qu'elle est à jour est souvent la démarche la plus utile."
          emptyMessage="Aucune assurance renseignée pour le moment."
          fields={[
            { key: 'type', label: 'Type', placeholder: 'Habitation, vie, prévoyance…', required: true },
            { key: 'company', label: 'Compagnie', required: true },
            { key: 'contract_ref', label: 'N° de contrat' },
            {
              key: 'clause_beneficiaire_statut',
              label: 'Clause bénéficiaire (assurance-vie)',
              type: 'select',
              options: [
                { value: 'a_jour', label: 'À jour' },
                { value: 'a_verifier', label: 'À vérifier' },
                { value: 'non_renseigne', label: 'Non renseignée' },
              ],
            },
            { key: 'clause_derniere_revision', label: 'Dernière révision de la clause', placeholder: '2021, mars 2023…' },
            { key: 'note', label: 'Notes' },
          ]}
        />
      )}
      {tab === 'dettes' && (
        <CrudSection
          table="debts"
          kicker=""
          title="Vos dettes et engagements"
          intro="Une vision claire de ce qui reste à régler."
          emptyMessage="Aucune dette renseignée pour le moment."
          fields={[
            { key: 'creditor', label: 'Créancier', required: true },
            { key: 'amount_estimate', label: 'Montant estimé (€)', type: 'number' },
            { key: 'note', label: 'Notes' },
          ]}
        />
      )}
      {tab === 'entreprise' && (
        <CrudSection
          table="business_interests"
          kicker=""
          title="Votre entreprise, votre activité"
          intro="La transmission ne concerne pas que l'immobilier : si vous êtes dirigeant, associé ou indépendant, consignez ici l'essentiel de votre activité et ce que vous souhaitez pour la suite."
          emptyMessage="Aucune entreprise ou activité renseignée pour le moment."
          fields={[
            { key: 'nom_entreprise', label: 'Nom de l’entreprise', required: true },
            { key: 'forme_juridique', label: 'Forme juridique', placeholder: 'SARL, SAS, entreprise individuelle…' },
            { key: 'role', label: 'Votre rôle', placeholder: 'Gérant, associé, président…' },
            { key: 'parts_detenues', label: 'Parts détenues', placeholder: '100 %, 60 parts sur 100…' },
            { key: 'associes', label: 'Associés (le cas échéant)' },
            { key: 'expert_comptable', label: 'Expert-comptable (nom et contact)' },
            { key: 'devenir_souhaite', label: 'Devenir souhaité pour l’activité', placeholder: 'Reprise familiale, cession, fermeture…' },
            { key: 'note', label: 'Notes' },
          ]}
        />
      )}
      {tab === 'donations' && (
        <CrudSection
          table="past_donations"
          kicker=""
          title="Donations déjà consenties"
          intro="Ce qui a déjà été transmis — aides, sommes, biens. Le consigner factuellement évite les souvenirs divergents le jour venu. Le notaire seul détermine comment ces donations s'articulent avec la succession."
          emptyMessage="Aucune donation consignée pour le moment."
          fields={[
            { key: 'beneficiaire', label: 'Bénéficiaire', required: true },
            { key: 'nature', label: 'Nature', placeholder: 'Somme d’argent, terrain, véhicule…' },
            { key: 'date_donation', label: 'Date (même approximative)', placeholder: '2015, vers 2010…' },
            {
              key: 'formalisation',
              label: 'Formalisation',
              type: 'select',
              options: [
                { value: 'notariee', label: 'Notariée' },
                { value: 'don_manuel', label: 'Don manuel' },
                { value: 'non_precise', label: 'Non précisé' },
              ],
            },
            { key: 'valeur_estimee', label: 'Valeur estimée (€)', type: 'number' },
            { key: 'note', label: 'Notes' },
          ]}
        />
      )}
      {tab === 'indivisions' && (
        <CrudSection
          table="existing_indivisions"
          kicker=""
          title="Vos indivisions en cours"
          intro="Les biens familiaux dont vous êtes déjà co-indivisaire — un héritage non partagé, un terrain resté au nom des grands-parents. Poser la situation par écrit est la première étape pour la faire avancer."
          emptyMessage="Aucune indivision renseignée pour le moment."
          fields={[
            { key: 'bien', label: 'Bien concerné', required: true, placeholder: 'Maison familiale, terrain…' },
            { key: 'localisation', label: 'Localisation' },
            { key: 'origine', label: 'Origine', placeholder: 'Succession de… , donation de…' },
            { key: 'depuis_annee', label: 'Depuis (année)', placeholder: '1998…' },
            { key: 'co_indivisaires', label: 'Co-indivisaires', placeholder: 'Frères et sœurs, cousins…' },
            {
              key: 'situation',
              label: 'Situation',
              type: 'select',
              options: [
                { value: 'apaisee', label: 'Apaisée' },
                { value: 'en_discussion', label: 'En discussion' },
                { value: 'bloquee', label: 'Bloquée' },
                { value: 'notaire_saisi', label: 'Notaire saisi' },
                { value: 'non_precise', label: 'Non précisé' },
              ],
            },
            { key: 'notaire_contact', label: 'Notaire en charge (le cas échéant)' },
            { key: 'note', label: 'Notes' },
          ]}
        />
      )}
    </div>
  );
}
