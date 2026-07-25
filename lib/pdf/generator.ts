/**
 * GENERATOR V4.2 — orchestrateur du Livret de Succession
 *
 * LE LIVRE : 44 pages, format 16 × 24 cm (cf. theme.ts), six sections ouvertes par des
 * intercalaires (proverbe créole + phrase d'entrée). Trois éditions sortent du même moteur :
 *
 *  - personnelle    : generateUnifiedPDF(data)   — le livre du client abonné, restitué ;
 *  - vierge         : generateBlankPDF()          — à remplir à la main (produit 90 €) ;
 *  - démonstration  : generateDemoPDF()           — dossier fictif « Marie-Claire Dupont »,
 *                     l'exemplaire qui circule pendant les conférences de Luc.
 *
 *  La page « Un livre vivant » (p. 43) porte un code QR : vers l'espace de l'utilisateur
 *  (édition personnelle) ou vers la découverte de l'offre (éditions vierge et démonstration).
 *
 * ⚠️ La pagination est FIXE par construction : le sommaire (p. 3), les renvois de page
 * (« les dix premiers jours », p. 40) et les intercalaires supposent l'ordre ci-dessous.
 * Tout changement d'ordre doit mettre à jour generateTOCPage et generateFirstDaysPage.
 */

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { PDF_THEME, SECTION_DIVIDERS } from './theme';
import { setBlankMode, addSectionDivider } from './components';
import { buildBlankCaseFileData } from './blank-data';
import { buildDemoCaseFileData } from './demo-data';
import type { CaseFileData, ReaderProfile } from './types';

import {
  generateCoverPage,
  generateBelongsPage,
  generateTOCPage,
  generateWelcomePage,
  generateDashboardPage,
  generateFrameworkPage,
} from './templates/section-ouverture';

import {
  generateProfilePage,
  generateFamilyPage,
  generateContactsPage,
  generateTrustPeoplePage,
  generateIncapacityPage,
} from './templates/section-vous-et-les-votres';

import {
  generatePatrimonyOverviewPage,
  generatePropertiesPage,
  generateAccountsPage,
  generateDebtsPage,
  generateBusinessPage,
  generateDonationsPage,
  generateValuablesPage,
  generateExistingIndivisionsPage,
  generateIndivisionGlossaryPage,
  generateLandTenurePage,
} from './templates/section-patrimoine';

import {
  generateDocumentsIndexPage,
  generateMissingDocumentsPage,
  generateDigitalLifePage,
  generateEmergencyPage,
} from './templates/section-documents-securite';

import {
  generateObjectivesPage,
  generateDecisionsPage,
  generateFamilyMeetingPage,
  generateRemoteFamilyPage,
  generateMeetingReportPage,
  generateActionPlanPage,
  generateNotesPage,
} from './templates/section-decisions-methode';

import {
  generateSummaryPage,
  generateClosingPage,
  generatePersonalWordPage,
  generateFirstDaysPage,
  generateDirectoryPage,
  generateLivingBookPage,
  generateColophonPage,
} from './templates/section-cloture';

type PDFDoc = any;

const APP_URL = 'https://new-livret-transmiexpert.vercel.app';
const OFFER_URL = 'https://transmiexpert.fr/pack-serenite.html';

function divider(doc: PDFDoc, section: keyof typeof SECTION_DIVIDERS, pageNumber: number) {
  const d = SECTION_DIVIDERS[section];
  addSectionDivider(doc, { section: section as any, pageNumber, ...d });
}

function buildDocument(
  data: CaseFileData,
  readerProfile: ReaderProfile = 'anticipateur',
  qrPng?: Buffer
): PDFDoc {
  const doc: PDFDoc = new (PDFDocument as any)({
    size: [PDF_THEME.page.width, PDF_THEME.page.height],
    // Marges PDFKit à zéro, volontairement : la mise en page est entièrement manuelle
    // (PDF_THEME.page.margin est appliqué par les templates). Avec des marges non nulles,
    // PDFKit insère une page automatique dès qu'un texte est posé sous la marge basse.
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: false,
    info: {
      Title: 'Livret de Succession — TransmiExpert',
      Author: 'TransmiExpert',
    },
  });

  let p = 1;

  // --- Ouverture (p. 1-5) ---
  generateCoverPage(doc, data); // 01 — couverture, sans chrome
  generateBelongsPage(doc, data, ++p); // 02 — « Ce livret appartient à » (NOUVEAU V4.2)
  generateTOCPage(doc, data, ++p); // 03 — sommaire (NOUVEAU V4.2)
  generateWelcomePage(doc, data, ++p, readerProfile); // 04 — le mot de Luc
  generateFrameworkPage(doc, data, ++p); // 05 — le cadre

  // --- I · Vous et les vôtres (p. 6-11) ---
  divider(doc, 'vous_et_les_votres', ++p); // 06
  generateProfilePage(doc, data, ++p); // 07
  generateFamilyPage(doc, data, ++p); // 08 — prose interprétée + histoire familiale (V4.2)
  generateContactsPage(doc, data, ++p); // 09
  generateTrustPeoplePage(doc, data, ++p); // 10
  generateIncapacityPage(doc, data, ++p); // 11 — « Prévoir l'imprévu » (NOUVEAU V4.2)

  // --- II · Votre patrimoine (p. 12-22) ---
  divider(doc, 'patrimoine', ++p); // 12
  generatePatrimonyOverviewPage(doc, data, ++p); // 13
  generatePropertiesPage(doc, data, ++p); // 14
  generateAccountsPage(doc, data, ++p); // 15
  generateDebtsPage(doc, data, ++p); // 16 — dettes ET créances (V4.2)
  generateBusinessPage(doc, data, ++p); // 17
  generateDonationsPage(doc, data, ++p); // 18
  generateValuablesPage(doc, data, ++p); // 19 — objets & souvenirs (NOUVEAU V4.2)
  generateExistingIndivisionsPage(doc, data, ++p); // 20
  generateIndivisionGlossaryPage(doc, data, ++p); // 21
  generateLandTenurePage(doc, data, ++p); // 22 — repères fonciers (NOUVEAU V4.2)

  // --- III · Documents & sécurité (p. 23-27) ---
  divider(doc, 'documents_securite', ++p); // 23
  generateDocumentsIndexPage(doc, data, ++p); // 24
  generateMissingDocumentsPage(doc, data, ++p); // 25
  generateDigitalLifePage(doc, data, ++p); // 26
  generateEmergencyPage(doc, data, ++p); // 27

  // --- IV · Décisions & méthode (p. 28-35) ---
  divider(doc, 'decisions_methode', ++p); // 28
  generateObjectivesPage(doc, data, ++p); // 29
  generateDecisionsPage(doc, data, ++p); // 30
  generateFamilyMeetingPage(doc, data, ++p); // 31
  generateRemoteFamilyPage(doc, data, ++p); // 32 — la famille à distance (NOUVEAU V4.2)
  generateMeetingReportPage(doc, data, ++p); // 33
  generateActionPlanPage(doc, data, ++p); // 34
  generateNotesPage(doc, data, ++p); // 35 — notes (NOUVEAU V4.2)

  // --- V · Clôture (p. 36-44) ---
  divider(doc, 'cloture', ++p); // 36
  generateDashboardPage(doc, data, ++p); // 37 — « Où en est votre dossier » (déplacé, V4.2)
  generatePersonalWordPage(doc, data, ++p); // 38 — un mot pour les vôtres (NOUVEAU V4.2)
  generateSummaryPage(doc, data, ++p); // 39
  generateFirstDaysPage(doc, data, ++p); // 40 — les dix premiers jours (NOUVEAU V4.2)
  generateDirectoryPage(doc, data, ++p); // 41 — où s'adresser (NOUVEAU V4.2)
  generateClosingPage(doc, data, ++p); // 42
  generateLivingBookPage(doc, data, ++p, qrPng); // 43 — un livre vivant + QR (NOUVEAU V4.2)
  generateColophonPage(doc, data, ++p); // 44 — colophon (NOUVEAU V4.2)

  return doc;
}

async function makeQr(url: string): Promise<Buffer | undefined> {
  try {
    return await QRCode.toBuffer(url, {
      width: 300,
      margin: 1,
      color: { dark: PDF_THEME.colors.FOREST, light: PDF_THEME.colors.IVORY },
    });
  } catch {
    // Sans QR, la page « Un livre vivant » affiche un cadre discret — jamais bloquant.
    return undefined;
  }
}

function render(
  data: CaseFileData,
  readerProfile: ReaderProfile | undefined,
  qrPng?: Buffer
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = buildDocument(data, readerProfile, qrPng);
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error: Error) => reject(error));
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/** Édition personnelle — le livre du client, restitué depuis son dossier. */
export async function generateUnifiedPDF(
  data: CaseFileData,
  readerProfile?: ReaderProfile
): Promise<Buffer> {
  return render(data, readerProfile, await makeQr(APP_URL));
}

/**
 * Édition vierge — le produit « Livret design vierge » (90 €, à remplir à la main).
 * Le drapeau est reposé dans un finally : le dessin étant entièrement synchrone dans
 * buildDocument, aucune autre génération ne peut s'intercaler pendant qu'il est actif.
 */
export async function generateBlankPDF(): Promise<Buffer> {
  // Le QR est généré AVANT d'activer le mode vierge : makeQr est asynchrone, et le
  // drapeau de module ne doit encadrer que le dessin (synchrone) — sinon une autre
  // génération pourrait s'exécuter en mode vierge par accident.
  const qrPng = await makeQr(OFFER_URL);
  setBlankMode(true);
  try {
    return await render(buildBlankCaseFileData(), undefined, qrPng);
  } finally {
    setBlankMode(false);
  }
}

/**
 * Édition de démonstration — l'exemplaire de conférence (dossier fictif complet).
 * Réservée à l'équipe, comme l'édition vierge.
 */
export async function generateDemoPDF(): Promise<Buffer> {
  return render(buildDemoCaseFileData(), 'anticipateur', await makeQr(OFFER_URL));
}
