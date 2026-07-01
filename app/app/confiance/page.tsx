'use client';
import { CrudSection } from '@/components/forms/crud-section';

export default function ConfiancePage() {
  return (
    <CrudSection
      table="trust_people"
      kicker="Vous et les vôtres"
      title="Vos personnes de confiance"
      intro="Désignez les personnes que vous souhaitez impliquer, et précisez ce que vous voulez pour chacune. Ces choix organisent vos souhaits — ils ne remplacent pas une disposition notariale."
      emptyMessage="Aucune personne de confiance désignée pour le moment."
      fields={[
        { key: 'name', label: 'Nom', required: true },
        { key: 'relationship', label: 'Lien', placeholder: 'Conjoint, enfant, ami…' },
        { key: 'what_they_receive', label: 'Ce qui leur revient' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'email', label: 'Email' },
      ]}
    />
  );
}
