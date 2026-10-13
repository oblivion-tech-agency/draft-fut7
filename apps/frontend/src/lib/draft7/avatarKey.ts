/**
 * Clave para asociar una foto a un jugador entre salas: el nombre sin
 * acentos, en minúsculas y con espacios normalizados ("José  Pérez" → "jose perez").
 */
export function avatarKey(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}
