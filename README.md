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

## Structure du contenu — 27 pages, 6 sections (V4.1)

| Section | Pages | Contenu | Statut |
|---|---|---|---|
| Ouverture | 1–4 | Couverture personnalisée, mot d'accueil de Luc (adaptatif), tableau de bord de complétion, cadre de confiance | Réécrit |
| Vous et les vôtres | 5–8 | Profil, famille, contacts clés, **personnes de confiance** | 1 page nouvelle |
| Votre patrimoine | 9–16 | Vue d'ensemble, biens, comptes/contrats (avec **clause bénéficiaire**), dettes, **entreprise & activité**, **donations consenties**, **indivisions en cours**, repères indivision & loi Letchimy | 3 pages nouvelles V4.1 |
| Documents & sécurité | 17–20 | Index documents, pièces à réunir, **vie numérique**, **volontés / urgence** | 2 pages nouvelles |
| Décisions & méthode | 21–25 | Objectifs, décisions en cours, préparation réunion, compte-rendu, plan d'action | Réhabillé |
| Clôture | 26–27 | Résumé exécutif à partager, contact TransmiExpert | Réécrit |

## Nouveautés V4.1 — patrimoine étendu

Trois dimensions ajoutées au patrimoine, choisies pour renforcer le positionnement sans le diluer
(migration : `supabase/migrations/20260717000000_v4_1_patrimoine_etendu.sql`, à exécuter sur la base V4) :

1. **Entreprise & activité** (`business_interests`) — la transmission ne concerne pas que
   l'immobilier ; essentiel pour les dirigeants et indépendants.
2. **Donations déjà consenties** (`past_donations`) — le sujet le plus conflictuel d'une
   succession, consigné factuellement ; l'articulation juridique (rapport, réduction) reste
   explicitement renvoyée au notaire.
3. **Indivisions en cours** (`existing_indivisions`) — le client antillais est très souvent
   lui-même co-indivisaire d'un bien familial non réglé ; cette page précède le glossaire
   Letchimy et le transforme en outil personnel.

S'y ajoutent deux champs sur `insurances` (`clause_beneficiaire_statut`, `clause_derniere_revision`) :
le statut de la clause bénéficiaire d'assurance-vie, premier actif hors succession en France,
apparaît désormais dans le tableau des contrats.

**Attention** : la V4.1 introduit une différence de schéma avec l'application d'origine
(`transmiexpert-application`). Le branchement du générateur sur l'app existante nécessite
désormais d'y appliquer aussi cette migration (les trois tables absentes font échouer
`loadCaseFileData` — pas de dégradation silencieuse).

## Ce qui a changé concrètement

- **`lib/pdf/theme.ts`** — palette de marque corrigée (vert forêt / ivoire / noir encre / or),
  remplace la palette provisoire teal/gold de la V3.
- **`lib/pdf/components.ts`** — nouveau vocabulaire de dessin (`addRestitutionField`,
  `addLedgerTable`, `addPullQuote`, `addProgressBar`...) qui remplace les primitives de formulaire.
- **`lib/pdf/types.ts`** — modèle de données strictement identique à l'application existante
  (aucune migration nécessaire), `PDFKind` supprimé au profit de `ReaderProfile`.
- **`lib/pdf/templates/*`** — les 27 fonctions de génération de page, réparties par section.
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
- [x] ~~Ce code n'a pas pu être exécuté ni rendu en PDF réel~~ **Fait en V4.1** : rendu réel
      exécuté avec un jeu de données fictif — 27 pages A4 conformes, contenu vérifié page par page.
      Ce test a révélé et corrigé un bug bloquant : la pagination automatique de PDFKit générait
      80 pages au lieu de 27 (marges du constructeur désormais à zéro, cf. `lib/pdf/generator.ts`).
      Une relecture visuelle humaine du PDF reste recommandée avant tout envoi client.

## Intégration future (non faite ici)

Pour brancher cette V4.1 sur l'application existante : remplacer le contenu de `lib/pdf/`,
reporter les ajouts de `lib/types/case-files.ts` (types V4.1), vérifier que
`app/api/pdf/generate/route.ts` et `app/api/pdf/generate-direct/route.ts` appellent bien
`generateUnifiedPDF(data)` avec la même signature, et appliquer la migration
`20260717000000_v4_1_patrimoine_etendu.sql` sur la base cible (contrairement à la V4,
la V4.1 modifie le schéma : trois tables et deux colonnes).
