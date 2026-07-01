'use client';
import { CrudSection } from '@/components/forms/crud-section';

export default function ContactsPage() {
  return (
    <CrudSection
      table="key_contacts"
      kicker="Vous et les vôtres"
      title="Vos contacts clés"
      intro="Notaire, banque, assureur, proches à prévenir : rassemblez ici les interlocuteurs qui comptent, pour les retrouver au bon moment."
      emptyMessage="Aucun contact clé pour le moment. Ajoutez-en un ci-dessous."
      fields={[
        { key: 'role', label: 'Rôle', placeholder: 'Notaire, banque, assureur…', required: true },
        { key: 'nom', label: 'Nom', required: true },
        { key: 'tel', label: 'Téléphone' },
        { key: 'email', label: 'Email' },
        { key: 'en_charge_de', label: 'En charge de' },
      ]}
    />
  );
}
