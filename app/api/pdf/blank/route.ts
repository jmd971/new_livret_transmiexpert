import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateBlankPDF } from '@/lib/pdf/generator';

export const dynamic = 'force-dynamic';

/**
 * Édition vierge — fichier d'impression du produit « Livret design vierge » (90 €).
 * Mêmes 27 pages et mêmes thématiques que le livret personnalisé, champs et tableaux
 * rendus en lignes d'écriture manuscrite (cf. mode vierge dans lib/pdf/components.ts).
 *
 * Réservé à l'équipe : ce fichier part chez l'imprimeur, il n'est pas distribué aux
 * abonnés (le produit vendu est le livret papier, pas le PDF). La liste des comptes
 * autorisés est surchargeable via BLANK_PDF_ALLOWED_EMAILS (emails séparés par des virgules).
 */
const DEFAULT_ALLOWED_EMAILS = ['jdolmare@gmail.com', 'luc@transmiexpert.fr'];

function allowedEmails(): string[] {
  const fromEnv = process.env.BLANK_PDF_ALLOWED_EMAILS;
  if (!fromEnv) return DEFAULT_ALLOWED_EMAILS;
  return fromEnv.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide ou expirée — reconnectez-vous.' }, { status: 401 });
    }

    if (!user.email || !allowedEmails().includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Accès réservé à l’équipe TransmiExpert.' }, { status: 403 });
    }

    const pdfBuffer = await generateBlankPDF();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="livret-succession-edition-vierge.pdf"',
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF vierge :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
