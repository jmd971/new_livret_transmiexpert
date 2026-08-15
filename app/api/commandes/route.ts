import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireTeamUser } from '@/lib/team-server';

export const dynamic = 'force-dynamic';

/**
 * Livres à expédier — réservé à l'équipe (adresses postales de clients).
 * La table commandes n'a aucune policy RLS : elle n'est lisible que par la clé
 * service_role, donc uniquement à travers cette route.
 */
export async function GET(request: NextRequest) {
  const check = await requireTeamUser(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { data, error } = await createAdminClient()
      .from('commandes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return NextResponse.json({ commandes: data ?? [] });
  } catch (error) {
    console.error('Erreur lecture commandes :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}

const STATUTS = ['a_expedier', 'expediee', 'annulee'];

/** Met à jour le suivi d'expédition d'une commande. */
export async function PATCH(request: NextRequest) {
  const check = await requireTeamUser(request);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const { id, statut } = (await request.json()) as { id?: string; statut?: string };
    if (!id || !statut || !STATUTS.includes(statut)) {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }

    const { data, error } = await createAdminClient()
      .from('commandes')
      .update({ statut, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });

    return NextResponse.json({ commande: data });
  } catch (error) {
    console.error('Erreur mise à jour commande :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
