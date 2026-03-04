export interface Player {
  id: string;
  name: string;
  avatar?: string;
  position?: 'POR' | 'DFI' | 'DFD' | 'MI' | 'MC' | 'MD' | 'DEL';
  pickedBy?: 'A' | 'B';
  pickOrder?: number;
}

export interface DraftState {
  players: Player[];
  captainA: Player | null;
  captainB: Player | null;
  currentTurn: 'A' | 'B';
  turnPhase: number;
  isComplete: boolean;
}

export type CaptainRole = 'A' | 'B' | 'spectator';

export interface Room {
  id: string;
  state: DraftState;
  captain_a_code: string;
  captain_b_code: string;
  created_at: string;
}
