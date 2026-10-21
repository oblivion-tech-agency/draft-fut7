export interface Player {
  id: string;
  name: string;
  avatar?: string;
  position?: 'POR' | 'DFI' | 'DFD' | 'MI' | 'MC' | 'MD' | 'DEL';
  pickedBy?: 'A' | 'B';
  pickOrder?: number;
}

/** Táctica elegida por un capitán y en qué posición puso a cada jugador. */
export interface TeamLineup {
  formation: string; // filas de campo de la defensa al ataque, ej. '2-3-1'
  slots: (string | null)[]; // id del jugador en cada posición (ver lib/draft7/formations)
}

export interface DraftState {
  players: Player[];
  captainA: Player | null;
  captainB: Player | null;
  currentTurn: 'A' | 'B';
  turnPhase: number;
  isComplete: boolean;
  lineups?: Partial<Record<'A' | 'B', TeamLineup>>;
  rev?: number; // sube con cada escritura; evita que dos clientes se pisen
}

export type CaptainRole = 'A' | 'B' | 'spectator';

export interface Room {
  id: string;
  state: DraftState;
  captain_a_code: string;
  captain_b_code: string;
  created_at: string;
}
