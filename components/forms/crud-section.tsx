'use client';

/**
 * CrudSection — composant générique de saisie en liste, branché sur une table Supabase.
 * Il factorise le comportement commun à la plupart des écrans (contacts, biens, comptes,
 * personnes de confiance, etc.) : chargement, ajout, suppression, avec un rendu éditorial
 * cohérent avec la charte V4. Chaque écran le configure via `fields` et `columns`.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCaseFile } from '@/lib/contexts/case-file-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: Array<{ value: string; label: string }>; // requis si type === 'select'
  placeholder?: string;
  required?: boolean;
};

type Props = {
  table: string;
  title: string;
  kicker: string;
  intro: string;
  fields: FieldDef[];
  emptyMessage: string;
};

export function CrudSection({ table, title, kicker, intro, fields, emptyMessage }: Props) {
  const { activeCaseFile } = useCaseFile();
  const supabase = createClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  async function load() {
    if (!activeCaseFile) return;
    setLoading(true);
    const { data } = await (supabase.from(table) as any).select('*').eq('case_file_id', activeCaseFile.id);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (activeCaseFile) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCaseFile]);

  async function handleAdd() {
    if (!activeCaseFile) return;
    setSaving(true);
    const payload: Record<string, any> = { case_file_id: activeCaseFile.id };
    fields.forEach((f) => {
      if (form[f.key] !== undefined && form[f.key] !== '') {
        payload[f.key] = f.type === 'number' ? Number(form[f.key]) : form[f.key];
      }
    });
    await (supabase.from(table) as any).insert([payload]);
    setForm({});
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await (supabase.from(table) as any).delete().eq('id', id);
    load();
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-2">{kicker}</p>
      <h1 className="font-serif text-3xl text-ink mb-2">{title}</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">{intro}</p>

      {loading ? (
        <div className="flex items-center gap-2 text-ink/50"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
      ) : (
        <div className="space-y-3">
          {rows.length === 0 && <p className="text-ink/50 italic">{emptyMessage}</p>}
          {rows.map((row) => (
            <Card key={row.id}>
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="grid gap-1">
                  {fields.map((f) => (
                    <div key={f.key} className="text-sm">
                      <span className="text-ink/50">{f.label} : </span>
                      <span className="text-ink">
                        {f.options
                          ? f.options.find((o) => o.value === row[f.key])?.label ?? row[f.key] ?? '—'
                          : row[f.key] ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm ? (
        <Card className="mt-6">
          <CardContent className="py-6 space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="grid gap-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.type === 'select' && f.options ? (
                  <select
                    id={f.key}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={form[f.key] || ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  >
                    <option value="">— Choisir —</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={f.key}
                    type={f.type === 'number' ? 'number' : 'text'}
                    placeholder={f.placeholder}
                    value={form[f.key] || ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button className="mt-6" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      )}
    </div>
  );
}
