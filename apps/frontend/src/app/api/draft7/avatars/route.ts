import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isAdminPassword } from '@/lib/supabaseAdmin';
import { avatarKey } from '@/lib/draft7/avatarKey';

export const dynamic = 'force-dynamic';

// ~300 KB de data URL alcanza de sobra para un JPEG de 256x256.
const MAX_IMAGE_LENGTH = 300_000;
const IMAGE_PREFIX = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

type Guard = { error: NextResponse } | { db: NonNullable<ReturnType<typeof getSupabaseAdmin>> };

async function guard(req: NextRequest): Promise<Guard> {
  const db = getSupabaseAdmin();
  if (!db || !process.env.ADMIN_PASSWORD) {
    return {
      error: NextResponse.json(
        { error: 'Falta configurar ADMIN_PASSWORD y SUPABASE_SERVICE_ROLE_KEY en el servidor.' },
        { status: 503 }
      ),
    };
  }
  if (!isAdminPassword(req.headers.get('x-admin-password'))) {
    // Pequeña demora para desalentar la fuerza bruta.
    await new Promise((r) => setTimeout(r, 800));
    return { error: NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 }) };
  }
  return { db };
}

/** Lista todas las fotos (también sirve para validar el login del admin). */
export async function GET(req: NextRequest) {
  const g = await guard(req);
  if ('error' in g) return g.error;

  const { data, error } = await g.db
    .from('player_avatars')
    .select('name_key, name, avatar_url, updated_at')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ avatars: data });
}

/** Crea o reemplaza la foto de un jugador. Body: { name, image } (data URL). */
export async function POST(req: NextRequest) {
  const g = await guard(req);
  if ('error' in g) return g.error;

  const body = (await req.json().catch(() => null)) as { name?: unknown; image?: unknown } | null;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const image = typeof body?.image === 'string' ? body.image : '';

  if (!name || name.length > 60) {
    return NextResponse.json({ error: 'Nombre inválido.' }, { status: 400 });
  }
  if (image.length > MAX_IMAGE_LENGTH || !IMAGE_PREFIX.test(image)) {
    return NextResponse.json({ error: 'Imagen inválida o demasiado grande.' }, { status: 400 });
  }

  const { error } = await g.db.from('player_avatars').upsert({
    name_key: avatarKey(name),
    name,
    avatar_url: image,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Borra la foto de un jugador: DELETE ?name=... */
export async function DELETE(req: NextRequest) {
  const g = await guard(req);
  if ('error' in g) return g.error;

  const name = req.nextUrl.searchParams.get('name') ?? '';
  if (!name) return NextResponse.json({ error: 'Falta el nombre.' }, { status: 400 });

  const { error } = await g.db.from('player_avatars').delete().eq('name_key', avatarKey(name));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
