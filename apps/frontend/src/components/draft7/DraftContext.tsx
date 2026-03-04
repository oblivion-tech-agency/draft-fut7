'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, DraftState } from '@/types/draft7';

interface DraftContextType {
  state: DraftState;
  setPlayers: (names: string[]) => void;
  setCaptains: (capA: Player, capB: Player) => void;
  pickPlayer: (playerId: string) => void;
  resetDraft: () => void;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

const INITIAL_STATE: DraftState = {
  players: [],
  captainA: null,
  captainB: null,
  currentTurn: 'A',
  turnPhase: 1,
  isComplete: false,
};

export const DraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DraftState>(INITIAL_STATE);

  useEffect(() => {
    const saved = localStorage.getItem('draft7_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft7_state', JSON.stringify(state));
  }, [state]);

  const setPlayers = (names: string[]) => {
    const players: Player[] = names
      .filter((n) => n.trim())
      .map((name, i) => ({
        id: `p-${i}-${Date.now()}`,
        name: name.trim(),
      }));
    setState({ ...INITIAL_STATE, players });
  };

  const setCaptains = (capA: Player, capB: Player) => {
    setState((prev) => ({
      ...prev,
      captainA: { ...capA, pickedBy: 'A', pickOrder: 0 },
      captainB: { ...capB, pickedBy: 'B', pickOrder: 0 },
      players: prev.players.map((p) => {
        if (p.id === capA.id) return { ...p, pickedBy: 'A', pickOrder: 0 };
        if (p.id === capB.id) return { ...p, pickedBy: 'B', pickOrder: 0 };
        return p;
      }),
      currentTurn: 'A',
      turnPhase: 1,
    }));
  };

  const pickPlayer = (playerId: string) => {
    setState((prev) => {
      const playerIndex = prev.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1 || prev.players[playerIndex].pickedBy) return prev;

      const newPlayers = [...prev.players];
      const pickOrder = prev.players.filter((p) => p.pickedBy).length + 1;
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        pickedBy: prev.currentTurn,
        pickOrder,
      };

      const totalPicks = newPlayers.filter((p) => p.pickedBy && p.pickOrder !== 0).length;
      const pattern = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B', 'B'];
      const nextTurn = (pattern[totalPicks] as 'A' | 'B') || (prev.currentTurn === 'A' ? 'B' : 'A');

      const isComplete = newPlayers.every((p) => p.pickedBy);

      return {
        ...prev,
        players: newPlayers,
        currentTurn: nextTurn,
        isComplete,
      };
    });
  };

  const resetDraft = () => {
    setState(INITIAL_STATE);
    localStorage.removeItem('draft7_state');
  };

  return (
    <DraftContext.Provider value={{ state, setPlayers, setCaptains, pickPlayer, resetDraft }}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (!context) throw new Error('useDraft must be used within a DraftProvider');
  return context;
};
