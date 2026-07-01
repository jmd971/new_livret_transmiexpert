# Livret de Succession — TransmiExpert · Refonte éditoriale V4

Ce dépôt contient la **refonte du contenu et de la grammaire visuelle** du Livret de Succession
(Pack Sérénité), produit aujourd'hui par l'application [`transmiexpert-application`](https://github.com/jmd971/transmiexpert-application).

**Ce dépôt ne modifie rien dans l'application existante.** C'est un espace de travail séparé, pensé
pour être relu, discuté et validé avant toute intégration.

## Pourquoi cette refonte

L'audit du générateur PDF existant (`lib/pdf/templates/livret-succession.ts` dans le repo original)
a mis en évidence trois constats qui motivent une refonte de fond plutôt qu'un lifting visuel :

1. **La grammaire de construction est administrative, pas éditoriale.** Les fonctions
   `addGrayTable` / `addGrayFieldRow` dessinent des cases à remplir, pas un rapport restitué.
2. **Quatre sections de données existent dans l'application mais n'apparaissaient dans aucune page
   du PDF généré** : personnes de confiance (`trust_people`), vie numérique (`digital_assets`),
   dispositions funéraires (`funeral_wishes`) et checklist d'urgence (`emergency_checklist`).
3. **Le fork à trois documents** (`urgence24h` / `famille` / `notaire`, défini dans
   `templates/cover-page.ts` de la V3) n'était en réalité jamais branché à l'écran client — code mort.
   Décision actée : un seul document, avec une ouverture qui s'adapte au profil du lecteur
   (`ReaderProfile: 'crise' | 'anticipateur'`) plutôt que trois documents à maintenir.

## Structure du contenu — 24 pages, 6 sections

| Section | Pages | Contenu | Statut |
|---|---|---|---|
| Ouverture | 1–4 | Couverture personnalisée, mot d'accueil de Luc (adaptatif), tableau de bord de complétion, cadre de confiance | Réécrit |
| Vous et les vôtres | 5–8 | Profil, famille, contacts clés, **personnes de confiance** | 1 page nouvelle |
| Votre patrimoine | 9–13 | Vue d'ensemble, biens, comptes/contrats, dettes, **repères indivision & loi Letchimy** | 1 page nouvelle |
| Documents & sécurité | 14–17 | Index documents, pièces à réunir, **vie numérique**, **volontés / urgence** | 2 pages nouvelles |
| Décisions & méthode | 18–22 | Objectifs, décisions en cours, préparation réunion, compte-rendu, plan d'action | Réhabillé |
| Clôture | 23–24 | Résumé exécutif à partager, contact TransmiExpert | Réécrit |

## Ce qui a changé concrètement

- **`lib/pdf/theme.ts`** — palette de marque corrigée (vert forêt / ivoire / noir encre / or),
  remplace la palette provisoire teal/gold de la V3.
- **`lib/pdf/components.ts`** — nouveau vocabulaire de dessin (`addRestitutionField`,
  `addLedgerTable`, `addPullQuote`, `addProgressBar`...) qui remplace les primitives de formulaire.
- **`lib/pdf/types.ts`** — modèle de données strictement identique à l'application existante
  (aucune migration nécessaire), `PDFKind` supprimé au profit de `ReaderProfile`.
- **`lib/pdf/templates/*`** — les 24 fonctions de génération de page, réparties par section.
- **`lib/pdf/generator.ts`** — orchestrateur, même signature publique que la V3
  (`generateUnifiedPDF(data): Promise<Buffer>`) pour un branchement à coût minimal.

## À valider avant intégration

- [ ] Confirmer la palette hexadécimale exacte de la charte graphique officielle (valeurs actuelles
      reprises du système de design documenté, non vérifiées pixel-perfect).
- [ ] Faire valider le ton des pages sensibles (vie numérique, volontés/urgence) — rédigé avec un
      principe de sobriété, à relire avant tout envoi client.
- [ ] Décider si `ReaderProfile` doit être un champ réel en base (`case_files.reader_profile`,
      migration à écrire) ou rester un paramètre optionnel côté génération.
- [ ] Le glossaire indivision/loi Letchimy doit être revérifié à chaque évolution législative
      (la loi n° 2026-248 du 7 avril 2026 vient d'ores et déjà compléter la loi Letchimy de 2018 —
      à intégrer si pertinent).
- [ ] Ce code n'a pas pu être exécuté ni rendu en PDF réel dans cet environnement (pas d'accès
      réseau pour installer les dépendances). Une relecture visuelle après un premier rendu réel
      est indispensable avant tout envoi à un client.

## Intégration future (non faite ici)

Pour brancher cette V4 sur l'application existante, il suffirait de remplacer le contenu de
`lib/pdf/`, `lib/types/case-files.ts` restant inchangé, et de vérifier que
`app/api/pdf/generate/route.ts` et `app/api/pdf/generate-direct/route.ts` appellent bien
`generateUnifiedPDF(data)` avec la même signature. Aucune modification de schéma Supabase n'est
requise pour les 24 pages telles que livrées ici.
