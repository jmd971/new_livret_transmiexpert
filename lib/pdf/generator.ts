/**
 * GENERATOR V4 — orchestrateur du Livret de Succession
 *
 * Compatible avec l'API existante de l'application (app/api/pdf/generate/route.ts) :
 * même signature `generateUnifiedPDF(data): Promise<Buffer>`, pour un remplacement à coût
 * d'intégration minimal une fois la V4 validée.
 *
 * Changement de fond par rapport à la V3 : il n'y a plus de branchement par `kind`
 * (urgence24h / famille / notaire, code mort dans templates/cover-page.ts de la V3).
 * Un seul document est produit ; seule la partie "Ouverture" change d'accent selon `readerProfile`.
 */

import PDFDocument from 'pdfkit';
import { PDF_THEME } from './theme';
import type { CaseFileData, ReaderProfile } from './types';

import {
  generateCoverPage,
  generateWelcomePage,
  generateDashboardPage,
  generateFrameworkPage,
} from './templates/section-ouverture';

import {
  generateProfilePage,
  generateFamilyPage,
  generateContactsPage,
  generateTrustPeoplePage,
} from './templates/section-vous-et-les-votres';

import {
  generatePatrimonyOverviewPage,
  generatePropertiesPage,
  generateAccountsPage,
  generateDebtsPage,
  generateIndivisionGlossaryPage,
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
  generateMeetingReportPage,
  generateActionPlanPage,
} from './templates/section-decisions-methode';

import { generateSummaryPage, generateClosingPage } from './templates/section-cloture';

type PDFDoc = any;

function buildDocument(data: CaseFileData, readerProfile: ReaderProfile = 'anticipateur'): PDFDoc {
  const doc: PDFDoc = new (PDFDocument as any)({
    size: [PDF_THEME.page.width, PDF_THEME.page.height],
    margins: {
      top: PDF_THEME.page.margin.top,
      bottom: PDF_THEME.page.margin.bottom,
      left: PDF_THEME.page.margin.left,
      right: PDF_THEME.page.margin.right,
    },
    autoFirstPage: false, // chaque page est ouverte explicitement par les fonctions generateXPage
    info: {
      Title: 'Livret de Succession — TransmiExpert',
      Author: 'TransmiExpert',
    },
  });

  let p = 1;

  // --- Ouverture (pages 1-4) ---
  generateCoverPage(doc, data); // page 1, sans chrome (couverture)
  generateWelcomePage(doc, data, ++p, readerProfile); // page 2
  generateDashboardPage(doc, data, ++p); // page 3
  generateFrameworkPage(doc, data, ++p); // page 4

  // --- Vous et les vôtres (pages 5-8) ---
  generateProfilePage(doc, data, ++p);
  generateFamilyPage(doc, data, ++p);
  generateContactsPage(doc, data, ++p);
  generateTrustPeoplePage(doc, data, ++p); // NOUVEAU

  // --- Votre patrimoine (pages 9-13) ---
  generatePatrimonyOverviewPage(doc, data, ++p);
  generatePropertiesPage(doc, data, ++p);
  generateAccountsPage(doc, data, ++p);
  generateDebtsPage(doc, data, ++p);
  generateIndivisionGlossaryPage(doc, data, ++p); // NOUVEAU

  // --- Documents & sécurité (pages 14-17) ---
  generateDocumentsIndexPage(doc, data, ++p);
  generateMissingDocumentsPage(doc, data, ++p);
  generateDigitalLifePage(doc, data, ++p); // NOUVEAU
  generateEmergencyPage(doc, data, ++p); // NOUVEAU

  // --- Décisions & méthode (pages 18-22) ---
  generateObjectivesPage(doc, data, ++p);
  generateDecisionsPage(doc, data, ++p);
  generateFamilyMeetingPage(doc, data, ++p);
  generateMeetingReportPage(doc, data, ++p);
  generateActionPlanPage(doc, data, ++p);

  // --- Clôture (pages 23-24) ---
  generateSummaryPage(doc, data, ++p);
  generateClosingPage(doc, data, ++p);

  return doc;
}

export async function generateUnifiedPDF(
  data: CaseFileData,
  readerProfile?: ReaderProfile
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = buildDocument(data, readerProfile);
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
