'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { avatarKey } from './avatarKey';

export { avatarKey };

export type AvatarMap = Record<string, string>;

/**
 * Trae las fotos de los jugadores indicados. Si la tabla no existe todavía
 * o falla la consulta, devuelve un mapa vacío y se usan las iniciales.
 */
export function useAvatars(names: string[]): AvatarMap {
  const [avatars, setAvatars] = useState<AvatarMap>({});
  const keys = Array.from(new Set(names.map(avatarKey)))
    .sort()
    .join('|');

  useEffect(() => {
    if (!keys) return;
    let cancelled = false;
    supabase
      .from('player_avatars')
      .select('name_key, avatar_url')
      .in('name_key', keys.split('|'))
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setAvatars(Object.fromEntries(data.map((row) => [row.name_key, row.avatar_url])));
      });
    return () => {
      cancelled = true;
    };
  }, [keys]);

  return avatars;
}

export function avatarFor(avatars: AvatarMap, name: string): string | undefined {
  return avatars[avatarKey(name)];
}

/** Recorta al centro y achica la imagen a un cuadrado JPEG liviano. */
export function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas no disponible'));
        return;
      }
      ctx.drawImage(
        img,
        (img.width - side) / 2,
        (img.height - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}
