import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-gold mb-4">TransmiExpert · Guadeloupe</p>
      <h1 className="font-serif text-4xl md:text-5xl text-ink mb-4">Livret de Succession</h1>
      <p className="text-ink/70 max-w-xl mb-8">
        Rassemblez ce qui compte — votre famille, votre patrimoine, vos volontés — dans un seul document
        clair, que vous pourrez enrichir, partager ou simplement garder à portée de main.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg"><Link href="/app/dashboard">Accéder à mon espace</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/login">Se connecter</Link></Button>
      </div>
      <Link
        href="/tarifs"
        className="mt-6 text-sm text-forest underline underline-offset-4 hover:text-gold transition-colors"
      >
        Découvrir nos tarifs
      </Link>
      <p className="mt-12 text-xs text-ink/50 max-w-md">
        TransmiExpert n'est ni notaire, ni avocat, ni expert-comptable. Tiers neutre en médiation successorale.
      </p>
    </main>
  );
}
