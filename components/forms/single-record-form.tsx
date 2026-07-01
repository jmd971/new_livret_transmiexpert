'use client';

/**
 * SingleRecordForm — pour les tables à une seule ligne par dossier (identity_profile,
 * family_context, funeral_wishes). Charge la ligne existante, permet de l'éditer et
 * l'upsert (insert si absente, update sinon).
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCaseFile } from '@/lib/contexts/case-file-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check } from 'lucide-react';

export type SingleField = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type Props = {
  table: string;
  title: string;
  kicker: string;
  intro: string;
  fields: SingleField[];
  note?: string;
};

export function SingleRecordForm({ table, title, kicker, intro, fields, note }: Props) {
  const { activeCaseFile } = useCaseFile();
  const supabase = createClient();
  const [record, setRecord] = useState<Record<string, any>>({});
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!activeCaseFile) return;
      setLoading(true);
      const { data } = await (supabase.from(table) as any)
        .select('*')
        .eq('case_file_id', activeCaseFile.id)
        .maybeSingle();
      if (data) {
        setRecord(data);
        setExistingId(data.id);
      }
      setLoading(false);
    }
    if (activeCaseFile) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCaseFile]);

  async function handleSave() {
    if (!activeCaseFile) return;
    setSaving(true);
    setSaved(false);
    const payload: Record<string, any> = { case_file_id: activeCaseFile.id };
    fields.forEach((f) => {
      let v = record[f.key];
      if (f.type === 'number' && v !== undefined && v !== '') v = Number(v);
      if (f.type === 'boolean') v = !!v;
      payload[f.key] = v ?? null;
    });

    if (existingId) {
      await (supabase.from(table) as any).update(payload).eq('id', existingId);
    } else {
      const { data } = await (supabase.from(table) as any).insert([payload]).select().single();
      if (data) setExistingId(data.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ink/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-2">{kicker}</p>
      <h1 className="font-serif text-3xl text-ink mb-2">{title}</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">{intro}</p>

      <div className="grid gap-5 max-w-2xl">
        {fields.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            {f.type === 'textarea' ? (
              <Textarea
                id={f.key}
                placeholder={f.placeholder}
                value={record[f.key] || ''}
                onChange={(e) => setRecord({ ...record, [f.key]: e.target.value })}
              />
            ) : f.type === 'select' ? (
              <select
                id={f.key}
                className="h-10 border border-ink/20 bg-white px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                value={record[f.key] || ''}
                onChange={(e) => setRecord({ ...record, [f.key]: e.target.value })}
              >
                <option value="">— Choisir —</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.type === 'boolean' ? (
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={!!record[f.key]}
                  onChange={(e) => setRecord({ ...record, [f.key]: e.target.checked })}
                />
                Oui
              </label>
            ) : (
              <Input
                id={f.key}
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                placeholder={f.placeholder}
                value={record[f.key] || ''}
                onChange={(e) => setRecord({ ...record, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      {note && <p className="text-xs text-ink/50 italic mt-6 max-w-2xl">{note}</p>}

      <div className="mt-8 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-forest">
            <Check className="h-4 w-4" /> Enregistré
          </span>
        )}
      </div>
    </div>
  );
}
