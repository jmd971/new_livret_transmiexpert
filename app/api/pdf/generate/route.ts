import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { loadCaseFileData } from '@/lib/pdf/data-loader';
import { generateUnifiedPDF } from '@/lib/pdf/generator';
import { isTeamEmail } from '@/lib/team';
import { ACTIVE_STATUSES } from '@/lib/subscription-shared';
import type { ReaderProfile } from '@/lib/pdf/types';

export const dynamic = 'force-dynamic';

/**
 * Contrôle d'abonnement côté serveur — le garde client (SubscriptionGate) n'est
 * que de l'UX. La génération du livret est le cœur payant du produit : sans
 * abonnement actif (et hors comptes équipe), on refuse. Lecture sous RLS avec
 * le jeton de l'appelant : chacun ne peut lire que sa propre ligne.
 */
async function checkSubscription(accessToken: string): Promise<NextResponse | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
  if (isTeamEmail(user.email)) return null;

  const { data } = await (supabase.from('subscriptions') as any)
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!data?.status || !ACTIVE_STATUSES.includes(data.status)) {
    return NextResponse.json(
      { error: 'La génération du livret est réservée aux abonnés. Rendez-vous sur la page tarifs pour vous abonner.' },
      { status: 402 }
    );
  }
  return null;
}

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

    const refusal = await checkSubscription(accessToken);
    if (refusal) return refusal;

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
