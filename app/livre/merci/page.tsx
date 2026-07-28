import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Merci pour votre commande · TransmiExpert',
};

export default function LivreMerciPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-gold mb-4">TransmiExpert</p>
      <h1 className="font-serif text-3xl text-ink mb-4">Votre livre est en préparation</h1>
      <p className="text-ink/70 max-w-md mb-4">
        Merci pour votre commande. Votre livre vierge part à l’impression et vous sera expédié
        à l’adresse indiquée au paiement. Vous recevrez un email de confirmation.
      </p>
      <p className="text-ink/70 max-w-md mb-8">
        En attendant, une page à la fois : c’est comme ça qu’un livret se remplit.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </main>
  );
}
