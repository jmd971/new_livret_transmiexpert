/**
 * SECTION VOUS ET LES VÔTRES — pages 5 à 8
 *
 * La page "Personnes de confiance" est NOUVELLE : la donnée existe déjà dans l'application
 * (table trust_people) mais n'apparaissait dans aucune page du générateur V3. C'est l'un des
 * quatre trous de restitution identifiés lors de l'audit du code existant.
 */

import { PDF_THEME, STATUT_CONJUGAL_LABELS } from '../theme';
import {
  addPageChrome,
  addPageTitle,
  addNarrativeBlock,
  addRestitutionGrid,
  addLedgerTable,
  addPostureNote,
} from '../components';
import type { CaseFileData } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateProfilePage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'vous_et_les_votres', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Vous et les vôtres',
    title: 'Votre profil',
    mission: "L'essentiel pour vous identifier et vous recontacter au bon moment.",
  });

  const id = data.identity;
  y = addRestitutionGrid(doc, y, [
    { label: 'Nom de naissance', value: id?.nom_naissance },
    { label: "Nom d'usage", value: id?.nom_usage },
    { label: 'Prénoms', value: id?.prenoms },
    { label: 'Date de naissance', value: id?.date_naissance },
    { label: 'Lieu de naissance', value: id?.lieu_naissance },
    { label: 'Adresse', value: id?.adresse },
    { label: 'Téléphone', value: id?.telephone },
    { label: 'Email', value: id?.email },
  ]);

  y += spacing.lg;
  const fc = data.familyContext;
  y = addRestitutionGrid(doc, y, [
    {
      label: 'Situation',
      value: fc?.statut_conjugal ? STATUT_CONJUGAL_LABELS[fc.statut_conjugal] : undefined,
    },
    {
      label: 'Contrat de mariage / PACS',
      value: fc ? (fc.contrat_mariage_existe ? 'Oui' : 'Non') : undefined,
    },
    {
      label: 'Enfants mineurs à charge',
      value: fc ? (fc.enfants_mineurs ? 'Oui' : 'Non') : undefined,
    },
  ]);
}

export function generateFamilyPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'vous_et_les_votres', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Vous et les vôtres',
    title: 'Votre famille et vos liens',
    mission: 'Pour apaiser les échanges : on clarifie qui est concerné, et comment on communique.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    data.familyContext?.notes ||
      "Les notes sur votre situation familiale apparaîtront ici une fois renseignées dans votre espace personnel."
  );

  y += spacing.lg;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Règles de communication recommandées', page.margin.left, y);
  y = doc.y + spacing.sm;

  const rules = [
    'Un seul canal principal (WhatsApp, email ou téléphone), avec un court récapitulatif écrit après chaque échange important.',
    'On échange sur les faits et les options disponibles — les intentions se discutent en réunion, pas par message.',
    'Chaque décision prise se traduit par une date, un responsable et une prochaine étape.',
  ];
  rules.forEach((r) => {
    doc.circle(page.margin.left + 3, y + 6, 2).fill(colors.GOLD);
    doc
      .fontSize(fonts.size.body)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(r, page.margin.left + 14, y, { width: page.width - page.margin.left - page.margin.right - 14 });
    y = doc.y + spacing.sm;
  });
}

export function generateContactsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'vous_et_les_votres', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Vous et les vôtres',
    title: 'Vos contacts clés',
    mission: 'Notaire, banque, assureur, proches à prévenir : un répertoire prêt à l’usage.',
  });

  const rows = data.keyContacts.map((c) => [c.role, c.nom, c.tel || '—', c.email || '—']);
  addLedgerTable(doc, y, ['Rôle', 'Nom', 'Téléphone', 'Email'], rows, [90, 150, 110, 165], {
    emptyMessage: 'Aucun contact clé renseigné pour le moment.',
  });
}

/**
 * NOUVELLE PAGE — absente du générateur V3. Restitue la table trust_people, capturée
 * par l'application (écran /app/confiance) mais jamais reprise dans le PDF jusqu'ici.
 */
export function generateTrustPeoplePage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'vous_et_les_votres', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Vous et les vôtres',
    title: 'Vos personnes de confiance',
    mission: 'Qui vous avez désigné, et ce que vous souhaitez pour chacun.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'Ces personnes ont été identifiées par vous comme des interlocuteurs de confiance pour votre entourage, en complément — jamais en remplacement — des démarches notariales.'
  );

  const rows = data.trustPeople.map((p) => [
    p.name,
    p.relationship,
    p.what_they_receive || '—',
    [p.phone, p.email].filter(Boolean).join(' · ') || '—',
  ]);

  addLedgerTable(doc, y + spacing.sm, ['Nom', 'Lien', 'Ce qui leur revient', 'Contact'], rows, [110, 90, 140, 175], {
    emptyMessage:
      'Aucune personne de confiance désignée pour le moment. Vous pourrez en ajouter depuis votre espace personnel, à votre rythme.',
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    "Cette page organise vos souhaits ; elle ne se substitue pas à une clause bénéficiaire ou à une disposition testamentaire, qui relèvent d'un professionnel du droit."
  );
}
