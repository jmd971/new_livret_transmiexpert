/**
 * SECTION OUVERTURE — pages 1 à 4
 *
 * Cadrage de ton (appliqué à tout le fichier) :
 * - La couverture doit signaler "ceci a été fait pour vous", pas "voici un modèle".
 * - Le mot d'accueil incarne Luc dès la première page lue : chaleureux, direct, jamais scolaire.
 * - Le tableau de bord transforme la donnée technique (completion_score) en allié, jamais en note.
 * - La page de cadre pose la posture (ni notaire ni avocat) une seule fois, clairement, sans jargon.
 */

import { PDF_THEME, formatDate } from '../theme';
import {
  addPageChrome,
  addPageTitle,
  addNarrativeBlock,
  addProgressBar,
  addPullQuote,
  addPostureNote,
  addWatermark,
  addRestitutionField,
  isBlankMode,
} from '../components';
import type { CaseFileData, ReaderProfile } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateCoverPage(doc: PDFDoc, data: CaseFileData) {
  doc.addPage();
  doc.rect(0, 0, page.width, page.height).fill(colors.IVORY);

  const centerX = page.width / 2;
  const ownerName = data.identity
    ? [data.identity.prenoms, data.identity.nom_usage || data.identity.nom_naissance].filter(Boolean).join(' ')
    : undefined;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('TRANSMIEXPERT', 0, page.height * 0.13, { width: page.width, align: 'center', characterSpacing: 2 });

  doc
    .strokeColor(colors.GOLD)
    .lineWidth(1)
    .moveTo(centerX - 40, page.height * 0.13 + 26)
    .lineTo(centerX + 40, page.height * 0.13 + 26)
    .stroke();

  doc
    .fontSize(fonts.size.huge)
    .font(fonts.heading)
    .fillColor(colors.INK)
    .text('Livret de Succession', 0, page.height * 0.4, { width: page.width, align: 'center' });

  doc
    .fontSize(fonts.size.large)
    .font(fonts.italic)
    .fillColor(colors.FOREST)
    .text(isBlankMode() ? 'Pack Sérénité · Édition papier' : 'Pack Sérénité · Dossier personnel', 0, page.height * 0.475, {
      width: page.width,
      align: 'center',
    });

  if (isBlankMode()) {
    // Ligne de propriété à compléter à la main — remplace le « Préparé pour X » de l'édition personnalisée.
    doc
      .fontSize(fonts.size.tiny)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text('CE LIVRET APPARTIENT À', 0, page.height * 0.60, { width: page.width, align: 'center', characterSpacing: 1 });
    doc
      .strokeColor(colors.BORDER)
      .lineWidth(0.5)
      .moveTo(centerX - 110, page.height * 0.60 + 42)
      .lineTo(centerX + 110, page.height * 0.60 + 42)
      .stroke();
  } else if (ownerName) {
    doc
      .fontSize(fonts.size.medium)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(`Préparé pour ${ownerName}`, 0, page.height * 0.61, { width: page.width, align: 'center' });
  }

  if (!isBlankMode()) {
    doc
      .fontSize(fonts.size.tiny)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(`Généré le ${formatDate(new Date().toISOString())}`, 0, page.height - 110, {
        width: page.width,
        align: 'center',
      });
  }

  doc
    .strokeColor(colors.GOLD)
    .lineWidth(1)
    .moveTo(centerX - 100, page.height - 90)
    .lineTo(centerX + 100, page.height - 90)
    .stroke();

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('transmiexpert.fr', 0, page.height - 78, { width: page.width, align: 'center' });
}

export function generateWelcomePage(
  doc: PDFDoc,
  data: CaseFileData,
  pageNumber: number,
  readerProfile: ReaderProfile = 'anticipateur'
) {
  doc.addPage();
  addPageChrome(doc, { section: 'ouverture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Un mot avant de commencer',
    title: 'Ce livret vous appartient',
  });

  const openingByProfile: Record<ReaderProfile, string> = {
    crise:
      "Vous traversez une période où beaucoup de choses demandent à être clarifiées en même temps. Ce livret ne va pas tout résoudre d'un coup — mais il rassemble, page après page, ce qui est déjà su, pour que vous n'ayez plus à le porter seul dans votre tête. Commencez par les pages qui vous concernent le plus aujourd'hui : le reste attendra.",
    anticipateur:
      "Vous avez fait le choix, rare et précieux, de vous en occuper avant que la situation ne l'impose. Ce livret rassemble ce que vous nous avez confié — votre famille, votre patrimoine, vos volontés — dans un seul document que vous pourrez enrichir, partager ou simplement garder à portée de main.",
  };

  const blankOpening =
    "Ce livret est le vôtre. Page après page, il vous invite à consigner ce qui compte — votre famille, votre patrimoine, vos volontés — dans un seul document que vous pourrez enrichir à votre rythme, partager ou simplement garder à portée de main.";

  y = addNarrativeBlock(doc, y, isBlankMode() ? blankOpening : openingByProfile[readerProfile]);
  y += spacing.md;

  y = addPullQuote(
    doc,
    y,
    "Mon rôle n'est pas de décider pour vous, mais de vous aider à voir clairement — et à avancer, à votre rythme.",
    'Luc Silvestre, TransmiExpert'
  );

  y += spacing.xl;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.body)
    .fillColor(colors.INK)
    .text('Comment lire ce livret', page.margin.left, y);
  y = doc.y + spacing.sm;

  const bullets = isBlankMode()
    ? [
        "Chaque section vous guide, thème par thème : remplissez ce que vous savez, laissez le reste pour plus tard.",
        "Écrivez au crayon si vous préférez : un livret vivant se corrige et s'enrichit au fil du temps.",
        'La dernière page rassemble un résumé à partager, si vous le souhaitez, avec un proche ou un notaire.',
      ]
    : [
        'Chaque section restitue ce que vous avez déjà renseigné dans votre espace personnel.',
        "Les mentions « à compléter » ne sont jamais un jugement — c'est une invitation à revenir enrichir votre dossier quand vous le souhaitez.",
        'La dernière page rassemble un résumé à partager, si vous le souhaitez, avec un proche ou un notaire.',
      ];
  bullets.forEach((b) => {
    doc.circle(page.margin.left + 3, y + 6, 2).fill(colors.GOLD);
    doc
      .fontSize(fonts.size.body)
      .font(fonts.body)
      .fillColor(colors.INK)
      .text(b, page.margin.left + 14, y, { width: page.width - page.margin.left - page.margin.right - 14 });
    y = doc.y + spacing.sm;
  });
}

export function generateDashboardPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  // V4.2 : la page vit désormais dans la section Clôture (on ouvre un livre sur l'élan,
  // pas sur une note) — le chrome suit.
  addPageChrome(doc, { section: 'cloture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Votre situation en un regard',
    title: isBlankMode() ? 'Votre livret, à votre rythme' : 'Où en est votre dossier',
    mission: isBlankMode()
      ? 'Quelques repères à tenir à jour — pour vous, et pour ceux qui ouvriront ce livret un jour.'
      : 'Un repère, pas une note — pour savoir ce qui est déjà solide et ce qui peut encore être enrichi.',
  });

  if (isBlankMode()) {
    // Sur papier, ni score ni compteurs : des repères de suivi à compléter à la main.
    y = addRestitutionField(doc, y, 'Livret commencé le', undefined);
    y = addRestitutionField(doc, y, 'Dernière mise à jour le', undefined);
    y = addRestitutionField(doc, y, 'Où ce livret est conservé', undefined);
    y = addRestitutionField(doc, y, 'Personnes informées de son existence', undefined);
    y += spacing.md;
    addNarrativeBlock(
      doc,
      y,
      "Ce livret évolue avec vous. Datez vos mises à jour, et dites à une personne de confiance où il se trouve : un livret que personne ne sait trouver ne protège personne."
    );
    return;
  }

  const score = data.caseFile?.completion_score ?? 0;
  y = addProgressBar(doc, y, score, 'Taux de complétion de votre dossier');
  y += spacing.md;

  const counts: Array<[string, number]> = [
    ['Personnes de confiance désignées', data.trustPeople.length],
    ['Contacts clés renseignés', data.keyContacts.length],
    ['Biens recensés', data.properties.length],
    ['Comptes et contrats indexés', data.bankAccounts.length + data.insurances.length],
    ['Documents indexés', data.documents.length],
    ['Indivisions en cours', data.existingIndivisions.length],
  ];

  const colWidth = (page.width - page.margin.left - page.margin.right) / 2 - spacing.lg;
  counts.forEach(([label, count], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = page.margin.left + col * (colWidth + spacing.xl * 1.5);
    const rowY = y + row * 56;

    doc.fontSize(fonts.size.xxlarge).font(fonts.heading).fillColor(colors.FOREST).text(String(count), x, rowY);
    doc
      .fontSize(fonts.size.small)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(label, x + 46, rowY + 6, { width: colWidth - 46 });
  });

  y += Math.ceil(counts.length / 2) * 56 + spacing.xl;

  if (score < 100) {
    y = addNarrativeBlock(
      doc,
      y,
      "Ce livret évolue avec vous. Chaque information ajoutée dans votre espace personnel enrichira la prochaine version — sans que vous ayez à tout ressaisir."
    );
  }
}

export function generateFrameworkPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addWatermark(doc, 'CONFIANCE');
  addPageChrome(doc, { section: 'ouverture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Le cadre de notre accompagnement',
    title: 'Ce que ce livret est — et ce qu’il n’est pas',
  });

  y = addNarrativeBlock(
    doc,
    y,
    isBlankMode()
      ? "Ce document rassemble et organise les informations que vous choisirez d'y consigner. Il vous aide à préparer un rendez-vous, une réunion familiale, ou simplement à garder une vue d'ensemble claire de votre situation."
      : "Ce document rassemble et organise les informations que vous nous avez confiées. Il vous aide à préparer un rendez-vous, une réunion familiale, ou simplement à garder une vue d'ensemble claire de votre situation."
  );

  y += spacing.sm;

  y = addNarrativeBlock(
    doc,
    y,
    "TransmiExpert n'est ni notaire, ni avocat, ni expert-comptable. Notre rôle est celui d'un tiers neutre : nous facilitons le dialogue, organisons l'information et préparons le terrain — les actes et le conseil juridique restent, à chaque étape, l'affaire des professionnels du droit."
  );

  y += spacing.xl;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Confidentialité', page.margin.left, y);
  y = doc.y + spacing.xs;
  y = addNarrativeBlock(
    doc,
    y,
    'Les informations contenues dans ce livret vous appartiennent. Elles ne sont partagées avec personne sans votre décision explicite.'
  );

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'TransmiExpert · Médiation, organisation et coordination patrimoniale — hors conseil juridique réglementé.'
  );
}


/**
 * NOUVELLE PAGE V4.2 — page de garde « Ce livret appartient à ».
 * La première chose qu'on lit en ouvrant le livre : l'objet devient personnel,
 * et celui qui le trouve un jour sait quoi en faire.
 */
export function generateBelongsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  doc.rect(0, 0, page.width, page.height).fill(colors.IVORY);
  doc.rect(0, 0, PDF_THEME.sectionBand.width, page.height).fill(colors.FOREST);

  const centerX = page.width / 2;
  const ownerName = data.identity
    ? [data.identity.prenoms, data.identity.nom_usage || data.identity.nom_naissance].filter(Boolean).join(' ')
    : undefined;

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('CE LIVRET APPARTIENT À', 0, page.height * 0.22, {
      width: page.width,
      align: 'center',
      characterSpacing: 1.5,
    });

  if (!isBlankMode() && ownerName) {
    doc
      .fontSize(fonts.size.xlarge)
      .font(fonts.headingItalic)
      .fillColor(colors.INK)
      .text(ownerName, 0, page.height * 0.22 + 34, { width: page.width, align: 'center' });
  } else {
    doc
      .strokeColor(colors.BORDER)
      .lineWidth(0.5)
      .moveTo(centerX - 120, page.height * 0.22 + 64)
      .lineTo(centerX + 120, page.height * 0.22 + 64)
      .stroke();
  }

  const bodyY = page.height * 0.40;
  doc
    .fontSize(fonts.size.body)
    .font(fonts.body)
    .fillColor(colors.INK)
    .text(
      isBlankMode()
        ? 'Ce livret rassemble ce que son propriétaire choisit d’y confier. S’il vous est remis un jour, c’est qu’il vous fait confiance pour en faire bon usage : prenez le temps de le lire — tout ce qui compte y est organisé.'
        : 'Il a été préparé avec elle ou lui, à partir de ce qui a été choisi d’y être confié. Si ce livret vous est remis un jour, c’est qu’on vous fait confiance pour en faire bon usage : prenez le temps de le lire — tout ce qui compte y est déjà organisé.',
      page.margin.left + 16,
      bodyY,
      { width: page.width - page.margin.left - page.margin.right - 32, align: 'center', lineGap: 3 }
    );

  doc
    .strokeColor(colors.BORDER)
    .lineWidth(0.5)
    .moveTo(centerX - 100, page.height * 0.62)
    .lineTo(centerX + 100, page.height * 0.62)
    .stroke();
  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.italic)
    .fillColor(colors.GREY)
    .text('Signature — pour faire de ce livret le vôtre, à l’encre.', 0, page.height * 0.62 + 8, {
      width: page.width,
      align: 'center',
    });

  // Épigraphe demandée par Luc (27/07/2026) : citation créole de Luc-Hubert Séjor sur la
  // dynamique des conflits au moment du partage. Graphie transmise par Luc — variantes
  // notées : « Sélé ni bien à séparer, ké nou ka sav kimoun ki kimoun. » /
  // « Tant que o poko sépare bien, o poko sav kimoun ki bien, bien, bien. »
  // La graphie FINALE reste à confirmer avec Luc avant impression.
  const epigraphY = page.height * 0.74;
  doc
    .fontSize(fonts.size.medium)
    .font(fonts.italic)
    .fillColor(colors.FOREST)
    .text('« Sélé ki ni bien à séparer, ké nou ka sav kimoun ki bien. »', page.margin.left, epigraphY, {
      width: page.width - page.margin.left - page.margin.right,
      align: 'center',
      lineGap: 3,
    });
  doc
    .fontSize(fonts.size.small)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('C’est quand il y a des biens à partager qu’on découvre qui est qui.', page.margin.left, doc.y + 6, {
      width: page.width - page.margin.left - page.margin.right,
      align: 'center',
    });
  doc
    .fontSize(fonts.size.small)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text('— Luc-Hubert Séjor', page.margin.left, doc.y + 4, {
      width: page.width - page.margin.left - page.margin.right,
      align: 'center',
    });
  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.italic)
    .fillColor(colors.GREY)
    .text(
      'Ce livret existe pour déjouer ce proverbe : que le moment venu, les vôtres n’aient rien à découvrir — seulement à se souvenir.',
      page.margin.left + 20,
      doc.y + 10,
      { width: page.width - page.margin.left - page.margin.right - 40, align: 'center', lineGap: 2 }
    );

  doc
    .fontSize(fonts.size.tiny)
    .font(fonts.body)
    .fillColor(colors.GREY)
    .text(String(pageNumber).padStart(2, '0'), 0, page.height - 42, { width: page.width, align: 'center' });
}

/**
 * NOUVELLE PAGE V4.2 — sommaire. Pagination FIXE par construction (44 pages) :
 * si l'ordre des pages change dans generator.ts, mettre ce sommaire à jour.
 */
export function generateTOCPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'ouverture', pageNumber });

  let y = addPageTitle(doc, page.margin.top, { kicker: 'Pour vous repérer', title: 'Sommaire' });

  const entries: Array<[string, string, boolean]> = [
    ['Le mot de Luc', '04', false],
    ['Le cadre de notre accompagnement', '05', false],
    ['I · Vous et les vôtres', '06', true],
    ['Votre profil · votre famille · vos contacts', '07', false],
    ['Personnes de confiance · prévoir l’imprévu', '10', false],
    ['II · Votre patrimoine', '12', true],
    ['Biens · comptes et contrats · dettes et créances', '14', false],
    ['Entreprise · donations · objets et souvenirs', '17', false],
    ['Indivisions en cours · repères Letchimy et fonciers', '20', false],
    ['III · Documents & sécurité', '23', true],
    ['Vos documents · pièces à réunir', '24', false],
    ['Vie numérique · volontés et urgence', '26', false],
    ['IV · Décisions & méthode', '28', true],
    ['Objectifs · décisions en cours', '29', false],
    ['Réunion familiale · la famille à distance', '31', false],
    ['Compte-rendu · plan d’action · notes', '33', false],
    ['V · Clôture', '36', true],
    ['Où en est votre dossier · un mot pour les vôtres', '37', false],
    ['Résumé à partager · les dix premiers jours', '39', false],
    ['Où s’adresser · un livre vivant', '41', false],
  ];

  const width = page.width - page.margin.left - page.margin.right;
  entries.forEach(([label, num, isSection]) => {
    const rowY = y;
    doc
      .fontSize(isSection ? fonts.size.medium : fonts.size.body)
      .font(isSection ? fonts.heading : fonts.body)
      .fillColor(isSection ? colors.FOREST : colors.INK)
      .text(label, page.margin.left, rowY, { width: width - 40 });
    doc
      .fontSize(isSection ? fonts.size.medium : fonts.size.body)
      .font(isSection ? fonts.heading : fonts.body)
      .fillColor(isSection ? colors.GOLD : colors.GREY)
      .text(num, page.margin.left, rowY, { width, align: 'right' });
    y = doc.y + (isSection ? spacing.md : spacing.sm);
    if (isSection) {
      doc
        .strokeColor(colors.BORDER)
        .lineWidth(0.5)
        .moveTo(page.margin.left, y - 4)
        .lineTo(page.margin.left + width, y - 4)
        .stroke();
    }
  });
}
