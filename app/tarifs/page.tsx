import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { BuyBookButton } from '@/components/buy-book-button';

export const metadata = {
  title: 'Tarifs · Livret de Succession · TransmiExpert',
  description:
    'Le livre vierge à 90 €, le Pack Sérénité à 297 € la première année puis 99 € par an, la Transmission accompagnée à 890 €.',
};

const OFFRES = [
  {
    id: 'vierge',
    nom: 'Le livre vierge',
    prix: '90 €',
    periode: '',
    accroche: 'Le livre complet, à remplir à la main.',
    inclus: [
      'Les 44 pages et toutes les thématiques du Livret de Succession',
      'Édition papier reliée, format 16 × 24 cm',
      'Expédié chez vous, sans application ni abonnement',
    ],
    precision: 'Le même livre que le Pack, à compléter à votre rythme au stylo.',
    misEnAvant: false,
  },
  {
    id: 'pack',
    nom: 'Pack Sérénité',
    prix: '297 €',
    periode: 'la première année',
    accroche: 'Votre livre, imprimé à votre nom.',
    inclus: [
      'Votre espace personnel en ligne, guidé thème par thème',
      'Votre livre de 44 pages imprimé à votre nom',
      'Garantie « rempli en 90 jours » : sinon, on le remplit avec vous par téléphone',
      'Puis 99 € par an : votre livre réédité à chaque mise à jour',
    ],
    precision: 'Paiement en 3 fois possible : appelez-nous au 0690 73 45 80.',
    misEnAvant: true,
  },
  {
    id: 'accompagnee',
    nom: 'Transmission accompagnée',
    prix: '890 €',
    periode: 'la première année',
    accroche: 'Le Pack, et Luc à vos côtés.',
    inclus: [
      'Tout le Pack Sérénité',
      '2 h avec Luc Silvestre, en présence ou en visioconférence',
      'Votre réunion familiale préparée, le dépôt chez le notaire coordonné',
      'Intégralement déduits d’une médiation si un blocage apparaît',
    ],
    precision: 'Capacité limitée à 4 accompagnements par mois.',
    misEnAvant: false,
  },
];

export default function TarifsPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-gold mb-4">TransmiExpert · Guadeloupe</p>
        <h1 className="font-serif text-4xl text-ink mb-4">Nos tarifs</h1>
        <p className="text-ink/70 max-w-xl mx-auto">
          Un livre pour rassembler ce qui compte. À remplir seul, avec nous, ou avec Luc.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-14">
        {OFFRES.map((o) => (
          <Card key={o.id} className={o.misEnAvant ? 'border-forest border-2' : ''}>
            <CardHeader>
              <CardTitle>{o.nom}</CardTitle>
              <CardDescription>{o.accroche}</CardDescription>
              <p className="pt-2">
                <span className="font-serif text-3xl text-forest">{o.prix}</span>
                {o.periode && <span className="text-ink/60 text-sm"> {o.periode}</span>}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="space-y-2 flex-1">
                {o.inclus.map((item) => (
                  <li key={item} className="text-sm text-ink/80 flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink/50 italic">{o.precision}</p>
              {o.id === 'vierge' ? (
                <BuyBookButton />
              ) : (
                <Button asChild variant={o.misEnAvant ? 'default' : 'outline'}>
                  <Link href={`/abonnement?plan=${o.id}`}>Choisir cette formule</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-gold/30 bg-gold/5 p-6 mb-14 text-center">
        <p className="font-serif text-lg text-ink mb-2">Et si le conflit est déjà là ?</p>
        <p className="text-sm text-ink/70 max-w-2xl mx-auto">
          Succession ouverte, indivision bloquée, héritiers en désaccord : ce n’est plus le
          territoire du livret. C’est celui de la médiation successorale, de 1 500 à 4 000 €
          selon la complexité. Ce que vous avez déjà payé en accompagnement s’en déduit.
          La consultation de 30 minutes reste gratuite.
        </p>
      </div>

      <div className="text-center border-t border-gold/30 pt-10">
        <p className="text-ink/70 mb-4">
          Une question avant de choisir ? Appelez-nous au{' '}
          <span className="text-forest font-medium">0690 73 45 80</span> ou écrivez à{' '}
          <a href="mailto:contact@transmiexpert.fr" className="text-forest underline underline-offset-2">
            contact@transmiexpert.fr
          </a>
          .
        </p>
        <Button asChild variant="ghost">
          <Link href="/">← Retour à l’accueil</Link>
        </Button>
        <p className="mt-10 text-xs text-ink/50 max-w-md mx-auto">
          TransmiExpert n’est ni notaire, ni avocat, ni expert-comptable. Tiers neutre en médiation
          successorale : l’accompagnement proposé organise et prépare, il ne remplace jamais le
          conseil juridique réglementé.
        </p>
      </div>
    </main>
  );
}
