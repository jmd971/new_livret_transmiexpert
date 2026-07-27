/**
 * SECTION CLÔTURE — pages 36 à 44 (V4.2)
 *
 * La page de résumé est la plus "publique" du livret : c'est celle que le client montre
 * à un notaire ou à un héritier distant. Elle doit être irréprochable, autonome (compréhensible
 * sans avoir lu le reste du livret) et tenir sur une seule page.
 */

import { PDF_THEME, formatAmount } from '../theme';
import {
  addPageChrome,
  addPageTitle,
  addNarrativeBlock,
  addRestitutionField,
  addPostureNote,
  addWritingLines,
  isBlankMode,
} from '../components';
import type { CaseFileData } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateSummaryPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'À partager si vous le souhaitez',
    title: 'Résumé de votre situation',
    mission: 'Une page autonome, pensée pour un notaire ou un proche qui découvre votre dossier.',
  });

  const totalDebts = data.debts.reduce((sum, d) => sum + (Number(d.amount_estimate) || 0), 0);
  const mainProperty = data.properties[0];

  y = addRestitutionField(doc, y, 'Dossier chez notaire', undefined, { emptyText: 'À préciser' });
  y = addRestitutionField(doc, y, 'Bien principal', mainProperty?.label);
  y = addRestitutionField(doc, y, 'Nombre de biens recensés', String(data.properties.length));
  y = addRestitutionField(doc, y, 'Dettes estimées (total)', formatAmount(totalDebts));
  y = addRestitutionField(doc, y, 'Personnes de confiance désignées', String(data.trustPeople.length));
  y = addRestitutionField(doc, y, 'Indivisions en cours', String(data.existingIndivisions.length));
  y = addRestitutionField(doc, y, 'Donations déjà consenties', String(data.pastDonations.length));

  y += spacing.lg;
  doc.fontSize(fonts.size.small).font(fonts.heading).fillColor(colors.FOREST).text('À retenir', page.margin.left, y);
  y = doc.y + spacing.xs;
  addNarrativeBlock(
    doc,
    y,
    isBlankMode()
      ? 'Ce résumé reflète votre situation au jour où vous l’avez complété. Pensez à le dater. Pour toute décision, le rendez-vous chez le notaire reste l’étape de référence.'
      : 'Ce résumé reflète l’état du dossier à la date de génération de ce livret. Pour toute décision, le rendez-vous chez le notaire reste l’étape de référence.'
  );
}

export function generateClosingPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  const centerX = page.width / 2;

  doc
    .fontSize(fonts.size.xlarge)
    .font(fonts.heading)
    .fillColor(colors.INK)
    .text('Une question, un doute ?', page.margin.left, page.margin.top + 40, {
      width: page.width - page.margin.left - page.margin.right,
      align: 'center',
    });

  let y = doc.y + spacing.md;
  y = addNarrativeBlock(
    doc,
    y,
    'Ce livret évolue avec vous. Vous pouvez demander un point, une médiation ou une consultation à tout moment.',
    { width: page.width - page.margin.left - page.margin.right }
  );

  y += spacing.xl;
  doc.strokeColor(colors.GOLD).lineWidth(1).moveTo(centerX - 60, y).lineTo(centerX + 60, y).stroke();
  y += spacing.xl;

  [
    ['Téléphone / WhatsApp', '0690 73 45 80'],
    ['Email', 'contact@transmiexpert.fr'],
    ['Site', 'transmiexpert.fr'],
  ].forEach(([label, value]) => {
    doc
      .fontSize(fonts.size.small)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(label.toUpperCase(), 0, y, { width: page.width, align: 'center', characterSpacing: 0.5 });
    doc
      .fontSize(fonts.size.medium)
      .font(fonts.heading)
      .fillColor(colors.FOREST)
      .text(value, 0, doc.y + 2, { width: page.width, align: 'center' });
    y = doc.y + spacing.lg;
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 10,
    'TransmiExpert, Les Abymes, Guadeloupe. Ni notaire, ni avocat : tiers neutre en médiation successorale.'
  );
}


/**
 * NOUVELLE PAGE V4.2 — « Un mot pour les vôtres » : la page que les familles garderont.
 * Saisie dans l'application (case_files.mot_aux_proches) et composée en belle page —
 * ou laissée en lignes d'écriture pour être écrite à la main.
 */
export function generatePersonalWordPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'À ceux qui liront ces pages',
    title: 'Un mot pour les vôtres',
    mission: 'Ni juridique, ni définitif : simplement vrai.',
  });

  const word = data.caseFile?.mot_aux_proches;

  if (!isBlankMode() && word && word.trim().length > 0) {
    doc
      .fontSize(fonts.size.medium)
      .font(fonts.italic)
      .fillColor(colors.INK)
      .text(word, page.margin.left + 10, y + spacing.md, {
        width: page.width - page.margin.left - page.margin.right - 20,
        lineGap: 5,
      });
    const ownerName = data.identity
      ? [data.identity.prenoms, data.identity.nom_usage || data.identity.nom_naissance].filter(Boolean).join(' ')
      : undefined;
    if (ownerName) {
      doc
        .fontSize(fonts.size.body)
        .font(fonts.body)
        .fillColor(colors.GREY)
        .text(`— ${ownerName}`, page.margin.left + 10, doc.y + spacing.lg, {
          width: page.width - page.margin.left - page.margin.right - 20,
          align: 'right',
        });
    }
    return;
  }

  y = addNarrativeBlock(
    doc,
    y,
    'Cette page vous appartient plus que toutes les autres. Quelques lignes suffisent : ce que vous voulez que les vôtres sachent, ce que vous espérez pour eux, ce que vous auriez aimé dire de vive voix.'
  );
  addWritingLines(doc, y + spacing.md, 8, { gap: 34 });
}

/**
 * NOUVELLE PAGE V4.2 — « Les dix premiers jours » : la page la plus utile du livre,
 * le jour venu. Chaque étape renvoie à la page du livret où l'information attend déjà.
 * Renvois de page FIXES par construction (cf. sommaire) — à jour de l'ordre de generator.ts.
 */
export function generateFirstDaysPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Pour vos proches, le moment venu',
    title: 'Les dix premiers jours',
    mission: 'Personne n’a l’esprit aux démarches ce jour-là. Cette page les met dans l’ordre.',
  });

  const steps: Array<[string, string]> = [
    ['Jours 1 – 2', 'Faire constater le décès et obtenir le certificat médical.'],
    [
      'Jours 1 – 6',
      'Déclarer le décès à la mairie de la commune ; contacter la pompe funèbre. Les volontés et le contact choisis sont page 27.',
    ],
    [
      'Jours 7 – 10',
      'Prévenir la banque, l’employeur ou les caisses de retraite, les assureurs. Les contacts attendent page 9, les comptes et contrats page 15.',
    ],
    [
      'Ensuite',
      'Prendre rendez-vous chez le notaire, avec ce livret : le résumé de la page 39 a été écrit pour lui. La pension de réversion du conjoint se demande auprès des caisses (voir page 41).',
    ],
  ];

  steps.forEach(([when, what]) => {
    doc
      .fontSize(fonts.size.tiny)
      .font(fonts.body)
      .fillColor(colors.GOLD)
      .text(when.toUpperCase(), page.margin.left, y + 3, { characterSpacing: 0.5, width: 72 });
    doc
      .fontSize(fonts.size.body)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(what, page.margin.left + 82, y, {
        width: page.width - page.margin.left - page.margin.right - 82,
        lineGap: 2,
      });
    y = doc.y + spacing.md;
    doc
      .strokeColor(colors.BORDER)
      .lineWidth(0.5)
      .moveTo(page.margin.left, y - 6)
      .lineTo(page.width - page.margin.right, y - 6)
      .stroke();
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Les démarches et délais officiels peuvent évoluer : la liste complète et à jour est publiée sur service-public.fr. Cette page ordonne l’essentiel, sans remplacer les organismes compétents.'
  );
}

/**
 * NOUVELLE PAGE V4.2 — « Où s'adresser » : orientation institutionnelle par territoire.
 * Uniquement des institutions (jamais de cabinet privé) — zéro risque de favoritisme.
 */
export function generateDirectoryPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  const territoire = data.caseFile?.territoire || 'guadeloupe';
  const isGp = territoire === 'guadeloupe';

  let y = addPageTitle(doc, page.margin.top, {
    kicker: isGp ? 'En Guadeloupe' : 'En Martinique',
    title: 'Où s’adresser',
    mission: 'Les institutions qui comptent, réunies sur une page.',
  });

  const entries: Array<[string, string]> = [
    [
      isGp ? 'Chambre des notaires de la Guadeloupe' : 'Chambre des notaires de la Martinique',
      'Pour trouver un notaire, ou en changer. Le notaire est l’interlocuteur central de toute succession.',
    ],
    [
      'CGSS (Caisse générale de sécurité sociale)',
      'Pension de réversion du conjoint survivant, capital décès : les demandes se font auprès des caisses, dans des délais parfois courts.',
    ],
    [
      isGp ? 'Agence des cinquante pas géométriques de la Guadeloupe' : 'Agence des cinquante pas géométriques de la Martinique',
      'Régularisation des occupations en zone littorale (cf. page 22).',
    ],
    [
      'CAF et France services',
      'Aides et accompagnement dans les démarches en ligne. Les maisons France services aident gratuitement, partout sur le territoire.',
    ],
    [
      'service-public.fr',
      'La référence officielle des démarches après un décès, toujours à jour.',
    ],
  ];

  entries.forEach(([name, role]) => {
    doc.fontSize(fonts.size.medium).font(fonts.heading).fillColor(colors.FOREST).text(name, page.margin.left, y);
    y = doc.y + 2;
    doc
      .fontSize(fonts.size.body)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(role, page.margin.left, y, { width: page.width - page.margin.left - page.margin.right, lineGap: 2 });
    y = doc.y + spacing.md;
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'TransmiExpert n’est lié à aucune de ces institutions : cette page oriente, elle ne recommande aucun cabinet ni prestataire privé.'
  );
}

/**
 * NOUVELLE PAGE V4.2 — « Un livre vivant » : le pont vers la version numérique.
 * Seule page « commerciale » du livre — et elle reste au service du lecteur.
 * Le QR est fourni par le générateur (cible différente selon l'édition).
 */
export function generateLivingBookPage(
  doc: PDFDoc,
  data: CaseFileData,
  pageNumber: number,
  qrPng?: Buffer
) {
  doc.addPage();
  addPageChrome(doc, { section: 'cloture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Ce livret n’est pas figé',
    title: 'Un livre vivant',
  });

  y = addNarrativeBlock(
    doc,
    y,
    isBlankMode()
      ? 'Ce livret existe aussi en version vivante : un espace personnel en ligne où chaque information saisie prépare la prochaine édition imprimée de ce livre, mise à jour à mesure que votre vie change. Rien n’est jamais à ressaisir.'
      : 'Votre espace personnel en ligne enrichit ce livre : ce que vous y ajoutez prépare sa prochaine édition, sans que vous ayez rien à ressaisir.'
  );

  const qrSize = 132;
  const qrX = (page.width - qrSize) / 2;
  const qrY = y + spacing.xl;
  if (qrPng) {
    doc.image(qrPng, qrX, qrY, { width: qrSize, height: qrSize });
  } else {
    doc.rect(qrX, qrY, qrSize, qrSize).strokeColor(colors.BORDER).lineWidth(0.5).stroke();
  }

  doc
    .fontSize(fonts.size.small)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text(
      isBlankMode() ? 'Scannez pour découvrir votre espace TransmiExpert' : 'Scannez pour retrouver votre espace personnel',
      0,
      qrY + qrSize + spacing.md,
      { width: page.width, align: 'center' }
    );

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'transmiexpert.fr. L’espace en ligne est proposé par abonnement ; ce livret papier reste pleinement utilisable sans lui.'
  );
}

/**
 * NOUVELLE PAGE V4.2 — colophon, comme dans les vrais livres, + encart
 * « Où conserver ce livret ». Dernière page du livre.
 */
export function generateColophonPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  doc.rect(0, 0, page.width, page.height).fill(colors.IVORY);
  doc.rect(0, 0, PDF_THEME.sectionBand.width, page.height).fill(colors.FOREST);

  const ownerName = data.identity
    ? [data.identity.prenoms, data.identity.nom_usage || data.identity.nom_naissance].filter(Boolean).join(' ')
    : undefined;
  const territoire = data.caseFile?.territoire === 'martinique' ? 'Martinique' : 'Guadeloupe';
  const edition = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const lines = isBlankMode()
    ? ['Livret de Succession, édition à compléter', `TransmiExpert, ${territoire}`, `Édité en ${edition}.`]
    : [
        ownerName ? `Ce livret a été préparé pour ${ownerName}` : 'Ce livret a été préparé',
        `par TransmiExpert, ${territoire}`,
        `Édition de ${edition}. Il évolue avec vous.`,
      ];

  let y = page.height * 0.3;
  lines.forEach((line, i) => {
    doc
      .fontSize(i === 0 ? fonts.size.medium : fonts.size.body)
      .font(fonts.italic)
      .fillColor(colors.INK)
      .text(line, 0, y, { width: page.width, align: 'center' });
    y = doc.y + spacing.sm;
  });

  const boxY = page.height * 0.52;
  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Où conserver ce livret', 0, boxY, { width: page.width, align: 'center' });
  doc
    .fontSize(fonts.size.body)
    .font(fonts.body)
    .fillColor(colors.INK)
    .text(
      'Chez vous, à un endroit connu d’au moins une personne de confiance. Une copie peut être déposée chez votre notaire, si vous le souhaitez. Surtout : que quelqu’un sache qu’il existe. Un livret que personne ne sait trouver ne protège personne.',
      page.margin.left + 14,
      doc.y + spacing.sm,
      { width: page.width - page.margin.left - page.margin.right - 28, align: 'center', lineGap: 3 }
    );

  doc
    .strokeColor(colors.GOLD)
    .lineWidth(1)
    .moveTo(page.width / 2 - 60, page.height - 96)
    .lineTo(page.width / 2 + 60, page.height - 96)
    .stroke();
  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('transmiexpert.fr', 0, page.height - 84, { width: page.width, align: 'center' });
  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text(String(pageNumber).padStart(2, '0'), 0, page.height - 42, { width: page.width, align: 'center' });
}
