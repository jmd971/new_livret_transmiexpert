import { NextRequest, NextResponse } from 'next/server';
import { loadCaseFileData } from '@/lib/pdf/data-loader';
import { generateUnifiedPDF } from '@/lib/pdf/generator';
import type { ReaderProfile } from '@/lib/pdf/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Le jeton de session de l'appelant est obligatoire : les lectures se font sous RLS,
    // un utilisateur ne peut donc générer que le livret de ses propres dossiers.
    const authHeader = request.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const body = await request.json();
    const { caseFileId, readerProfile } = body as {
      caseFileId: string;
      readerProfile?: ReaderProfile;
    };

    if (!caseFileId) {
      return NextResponse.json({ error: 'caseFileId requis' }, { status: 400 });
    }

    const data = await loadCaseFileData(caseFileId, accessToken);
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
