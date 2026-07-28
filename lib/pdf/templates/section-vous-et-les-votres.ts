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
  addRestitutionField,
  addLedgerTable,
  addPostureNote,
  addWritingLines,
  isBlankMode,
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

  if (isBlankMode()) {
    y = addNarrativeBlock(
      doc,
      y,
      'Notez ici ce qui compose votre famille : vos enfants, les liens particuliers, les situations que vos proches devraient connaître.'
    );
    y = addWritingLines(doc, y, 4);
  } else {
    // V4.2 — prose interprétée : la donnée devient une phrase (gabarits conditionnels,
    // aucune IA : ton maîtrisé, coût nul, rendu déterministe).
    const fc = data.familyContext;
    const parts: string[] = [];
    if (fc?.statut_conjugal) {
      const statut = (STATUT_CONJUGAL_LABELS[fc.statut_conjugal] || fc.statut_conjugal).toLowerCase();
      const regime =
        fc.statut_conjugal === 'marie'
          ? fc.contrat_mariage_existe
            ? ', avec un contrat de mariage'
            : ', sans contrat de mariage ; le régime de la communauté s’applique donc par défaut'
          : '';
      parts.push(`Vous êtes ${statut}${regime}.`);
    }
    if (fc?.enfants_mineurs) {
      parts.push(
        'Vous avez des enfants encore mineurs : c’est une donnée qui comptera dans chaque décision, et que ce livret garde en première ligne.'
      );
    }
    if (parts.length > 0) {
      y = addNarrativeBlock(doc, y, parts.join(' '));
      y += spacing.xs;
    }

    y = addNarrativeBlock(
      doc,
      y,
      data.caseFile?.histoire_familiale ||
        fc?.notes ||
        'Votre histoire familiale apparaîtra ici une fois racontée dans votre espace personnel. Quelques lignes suffisent : qui compose votre famille, ce qui la lie, ce qu’il faut savoir pour la comprendre.'
    );
  }

  y += spacing.lg;

  doc
    .fontSize(fonts.size.small)
    .font(fonts.heading)
    .fillColor(colors.FOREST)
    .text('Règles de communication recommandées', page.margin.left, y);
  y = doc.y + spacing.sm;

  const rules = [
    'Un seul canal principal (WhatsApp, email ou téléphone), avec un court récapitulatif écrit après chaque échange important.',
    'On échange sur les faits et les options disponibles ; les intentions se discutent en réunion, pas par message.',
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
  addLedgerTable(doc, y, ['Rôle', 'Nom', 'Téléphone', 'Email'], rows, [65, 110, 85, 105], {
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
    isBlankMode()
      ? 'Notez ici les personnes en qui vous avez toute confiance pour accompagner votre entourage, en complément, jamais en remplacement, des démarches notariales.'
      : 'Ces personnes ont été identifiées par vous comme des interlocuteurs de confiance pour votre entourage, en complément, jamais en remplacement, des démarches notariales.'
  );

  const rows = data.trustPeople.map((p) => [
    p.name,
    p.relationship,
    p.what_they_receive || '—',
    [p.phone, p.email].filter(Boolean).join(', ') || '—',
  ]);

  addLedgerTable(doc, y + spacing.sm, ['Nom', 'Lien', 'Ce qui leur revient', 'Contact'], rows, [80, 60, 110, 115], {
    emptyMessage:
      'Aucune personne de confiance désignée pour le moment. Vous pourrez en ajouter depuis votre espace personnel, à votre rythme.',
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    "Cette page organise vos souhaits ; elle ne se substitue pas à une clause bénéficiaire ou à une disposition testamentaire, qui relèvent d'un professionnel du droit."
  );
}


/**
 * NOUVELLE PAGE V4.2 — « Prévoir l'imprévu » : l'incapacité arrive statistiquement
 * avant la succession. Restitue legal_documents_status pour le mandat de protection
 * future et les directives anticipées — aucun champ nouveau en base.
 */
export function generateIncapacityPage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'vous_et_les_votres', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Vous et les vôtres',
    title: 'Prévoir l’imprévu',
    mission: 'Parce que l’incapacité arrive parfois avant la succession.',
  });

  y = addNarrativeBlock(
    doc,
    y,
    'On prépare sa succession ; on oublie souvent de préparer l’avant. Une hospitalisation, une perte d’autonomie, et ce sont les vôtres qui devraient décider sans savoir ce que vous auriez voulu. Trois dispositifs changent tout : le mandat de protection future, les directives anticipées, la personne de confiance médicale.'
  );
  y += spacing.sm;

  const find = (t: string) => data.legalDocuments.find((l) => l.doc_type === t);
  const statusOf = (t: string) => {
    const docStatus = find(t);
    if (!docStatus) return undefined;
    return docStatus.existe
      ? (docStatus.depose_chez ? `Établi, déposé chez ${docStatus.depose_chez}` : 'Établi')
      : 'À établir';
  };

  y = addRestitutionField(doc, y, 'Mandat de protection future', statusOf('mandat_protection'), {
    emptyText: 'Non renseigné. À envisager, sans urgence mais sans oubli',
  });
  y = addRestitutionField(doc, y, 'Directives anticipées', statusOf('directives_anticipees'), {
    emptyText: 'Non renseignées. Quelques lignes suffisent, et votre médecin peut vous guider',
  });
  y = addRestitutionField(doc, y, 'Personne de confiance médicale', undefined, {
    emptyText: 'À désigner auprès de votre médecin. C’est souvent l’une des personnes de la page précédente',
  });

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Le mandat de protection future et les directives anticipées sont des actes encadrés par la loi : leur rédaction se fait avec un professionnel du droit ou de la santé. Cette page organise vos intentions, elle ne les remplace pas.'
  );
}


/**
 * NOUVELLE PAGE V4.3 (48 pages) : l'arbre de famille, à compléter à la main dans
 * les trois éditions. Seul le nom du titulaire est prérempli quand il est connu.
 * C'est aussi un document utile : la liste des héritiers que l'acte de notoriété
 * officialisera un jour commence ici.
 */
export function generateFamilyTreePage(doc: PDFDoc, data: CaseFileData, pageNumber: number) {
  doc.addPage();
  addPageChrome(doc, { section: 'vous_et_les_votres', pageNumber });

  let y = addPageTitle(doc, page.margin.top, {
    kicker: 'Vous et les vôtres',
    title: 'Votre arbre de famille',
    mission: 'Trois générations sur une page : ceux dont vous venez, ceux qui viennent de vous.',
  });

  const usable = page.width - page.margin.left - page.margin.right;
  const ownerName = data.identity
    ? [data.identity.prenoms, data.identity.nom_usage || data.identity.nom_naissance].filter(Boolean).join(' ')
    : undefined;

  const drawRow = (caption: string, count: number, boxHeight: number, prefillFirst?: string) => {
    doc
      .fontSize(fonts.size.tiny)
      .font(fonts.body)
      .fillColor(colors.GREY)
      .text(caption.toUpperCase(), page.margin.left, y, { characterSpacing: 0.5 });
    y = doc.y + 5;
    const gap = 8;
    const boxWidth = (usable - gap * (count - 1)) / count;
    for (let i = 0; i < count; i++) {
      const x = page.margin.left + i * (boxWidth + gap);
      doc.roundedRect(x, y, boxWidth, boxHeight, 3).lineWidth(0.5).strokeColor(colors.BORDER).stroke();
      if (i === 0 && prefillFirst) {
        doc
          .fontSize(fonts.size.small)
          .font(fonts.italic)
          .fillColor(colors.INK)
          .text(prefillFirst, x + 6, y + boxHeight / 2 - 5, { width: boxWidth - 12, align: 'center' });
      } else {
        doc
          .strokeColor(colors.BORDER)
          .lineWidth(0.5)
          .moveTo(x + 8, y + boxHeight - 9)
          .lineTo(x + boxWidth - 8, y + boxHeight - 9)
          .stroke();
      }
    }
    y += boxHeight + spacing.md;
  };

  drawRow('Vos grands-parents', 4, 34);
  drawRow('Vos parents', 2, 36);
  drawRow('Vous, et la personne qui partage votre vie', 2, 36, isBlankMode() ? undefined : ownerName);
  drawRow('Vos enfants', 4, 36);
  drawRow('Vos petits-enfants', 5, 32);

  addPostureNote(
    doc,
    page.height - page.margin.bottom - 20,
    'Complétez au crayon, ajoutez au fil des naissances. Le jour venu, l’acte de notoriété du notaire officialisera cette liste : autant qu’elle soit déjà claire.'
  );
}
