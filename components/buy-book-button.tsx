'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/** Achat du livre vierge : pas de compte, Stripe collecte l'adresse de livraison. */
export function BuyBookButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout-livre', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Erreur lors de la préparation du paiement.');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la préparation du paiement.');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={buy} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Commander le livre'}
      </Button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
