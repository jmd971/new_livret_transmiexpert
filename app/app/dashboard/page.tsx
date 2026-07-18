'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCaseFile } from '@/lib/contexts/case-file-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { activeCaseFile, isLoading } = useCaseFile();
  const supabase = createClient();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!activeCaseFile) return;
      setLoading(true);
      const tables = [
        'trust_people',
        'key_contacts',
        'properties',
        'accounts',
        'insurances',
        'debts',
        'documents_index',
        'digital_assets',
        'business_interests',
        'past_donations',
        'existing_indivisions',
      ];
      const results = await Promise.all(
        tables.map((t) =>
          (supabase.from(t) as any).select('id', { count: 'exact', head: true }).eq('case_file_id', activeCaseFile.id)
        )
      );
      const c: Record<string, number> = {};
      tables.forEach((t, i) => (c[t] = results[i].count || 0));
      setCounts(c);
      setLoading(false);
    }
    if (activeCaseFile) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCaseFile]);

  if (isLoading || (activeCaseFile && loading)) {
    return (
      <div className="flex items-center gap-2 text-ink/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }

  if (!activeCaseFile) {
    return (
      <div className="flex items-center gap-2 text-ink/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Initialisation de votre dossier…
      </div>
    );
  }

  const score = activeCaseFile?.completion_score ?? 0;
  const cards: Array<[string, string]> = [
    ['Personnes de confiance', String(counts['trust_people'] ?? 0)],
    ['Contacts clés', String(counts['key_contacts'] ?? 0)],
    ['Biens immobiliers', String(counts['properties'] ?? 0)],
    ['Comptes & assurances', String((counts['accounts'] ?? 0) + (counts['insurances'] ?? 0))],
    ['Dettes', String(counts['debts'] ?? 0)],
    ['Documents indexés', String(counts['documents_index'] ?? 0)],
    ['Entreprises & activités', String(counts['business_interests'] ?? 0)],
    ['Donations consenties', String(counts['past_donations'] ?? 0)],
    ['Indivisions en cours', String(counts['existing_indivisions'] ?? 0)],
  ];

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-2">Votre situation en un regard</p>
      <h1 className="font-serif text-3xl text-ink mb-2">Tableau de bord</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">
        Un repère, pas une note — pour savoir ce qui est déjà solide et ce qui peut encore être enrichi.
      </p>

      <Card className="mb-8">
        <CardContent className="py-6">
          <p className="text-sm text-ink mb-2">Taux de complétion de votre dossier</p>
          <div className="w-full bg-ivory-dark h-2 rounded-full overflow-hidden">
            <div className="bg-forest h-2 rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
          <p className="text-sm font-semibold text-forest mt-2">{Math.round(score)} %</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl text-forest">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink/60">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-ink/60 mt-8 max-w-2xl">
        Ce livret évolue avec vous. Chaque information ajoutée enrichira la prochaine version, sans que vous
        ayez à tout ressaisir. Quand vous êtes prêt, rendez-vous sur « Générer le livret ».
      </p>
    </div>
  );
}
