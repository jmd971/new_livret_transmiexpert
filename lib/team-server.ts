import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TEAM_EMAILS } from './team';

/**
 * Contrôle d'accès équipe côté serveur — même règle que /api/pdf/blank :
 * jeton de session Supabase obligatoire, puis appartenance à l'allowlist
 * (surchargeable par BLANK_PDF_ALLOWED_EMAILS, emails séparés par des virgules).
 */
export function allowedTeamEmails(): string[] {
  const fromEnv = process.env.BLANK_PDF_ALLOWED_EMAILS;
  if (!fromEnv) return TEAM_EMAILS;
  return fromEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

type TeamCheck = { ok: true; email: string } | { ok: false; status: 401 | 403; error: string };

export async function requireTeamUser(request: NextRequest): Promise<TeamCheck> {
  const authHeader = request.headers.get('authorization') || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!accessToken) {
    return { ok: false, status: 401, error: 'Authentification requise.' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { ok: false, status: 401, error: 'Session invalide ou expirée — reconnectez-vous.' };
  }

  if (!user.email || !allowedTeamEmails().includes(user.email.toLowerCase())) {
    return { ok: false, status: 403, error: 'Accès réservé à l’équipe TransmiExpert.' };
  }

  return { ok: true, email: user.email };
}
