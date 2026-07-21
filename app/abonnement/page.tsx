'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Étape intermédiaire du tunnel : vérifie la session puis redirige vers Stripe Checkout.
 * /abonnement?plan=essentiel | accompagne
 */
function AbonnementInner() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get('plan');
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    if (plan !== 'essentiel' && plan !== 'accompagne') {
      router.replace('/tarifs');
      return;
    }
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setNeedLogin(true);
        return;
      }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setError(e.error || 'Erreur lors de la préparation du paiement.');
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    })();
  }, [plan, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-gold mb-4">TransmiExpert</p>
      {needLogin ? (
        <>
          <h1 className="font-serif text-3xl text-ink mb-4">Connectez-vous pour vous abonner</h1>
          <p className="text-ink/70 max-w-md mb-8">
            Votre abonnement sera rattaché à votre compte. Connectez-vous, puis relancez votre
            formule depuis la page tarifs.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tarifs">Retour aux tarifs</Link>
            </Button>
          </div>
        </>
      ) : error ? (
        <>
          <h1 className="font-serif text-3xl text-ink mb-4">Un instant…</h1>
          <p className="text-red-700 max-w-md mb-8">{error}</p>
          <Button asChild variant="outline">
            <Link href="/tarifs">Retour aux tarifs</Link>
          </Button>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-forest mb-4" />
          <p className="text-ink/70">Préparation du paiement sécurisé…</p>
        </>
      )}
    </main>
  );
}

export default function AbonnementPage() {
  return (
    <Suspense fallback={null}>
      <AbonnementInner />
    </Suspense>
  );
}
