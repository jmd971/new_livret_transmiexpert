import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check } from 'lucide-react';

export const metadata = {
  title: 'Tarifs — Livret de Succession · TransmiExpert',
  description:
    'Abonnement au Livret de Succession numérique, avec ou sans assistance transmission, et éditions papier design.',
};

const ABONNEMENTS = [
  {
    id: 'essentiel',
    nom: 'Essentiel',
    prix: '9,90 €',
    periode: '/ mois',
    accroche: 'Votre livret numérique, à votre rythme.',
    inclus: [
      'Accès complet à votre espace personnel',
      'Livret de Succession numérique (PDF, 27 pages)',
      'Mises à jour illimitées de votre dossier',
      'Support applicatif (aide à l’utilisation)',
    ],
    precision: 'Sans conseil sur la transmission.',
    misEnAvant: false,
  },
  {
    id: 'accompagne',
    nom: 'Accompagné',
    prix: '14,90 €',
    periode: '/ mois',
    accroche: 'Le livret, plus un vrai temps d’échange.',
    inclus: [
      'Tout l’abonnement Essentiel',
      '2 h d’assistance sur votre transmission avec Luc Silvestre',
      'Un diagnostic de situation pour savoir par où commencer',
    ],
    precision: '2 h au total, à utiliser quand vous en avez besoin.',
    misEnAvant: true,
  },
];

const EDITIONS_PAPIER = [
  {
    nom: 'Votre livret, imprimé',
    prix: '60 €',
    accroche: 'Votre livret personnalisé, en édition papier design.',
    detail:
      'Réservé aux abonnés : nous imprimons le livret généré depuis votre espace — vos informations, mises en page avec soin — et vous le recevez prêt à être conservé ou offert.',
  },
  {
    nom: 'Livret design vierge',
    prix: '90 €',
    accroche: 'Le livret complet, à remplir à la main.',
    detail:
      'Les 27 pages et toutes les thématiques du Livret de Succession, en édition papier à compléter à votre rythme — sans application, sans abonnement.',
  },
];

export default function TarifsPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-gold mb-4">TransmiExpert · Guadeloupe</p>
        <h1 className="font-serif text-4xl text-ink mb-4">Nos tarifs</h1>
        <p className="text-ink/70 max-w-xl mx-auto">
          Un livret pour rassembler ce qui compte — en ligne, sur papier, ou les deux.
        </p>
      </div>

      <h2 className="font-serif text-2xl text-ink mb-6">L’application, par abonnement</h2>
      <div className="grid gap-6 md:grid-cols-2 mb-14">
        {ABONNEMENTS.map((a) => (
          <Card key={a.nom} className={a.misEnAvant ? 'border-forest border-2' : ''}>
            <CardHeader>
              <CardTitle>{a.nom}</CardTitle>
              <CardDescription>{a.accroche}</CardDescription>
              <p className="pt-2">
                <span className="font-serif text-3xl text-forest">{a.prix}</span>
                <span className="text-ink/60 text-sm"> {a.periode}</span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="space-y-2">
                {a.inclus.map((item) => (
                  <li key={item} className="text-sm text-ink/80 flex items-start gap-2">
                    <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink/50 italic">{a.precision}</p>
              <Button asChild variant={a.misEnAvant ? 'default' : 'outline'}>
                <Link href={`/abonnement?plan=${a.id}`}>S'abonner</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="font-serif text-2xl text-ink mb-6">Les éditions papier</h2>
      <div className="grid gap-6 md:grid-cols-2 mb-14">
        {EDITIONS_PAPIER.map((e) => (
          <Card key={e.nom}>
            <CardHeader>
              <CardTitle>{e.nom}</CardTitle>
              <CardDescription>{e.accroche}</CardDescription>
              <p className="pt-2">
                <span className="font-serif text-3xl text-forest">{e.prix}</span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-ink/80">{e.detail}</p>
              <Button asChild variant="outline">
                <a href="mailto:contact@transmiexpert.fr?subject=Commande%20livret%20papier">Commander par email</a>
              </Button>
            </CardContent>
          </Card>
        ))}
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
          successorale — l’assistance proposée organise et prépare, elle ne remplace jamais le conseil
          juridique réglementé.
        </p>
      </div>
    </main>
  );
}
