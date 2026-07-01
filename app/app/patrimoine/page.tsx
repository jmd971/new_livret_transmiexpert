'use client';

import { useState } from 'react';
import { CrudSection } from '@/components/forms/crud-section';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'biens', label: 'Biens immobiliers' },
  { key: 'comptes', label: 'Comptes' },
  { key: 'assurances', label: 'Assurances' },
  { key: 'dettes', label: 'Dettes' },
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
          intro="Contrats d'assurance, y compris assurance-vie."
          emptyMessage="Aucune assurance renseignée pour le moment."
          fields={[
            { key: 'type', label: 'Type', placeholder: 'Habitation, vie, prévoyance…', required: true },
            { key: 'company', label: 'Compagnie', required: true },
            { key: 'contract_ref', label: 'N° de contrat' },
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
    </div>
  );
}
