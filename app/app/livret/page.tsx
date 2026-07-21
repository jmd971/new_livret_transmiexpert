'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCaseFile } from '@/lib/contexts/case-file-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, Download, BookOpen, Printer } from 'lucide-react';

// Comptes équipe autorisés à télécharger le fichier d'impression de l'édition vierge
// (simple confort d'affichage — le contrôle d'accès réel est fait par l'API /api/pdf/blank).
const TEAM_EMAILS = ['jdolmare@gmail.com', 'luc@transmiexpert.fr'];

const CONTENU = [
  'Couverture personnalisée et mot d\'accueil',
  'Profil, famille et personnes de confiance',
  'Patrimoine : biens, comptes, dettes',
  'Entreprise, donations consenties et indivisions en cours',
  'Repères sur l\'indivision et la loi Letchimy',
  'Documents, vie numérique et volontés',
  'Objectifs, réunion familiale et plan d\'action',
  'Résumé à partager avec un notaire ou un proche',
];

export default function LivretPage() {
  const { activeCaseFile } = useCaseFile();
  const [profile, setProfile] = useState<'anticipateur' | 'crise'>('anticipateur');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTeam, setIsTeam] = useState(false);
  const [generatingBlank, setGeneratingBlank] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email?.toLowerCase();
      setIsTeam(!!email && TEAM_EMAILS.includes(email));
    });
  }, []);

  async function handleGenerateBlank() {
    setGeneratingBlank(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée — reconnectez-vous.');
      }
      const res = await fetch('/api/pdf/blank', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || 'Erreur lors de la génération');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'livret-succession-edition-vierge.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setGeneratingBlank(false);
    }
  }

  async function handleGenerate() {
    if (!activeCaseFile) return;
    setGenerating(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée — reconnectez-vous pour générer votre livret.');
      }
      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ caseFileId: activeCaseFile.id, readerProfile: profile }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || 'Erreur lors de la génération');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `livret-succession_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-2">Votre livret</p>
      <h1 className="font-serif text-3xl text-ink mb-2">Générer votre Livret de Succession</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">
        Votre livret rassemble tout ce que vous avez renseigné, dans un document clair et soigné, prêt à
        être conservé ou partagé.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-forest" /> Contenu de votre livret</CardTitle>
          <CardDescription>27 pages, six sections.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 md:grid-cols-2">
            {CONTENU.map((c, i) => (
              <li key={i} className="text-sm text-ink/70 flex items-start gap-2">
                <span className="text-gold mt-1">•</span> {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ton de l'ouverture</CardTitle>
          <CardDescription>
            Le contenu reste identique — seul le mot d'accueil s'adapte à votre situation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          {(
            [
              ['anticipateur', 'J\'anticipe sereinement'],
              ['crise', 'Je fais face à une situation'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setProfile(val)}
              className={cn(
                'px-4 py-3 text-sm border transition-colors flex-1 text-left',
                profile === val
                  ? 'border-forest bg-ivory-dark text-forest font-medium'
                  : 'border-ink/20 text-ink/70 hover:border-forest/50'
              )}
            >
              {label}
            </button>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      <Button size="lg" onClick={handleGenerate} disabled={generating || !activeCaseFile}>
        {generating ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Génération en cours…</>
        ) : (
          <><Download className="h-5 w-5 mr-2" /> Générer et télécharger mon livret</>
        )}
      </Button>

      {isTeam && (
        <Card className="mt-10 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Printer className="h-4 w-4 text-forest" /> Édition vierge (équipe)
            </CardTitle>
            <CardDescription>
              Fichier d'impression du livret design vierge — les 27 pages avec toutes les thématiques,
              champs et tableaux en lignes d'écriture. À transmettre à l'imprimeur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleGenerateBlank} disabled={generatingBlank}>
              {generatingBlank ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération en cours…</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Télécharger l'édition vierge</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
