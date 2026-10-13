import { DraftState, Player } from '@/types/draft7';

export type Team = 'A' | 'B';

// Orden de picks (sin contar a los capitanes): 1-2-2-2...
export const PICK_PATTERN: Team[] = [
  'A',
  'B',
  'B',
  'A',
  'A',
  'B',
  'B',
  'A',
  'A',
  'B',
  'B',
  'A',
  'A',
  'B',
  'B',
];

/** Equipo al que le toca el pick número `index` (0-based, sin capitanes). */
export function turnForPick(index: number): Team {
  if (index < PICK_PATTERN.length) return PICK_PATTERN[index];
  // Más allá del patrón, se sigue alternando en bloques de a dos.
  return Math.floor((index - 1) / 2) % 2 === 0 ? 'B' : 'A';
}

/** Cantidad de picks hechos (los capitanes tienen pickOrder 0 y no cuentan). */
export function picksMade(state: DraftState): number {
  return state.players.filter((p) => p.pickedBy && p.pickOrder !== 0).length;
}

/** Total de picks del draft (todos menos los capitanes). */
export function totalPicks(state: DraftState): number {
  return state.players.filter((p) => p.pickOrder !== 0).length;
}

export function applyPick(state: DraftState, playerId: string): DraftState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || state.players[playerIndex].pickedBy || state.isComplete) return state;

  const newPlayers = [...state.players];
  const pickOrder = state.players.filter((p) => p.pickedBy).length + 1;
  newPlayers[playerIndex] = { ...newPlayers[playerIndex], pickedBy: state.currentTurn, pickOrder };

  const made = newPlayers.filter((p) => p.pickedBy && p.pickOrder !== 0).length;
  const isComplete = newPlayers.every((p) => p.pickedBy);

  return { ...state, players: newPlayers, currentTurn: turnForPick(made), isComplete };
}

/** Cuántos jugadores va a tener cada equipo al terminar el draft. */
export function finalTeamSize(state: DraftState, team: Team): number {
  const picks = totalPicks(state);
  let size = 1; // capitán
  for (let i = 0; i < picks; i++) if (turnForPick(i) === team) size++;
  return size;
}

/** Jugadores de un equipo: capitán primero y después en orden de pick. */
export function teamPlayers(state: DraftState, team: Team): Player[] {
  return state.players
    .filter((p) => p.pickedBy === team)
    .sort((a, b) => (a.pickOrder ?? 0) - (b.pickOrder ?? 0));
}

/** Próximos turnos a partir del pick actual (para mostrar la secuencia). */
export function upcomingTurns(state: DraftState, count: number): Team[] {
  const made = picksMade(state);
  const remaining = totalPicks(state) - made;
  return Array.from({ length: Math.min(count, remaining) }, (_, i) => turnForPick(made + i));
}

/** Último jugador elegido (el de mayor pickOrder), si hay alguno. */
export function lastPick(state: DraftState): Player | null {
  return state.players.reduce<Player | null>(
    (last, p) => (p.pickedBy && (p.pickOrder ?? 0) > (last?.pickOrder ?? 0) ? p : last),
    null
  );
}
