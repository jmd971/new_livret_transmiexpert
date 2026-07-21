/**
 * SECTION DOCUMENTS & SÉCURITÉ — pages 17 à 20
 *
 * Les pages "Votre vie numérique" et "En cas d'urgence" sont NOUVELLES et touchent à des sujets
 * sensibles (accès numériques après un décès, dispositions funéraires). Cadrage de ton appliqué :
 * - Registre factuel et respectueux, jamais dramatisé ni maudlin.
 * - On restitue des volontés déjà exprimées par le client — on ne les sollicite jamais ici,
 *   et on ne spécule jamais sur ce que le client n'a pas renseigné.
 * - Aucune formule creuse de réconfort : la sobriété du ton EST la marque de respect.
 */

import { PDF_THEME, STATUS_LABELS, DOC_TYPE_LABELS, DIGITAL_ASSET_LABELS, CEREMONIE_LABELS, CHOIX_FUNERAIRE_LABELS, formatDate, formatAmount } from '../theme';
import { addPageChrome, addPageTitle, addNarrativeBlock, addLedgerTable, addRestitutionField, addPostureNote, addWritingLines, isBlankMode } from '../components';
import type { CaseFileData } from '../types';

type PDFDoc = any;
const { colors, fonts, page, spacing } = PDF_THEME;

export function generateDocumentsIndexPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'documents_securite', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Documents & sécurité',
    title: 'Vos documents, en un coup d’œil',
    mission: 'Ce qui est à jour, ce qui reste à vérifier — sans jugement, juste un état des lieux.',
  });

  const rows = data.documents.map((d) => [
    DOC_TYPE_LABELS[d.doc_type] || d.doc_type,
    STATUS_LABELS[d.status] || d.status,
    d.location_hint || '—',
    d.expiry_date ? formatDate(d.expiry_date) : '—',
  ]);

  y = addLedgerTable(doc, y, ['Document', 'Statut', 'Où le trouver', 'Échéance'], rows, [140, 90, 140, 105], {
    emptyMessage: 'Aucun document indexé pour le moment.',
  });

  y += spacing.lg;
  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Actes et dispositions légales', page.margin.left, y);
  y = doc.y + spacing.sm;

  const legalRows = data.legalDocuments.map((l) => [
    l.doc_type,
    l.existe ? 'Existe' : 'À établir',
    l.depose_chez || '—',
    l.date_document ? formatDate(l.date_document) : '—',
  ]);
  addLedgerTable(doc, y, ['Type', 'Statut', 'Déposé chez', 'Date'], legalRows, [130, 90, 145, 110], {
    emptyMessage: 'Aucune disposition légale renseignée pour le moment.',
  });
}

export function generateMissingDocumentsPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'documents_securite', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Documents & sécurité',
    title: 'Pièces à réunir',
    mission: 'La liste pratique pour constituer un dossier solide, sans repartir de zéro à chaque fois.',
  });

  const missing = data.documents.filter((d) => d.status === 'manquant' || d.status === 'a_verifier');
  const rows = missing.map((d) => [DOC_TYPE_LABELS[d.doc_type] || d.doc_type, STATUS_LABELS[d.status] || d.status, d.note || '—']);

  addLedgerTable(doc, y, ['Document', 'Statut', 'Notes'], rows, [160, 100, 215], {
    emptyMessage: 'Tous vos documents indexés sont à jour — rien à relancer pour le moment.',
  });
}

/**
 * NOUVELLE PAGE — vie numérique. Donnée capturée par l'application (écran /app/vie-numerique,
 * table digital_assets) mais absente du générateur V3.
 */
export function generateDigitalLifePage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'documents_securite', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Documents & sécurité',
    title: 'Votre vie numérique',
    mission: 'Comptes, accès et abonnements — pour que rien ne se perde dans le numérique.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'Une part croissante de nos vies se trouve dans des comptes en ligne. Cette page recense ceux que vous avez choisi de documenter, et où en retrouver l’accès.'
  );

  const rows = data.digitalAssets.map((a) => [
    DIGITAL_ASSET_LABELS[a.type] || a.type,
    a.fournisseur,
    a.ou_trouver_acces,
    a.valeur_estimee ? formatAmount(a.valeur_estimee) : '—',
  ]);

  addLedgerTable(doc, y + spacing.sm, ['Type', 'Fournisseur', 'Où trouver l’accès', 'Valeur estimée'], rows, [90, 130, 160, 95], {
    emptyMessage: 'Aucun actif numérique renseigné pour le moment.',
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    "Par sécurité, ce livret n'affiche jamais d'identifiants ou de mots de passe en clair — seulement l'endroit où les retrouver."
  );
}

/**
 * NOUVELLE PAGE — sujet sensible. Restitue emergency_checklist et funeral_wishes.
 * Ton : registre factuel et respectueux. Aucune donnée n'est sollicitée sur cette page ;
 * on affiche uniquement ce que le client a déjà choisi de consigner.
 */
export function generateEmergencyPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'documents_securite', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Documents & sécurité',
    title: 'Vos volontés, consignées',
    mission: 'Un repère clair pour vos proches, le jour où ils en auront besoin.',
  });

  const fw = data.funeralWishes;
  if (fw || isBlankMode()) {
    y = addRestitutionField(doc, y, 'Type de cérémonie', fw?.ceremonie_type ? CEREMONIE_LABELS[fw.ceremonie_type] : undefined);
    y = addRestitutionField(doc, y, 'Choix', fw?.choix ? CHOIX_FUNERAIRE_LABELS[fw.choix] : undefined);
    y = addRestitutionField(doc, y, 'Lieu souhaité', fw?.lieu);
    y = addRestitutionField(doc, y, 'Contact pompes funèbres', fw?.pompe_funebre_contact);
    if (fw?.volontes_libres || isBlankMode()) {
      y += spacing.sm;
      doc
        .fontSize(fonts.size.small)
        .font(fonts.heading)
        .fillColor(colors.FOREST)
        .text('Volontés complémentaires', page.margin.left, y);
      y = doc.y + spacing.xs;
      y = isBlankMode() ? addWritingLines(doc, y, 2) : addNarrativeBlock(doc, y, fw!.volontes_libres!);
    }
  } else {
    y = addNarrativeBlock(
      doc,
      y,
      "Vous n'avez pas encore consigné de volontés sur cette page. Vous pourrez le faire depuis votre espace personnel, quand vous le souhaiterez — rien ici ne presse."
    );
  }

  y += spacing.xl;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Ce qu’il faut savoir faire, dans l’ordre', page.margin.left, y);
  y = doc.y + spacing.sm;

  const rows = data.emergencyChecklist.map((item) => [item.notes || item.task_key, STATUS_LABELS[item.status] || item.status]);
  addLedgerTable(doc, y, ['Étape', 'Statut'], rows, [305, 105], {
    emptyMessage: 'Aucune étape consignée pour le moment.',
    blankRows: 4, // page déjà chargée en édition vierge (4 champs + volontés complémentaires)
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Ces informations organisent vos souhaits pour faciliter la tâche de vos proches ; elles ne remplacent aucune démarche officielle auprès d’un notaire ou d’une pompe funèbre.'
  );
}
