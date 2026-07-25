import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateDemoPDF } from '@/lib/pdf/generator';

export const dynamic = 'force-dynamic';

/**
 * Édition de démonstration — l'exemplaire de conférence (dossier fictif
 * « Marie-Claire Dupont », cf. lib/pdf/demo-data.ts). C'est le livre que Luc fait
 * circuler dans la salle : complet, réaliste, émouvant.
 *
 * Réservé à l'équipe, comme l'édition vierge (même liste d'autorisation).
 */
import { TEAM_EMAILS } from '@/lib/team';

function allowedEmails(): string[] {
  const fromEnv = process.env.BLANK_PDF_ALLOWED_EMAILS;
  if (!fromEnv) return TEAM_EMAILS;
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

    const pdfBuffer = await generateDemoPDF();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="livret-succession-edition-demonstration.pdf"',
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF démonstration :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
