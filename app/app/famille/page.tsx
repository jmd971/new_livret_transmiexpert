'use client';
import { SingleRecordForm } from '@/components/forms/single-record-form';

export default function FamillePage() {
  return (
    <SingleRecordForm
      table="family_context"
      kicker="Vous et les vôtres"
      title="Votre famille et vos liens"
      intro="Quelques repères sur votre situation familiale, utiles pour cadrer les échanges à venir."
      fields={[
        { key: 'statut_conjugal', label: 'Situation', type: 'select', options: [
          { value: 'celibataire', label: 'Célibataire' },
          { value: 'concubinage', label: 'En concubinage' },
          { value: 'pacs', label: 'Pacsé(e)' },
          { value: 'marie', label: 'Marié(e)' },
          { value: 'divorce', label: 'Divorcé(e)' },
          { value: 'veuf', label: 'Veuf / veuve' },
        ] },
        { key: 'regime_matrimonial', label: 'Régime matrimonial', type: 'select', options: [
          { value: 'communaute', label: 'Communauté' },
          { value: 'separation', label: 'Séparation de biens' },
          { value: 'participation', label: 'Participation aux acquêts' },
          { value: 'inconnu', label: 'Inconnu' },
        ] },
        { key: 'contrat_mariage_existe', label: 'Contrat de mariage / PACS existe', type: 'boolean' },
        { key: 'enfants_mineurs', label: 'Enfants mineurs à charge', type: 'boolean' },
        { key: 'notes', label: 'Notes sur la situation familiale', type: 'textarea' },
      ]}
    />
  );
}
