'use client';
import { SingleRecordForm } from '@/components/forms/single-record-form';

export default function VolontesPage() {
  return (
    <SingleRecordForm
      table="funeral_wishes"
      kicker="Documents & sécurité"
      title="Vos volontés"
      intro="Un repère clair pour vos proches, le jour où ils en auront besoin. Rien ici n'est obligatoire — vous consignez ce que vous souhaitez, à votre rythme."
      note="Ces informations organisent vos souhaits pour faciliter la tâche de vos proches ; elles ne remplacent aucune démarche officielle auprès d'un notaire ou d'une pompe funèbre."
      fields={[
        { key: 'ceremonie_type', label: 'Type de cérémonie', type: 'select', options: [
          { value: 'civile', label: 'Civile' },
          { value: 'religieuse', label: 'Religieuse' },
          { value: 'mixte', label: 'Mixte' },
          { value: 'non_defini', label: 'Non précisé' },
        ] },
        { key: 'choix', label: 'Choix', type: 'select', options: [
          { value: 'inhumation', label: 'Inhumation' },
          { value: 'cremation', label: 'Crémation' },
          { value: 'non_defini', label: 'Non précisé' },
        ] },
        { key: 'lieu', label: 'Lieu souhaité' },
        { key: 'pompe_funebre_contact', label: 'Contact pompes funèbres' },
        { key: 'volontes_libres', label: 'Volontés complémentaires', type: 'textarea' },
      ]}
    />
  );
}
