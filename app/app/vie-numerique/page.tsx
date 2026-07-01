'use client';
import { CrudSection } from '@/components/forms/crud-section';

export default function VieNumeriquePage() {
  return (
    <CrudSection
      table="digital_assets"
      kicker="Documents & sécurité"
      title="Votre vie numérique"
      intro="Recensez les comptes en ligne, abonnements et actifs numériques importants — et surtout où en retrouver l'accès. Par sécurité, n'inscrivez jamais de mot de passe ici, seulement l'endroit où le retrouver."
      emptyMessage="Aucun actif numérique renseigné pour le moment."
      fields={[
        { key: 'type', label: 'Type', placeholder: 'social, email, cloud, crypto, domaine, abonnement, autre' },
        { key: 'fournisseur', label: 'Fournisseur', required: true },
        { key: 'ou_trouver_acces', label: "Où trouver l'accès", required: true },
        { key: 'valeur_estimee', label: 'Valeur estimée (€)', type: 'number' },
        { key: 'note', label: 'Note' },
      ]}
    />
  );
}
