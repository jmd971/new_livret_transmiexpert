'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ACTIVE_STATUSES } from '@/lib/subscription-shared';
import { Loader2 } from 'lucide-react';

/**
 * Retour de Stripe Checkout. L'activation passe par le webhook (quelques secondes) :
 * on interroge la ligne subscriptions jusqu'à la voir active, puis on entre dans l'app.
 */
export default function MerciPage() {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const attempts = useRef(0);

  useEffect(() => {
    const supabase = createClient();
    const interval = setInterval(async () => {
      attempts.current += 1;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase.from('subscriptions') as any)
        .select('status')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data?.status && ACTIVE_STATUSES.includes(data.status)) {
        clearInterval(interval);
        router.replace('/app/dashboard');
      } else if (attempts.current >= 15) {
        clearInterval(interval);
        setTimedOut(true);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-gold mb-4">TransmiExpert</p>
      <h1 className="font-serif text-3xl text-ink mb-4">Merci pour votre confiance</h1>
      {timedOut ? (
        <>
          <p className="text-ink/70 max-w-md mb-8">
            Votre paiement est bien enregistré, mais l'activation prend plus de temps que prévu.
            Réessayez dans un instant — et si le problème persiste, écrivez-nous à
            contact@transmiexpert.fr.
          </p>
          <Button asChild size="lg">
            <Link href="/app/dashboard">Accéder à mon espace</Link>
          </Button>
        </>
      ) : (
        <>
          <p className="text-ink/70 max-w-md mb-8">
            Votre abonnement s'active — vous allez être redirigé vers votre espace.
          </p>
          <Loader2 className="h-8 w-8 animate-spin text-forest" />
        </>
      )}
    </main>
  );
}
