'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type Commande = {
  id: string;
  type: 'livre_vierge' | 'pack' | 'accompagnee';
  email: string | null;
  nom: string | null;
  telephone: string | null;
  adresse: {
    line1?: string | null;
    line2?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;
  montant_centimes: number | null;
  statut: 'a_expedier' | 'expediee' | 'annulee';
  created_at: string;
};

const LIBELLE_TYPE: Record<Commande['type'], string> = {
  livre_vierge: 'Livre vierge',
  pack: 'Pack Sérénité',
  accompagnee: 'Transmission accompagnée',
};

const LIBELLE_STATUT: Record<Commande['statut'], string> = {
  a_expedier: 'À expédier',
  expediee: 'Expédiée',
  annulee: 'Annulée',
};

function formatAdresse(a: Commande['adresse']): string {
  if (!a) return '—';
  return [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(' '), a.country]
    .filter(Boolean)
    .join(', ');
}

/** Suivi des livres à imprimer et à expédier. Page d'équipe, pas de gating d'abonnement. */
export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const withToken = useCallback(async () => {
    const {
      data: { session },
    } = await createClient().auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const charger = useCallback(async () => {
    const token = await withToken();
    if (!token) {
      setError('Connectez-vous avec votre compte TransmiExpert pour voir les commandes.');
      return;
    }
    const res = await fetch('/api/commandes', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Lecture impossible.');
      return;
    }
    setError(null);
    setCommandes(data.commandes);
  }, [withToken]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function changerStatut(id: string, statut: Commande['statut']) {
    setEnCours(id);
    try {
      const token = await withToken();
      const res = await fetch('/api/commandes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, statut }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Mise à jour impossible.');
      setCommandes((liste) => (liste ?? []).map((c) => (c.id === id ? { ...c, statut } : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mise à jour impossible.');
    } finally {
      setEnCours(null);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <p className="text-sm uppercase tracking-widest text-gold mb-3">TransmiExpert · équipe</p>
      <h1 className="font-serif text-3xl text-ink mb-2">Livres à expédier</h1>
      <p className="text-ink/70 mb-10">
        Une ligne par paiement encaissé : le livre vierge acheté seul, et le livre imprimé au nom
        du client inclus dans la première année du Pack et de la Transmission accompagnée.
      </p>

      {error && (
        <div className="mb-8 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}{' '}
          <Link href="/login" className="underline underline-offset-2">
            Se connecter
          </Link>
        </div>
      )}

      {!commandes && !error && (
        <p className="flex items-center gap-2 text-ink/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </p>
      )}

      {commandes && commandes.length === 0 && (
        <p className="text-ink/60">Aucune commande pour l’instant.</p>
      )}

      {commandes && commandes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-ink/60 border-b border-gold/30">
              <tr>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Formule</th>
                <th className="py-2 pr-4 font-medium">Client</th>
                <th className="py-2 pr-4 font-medium">Livraison</th>
                <th className="py-2 pr-4 font-medium">Montant</th>
                <th className="py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.id} className="border-b border-gold/15 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 pr-4">{LIBELLE_TYPE[c.type]}</td>
                  <td className="py-3 pr-4">
                    <span className="block">{c.nom || '—'}</span>
                    <span className="block text-ink/60">{c.email}</span>
                    {c.telephone && <span className="block text-ink/60">{c.telephone}</span>}
                  </td>
                  <td className="py-3 pr-4 max-w-xs">{formatAdresse(c.adresse)}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {c.montant_centimes != null
                      ? `${(c.montant_centimes / 100).toFixed(2).replace('.', ',')} €`
                      : '—'}
                  </td>
                  <td className="py-3">
                    <span className="block mb-1">{LIBELLE_STATUT[c.statut]}</span>
                    {c.statut === 'a_expedier' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={enCours === c.id}
                        onClick={() => changerStatut(c.id, 'expediee')}
                      >
                        {enCours === c.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Marquer expédiée'
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
