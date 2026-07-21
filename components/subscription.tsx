'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TEAM_EMAILS } from '@/lib/team';
import { ACTIVE_STATUSES } from '@/lib/subscription-shared';
import { Loader2 } from 'lucide-react';

export interface SubscriptionState {
  loading: boolean;
  active: boolean;
  team: boolean;
  plan: string | null;
  status: string | null;
}

/** Lit l'abonnement de l'utilisateur connecté (sa propre ligne subscriptions, sous RLS). */
export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    active: false,
    team: false,
    plan: null,
    status: null,
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // Pas de session : le garde d'authentification existant s'en charge.
        if (!cancelled) setState({ loading: false, active: false, team: false, plan: null, status: null });
        return;
      }
      const email = session.user.email?.toLowerCase();
      if (email && TEAM_EMAILS.includes(email)) {
        if (!cancelled) setState({ loading: false, active: true, team: true, plan: null, status: null });
        return;
      }
      const { data } = await (supabase.from('subscriptions') as any)
        .select('plan, status')
        .eq('user_id', session.user.id)
        .maybeSingle();
      const status = data?.status ?? null;
      if (!cancelled) {
        setState({
          loading: false,
          active: !!status && ACTIVE_STATUSES.includes(status),
          team: false,
          plan: data?.plan ?? null,
          status,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/**
 * Garde d'abonnement : enveloppe les pages /app. Sans abonnement actif (et hors
 * comptes équipe), redirige vers la page tarifs. Le contrôle bloquant côté serveur
 * reste la génération PDF (app/api/pdf/generate) — ce garde est l'UX, pas la sécurité.
 */
export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sub = useSubscription();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setHasSession(!!session));
  }, []);

  useEffect(() => {
    if (!sub.loading && hasSession === true && !sub.active) {
      router.replace('/tarifs?acces=abonnement');
    }
  }, [sub.loading, sub.active, hasSession, router]);

  if (sub.loading || hasSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement…
      </div>
    );
  }

  // Sans session, on laisse passer : le garde d'auth existant redirige vers /login.
  if (hasSession && !sub.active) return null;

  return <>{children}</>;
}

/** Bouton « Mon abonnement » : ouvre le portail client Stripe (ou renvoie aux tarifs). */
export function ManageSubscriptionLink({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        router.push('/tarifs');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={openPortal} disabled={busy} className={className}>
      {busy ? 'Ouverture…' : 'Mon abonnement'}
    </button>
  );
}
