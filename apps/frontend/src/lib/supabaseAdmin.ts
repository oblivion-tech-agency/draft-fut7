import { createHash, timingSafeEqual } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Cliente con service role: solo para route handlers, nunca en el navegador. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

const digest = (value: string) => createHash('sha256').update(value).digest();

/** Compara la contraseña recibida con ADMIN_PASSWORD en tiempo constante. */
export function isAdminPassword(candidate: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  return timingSafeEqual(digest(candidate), digest(expected));
}
