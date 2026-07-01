'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DecisionsPage() {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-2">Décisions & méthode</p>
      <h1 className="font-serif text-3xl text-ink mb-2">Décisions & méthode</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">
        Cette section rassemble les repères de méthode que vous retrouverez, prêts à remplir, dans votre
        livret : objectifs de transmission, préparation d'une réunion familiale, plan d'action.
      </p>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Vos objectifs de transmission</CardTitle></CardHeader>
          <CardContent className="text-sm text-ink/70">
            Clarifier ce que vous voulez protéger en priorité. Ces objectifs vous serviront de repère à
            chaque décision. À renseigner directement dans le livret imprimé, ou lors de votre échange avec Luc.
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Préparer une réunion familiale</CardTitle></CardHeader>
          <CardContent className="text-sm text-ink/70">
            Un cadre simple : 60 à 90 minutes, un sujet à la fois, un ordre du jour écrit, une liste
            d'actions datées en conclusion. Le livret fournit la trame prête à l'emploi.
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Plan d'action</CardTitle></CardHeader>
          <CardContent className="text-sm text-ink/70">
            Une seule page pour piloter les 30 prochains jours : tâche, responsable, date, statut.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
