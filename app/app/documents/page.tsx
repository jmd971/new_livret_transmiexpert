'use client';

import { useState } from 'react';
import { CrudSection } from '@/components/forms/crud-section';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'index', label: 'Index des documents' },
  { key: 'legaux', label: 'Actes & dispositions' },
] as const;

export default function DocumentsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('index');

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-2">Documents & sécurité</p>
      <h1 className="font-serif text-3xl text-ink mb-6">Vos documents</h1>

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

      {tab === 'index' && (
        <CrudSection
          table="documents_index"
          kicker=""
          title="Index de vos documents"
          intro="Où se trouve chaque pièce, et si elle est à jour. Un état des lieux, sans jugement."
          emptyMessage="Aucun document indexé pour le moment."
          fields={[
            { key: 'doc_type', label: 'Type de document', placeholder: "piece_identite, assurance, titre_propriete…", required: true },
            { key: 'status', label: 'Statut', placeholder: 'a_jour, manquant, a_verifier, expire' },
            { key: 'location_hint', label: 'Où le trouver' },
            { key: 'note', label: 'Note' },
          ]}
        />
      )}
      {tab === 'legaux' && (
        <CrudSection
          table="legal_documents_status"
          kicker=""
          title="Actes et dispositions légales"
          intro="Testament, mandat de protection, contrat de mariage… ce qui existe déjà et où il est déposé."
          emptyMessage="Aucune disposition légale renseignée pour le moment."
          fields={[
            { key: 'doc_type', label: 'Type', placeholder: 'testament, mandat_protection, donation…', required: true },
            { key: 'depose_chez', label: 'Déposé chez' },
            { key: 'notes', label: 'Notes' },
          ]}
        />
      )}
    </div>
  );
}
