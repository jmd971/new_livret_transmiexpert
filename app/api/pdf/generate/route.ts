import { NextRequest, NextResponse } from 'next/server';
import { loadCaseFileData } from '@/lib/pdf/data-loader';
import { generateUnifiedPDF } from '@/lib/pdf/generator';
import type { ReaderProfile } from '@/lib/pdf/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseFileId, readerProfile } = body as {
      caseFileId: string;
      readerProfile?: ReaderProfile;
    };

    if (!caseFileId) {
      return NextResponse.json({ error: 'caseFileId requis' }, { status: 400 });
    }

    const data = await loadCaseFileData(caseFileId);
    const pdfBuffer = await generateUnifiedPDF(data, readerProfile);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="livret-succession.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
