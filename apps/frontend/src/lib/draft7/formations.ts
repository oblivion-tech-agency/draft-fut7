import { DraftState, Player, TeamLineup } from '@/types/draft7';
import { Team, finalTeamSize, teamPlayers } from './pick';

export interface Slot {
  x: number; // % del ancho
  y: number; // % del alto de la mitad, desde el arco propio
}

// Filas de jugadores de campo (de la defensa al ataque) según cuántos haya,
// para cuando el capitán todavía no eligió táctica.
const DEFAULT_ROWS: Record<number, number[]> = {
  0: [],
  1: [1],
  2: [2],
  3: [2, 1],
  4: [2, 2],
  5: [2, 2, 1],
  6: [2, 3, 1],
  7: [3, 3, 1],
  8: [3, 3, 2],
  9: [3, 4, 2],
  10: [4, 4, 2],
};

// Tácticas para elegir, agrupadas por cantidad de jugadores de campo.
const CATALOG: Record<number, string[]> = {
  4: ['2-2', '1-2-1', '2-1-1', '3-1'],
  5: ['2-2-1', '2-1-2', '3-1-1', '1-2-2'],
  6: ['2-3-1', '3-2-1', '3-1-2', '2-1-2-1', '2-2-2', '3-3'],
  7: ['3-3-1', '2-3-2', '3-2-2', '2-4-1'],
  8: ['3-3-2', '3-4-1', '4-3-1', '2-4-2'],
};

function defaultRows(outfield: number): number[] {
  if (DEFAULT_ROWS[outfield]) return DEFAULT_ROWS[outfield];
  const rows: number[] = [];
  for (let left = outfield; left > 0; left -= 4) rows.push(Math.min(4, left));
  return rows;
}

const rowsOf = (formation: string) => formation.split('-').map(Number);
const sum = (rows: number[]) => rows.reduce((a, b) => a + b, 0);

/** Tácticas posibles para un equipo de `size` jugadores (arquero incluido). */
export function formationsFor(size: number): string[] {
  return CATALOG[size - 1] ?? [];
}

/** Táctica en uso: la elegida si sigue sirviendo para el tamaño, si no la automática. */
export function currentFormation(size: number, lineup?: TeamLineup): string {
  const chosen = lineup?.formation;
  if (chosen && sum(rowsOf(chosen)) === size - 1) return chosen;
  return defaultRows(size - 1).join('-');
}

/**
 * Posiciones de un equipo en su mitad, en el orden en que se van llenando:
 * el capitán arranca adelante, los picks completan hacia atrás y el último
 * va al arco (como en todo picado).
 */
export function formationSlots(size: number, formation: string): Slot[] {
  const rows = size > 1 ? rowsOf(formation) : [];
  const slots: Slot[] = [];
  rows.forEach((count, r) => {
    const y = rows.length === 1 ? 62 : 38 + (r * 48) / (rows.length - 1);
    for (let i = 0; i < count; i++) slots.push({ x: ((i + 1) * 100) / (count + 1), y });
  });
  slots.reverse();
  if (size > 0) slots.push({ x: 50, y: 15 });
  return slots;
}

/**
 * Qué jugador va en cada posición: primero los que el capitán ubicó a mano y
 * después el resto, en orden de pick, en las posiciones que quedan libres.
 */
export function placePlayers(
  players: Player[],
  slotCount: number,
  saved?: (string | null)[]
): (Player | undefined)[] {
  const placed: (Player | undefined)[] = Array(slotCount).fill(undefined);
  const used = new Set<string>();
  saved?.slice(0, slotCount).forEach((id, i) => {
    const player = id ? players.find((p) => p.id === id) : undefined;
    if (player && !used.has(player.id)) {
      placed[i] = player;
      used.add(player.id);
    }
  });
  let free = 0;
  for (const player of players) {
    if (used.has(player.id)) continue;
    while (free < slotCount && placed[free]) free++;
    if (free >= slotCount) break;
    placed[free] = player;
  }
  return placed;
}

/** Formación, posiciones y jugadores de un equipo tal como se ven en la cancha. */
export function teamLayout(state: DraftState, team: Team) {
  const size = finalTeamSize(state, team);
  const lineup = state.lineups?.[team];
  const formation = currentFormation(size, lineup);
  const slots = formationSlots(size, formation);
  const placed = placePlayers(teamPlayers(state, team), slots.length, lineup?.slots);
  return { size, formation, slots, placed };
}

/** Lineup resultante de mover al jugador de la posición `from` a `to` (si hay alguien, se intercambian). */
export function moveInLineup(state: DraftState, team: Team, from: number, to: number): TeamLineup {
  const { formation, placed } = teamLayout(state, team);
  const slots = placed.map((p) => p?.id ?? null);
  [slots[from], slots[to]] = [slots[to], slots[from]];
  return { formation, slots };
}

/** Lineup con otra táctica, manteniendo a cada jugador en su número de posición. */
export function withFormation(state: DraftState, team: Team, formation: string): TeamLineup {
  const { placed } = teamLayout(state, team);
  return { formation, slots: placed.map((p) => p?.id ?? null) };
}
