'use client';
import { SingleRecordForm } from '@/components/forms/single-record-form';

export default function ProfilPage() {
  return (
    <SingleRecordForm
      table="identity_profile"
      kicker="Vous et les vôtres"
      title="Votre profil"
      intro="L'essentiel pour vous identifier. Ces informations figureront en tête de votre livret."
      fields={[
        { key: 'nom_naissance', label: 'Nom de naissance' },
        { key: 'nom_usage', label: "Nom d'usage" },
        { key: 'prenoms', label: 'Prénoms' },
        { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
        { key: 'lieu_naissance', label: 'Lieu de naissance' },
        { key: 'adresse', label: 'Adresse' },
        { key: 'telephone', label: 'Téléphone' },
        { key: 'email', label: 'Email' },
      ]}
    />
  );
}
