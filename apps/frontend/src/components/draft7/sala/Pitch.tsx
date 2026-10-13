'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DraftState, Player } from '@/types/draft7';
import { Team, finalTeamSize, teamPlayers, lastPick } from '@/lib/draft7/pick';
import { AvatarMap, avatarFor } from '@/lib/draft7/avatars';
import { cn } from '@/lib/utils';
import { PlayerAvatar } from './PlayerAvatar';

// Filas de jugadores de campo (de la defensa al ataque) según cuántos haya.
const FORMATIONS: Record<number, number[]> = {
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

function formationRows(outfield: number): number[] {
  if (FORMATIONS[outfield]) return FORMATIONS[outfield];
  const rows: number[] = [];
  for (let left = outfield; left > 0; left -= 4) rows.push(Math.min(4, left));
  return rows;
}

interface Slot {
  x: number; // % del ancho
  y: number; // % del alto de la mitad, desde el arco propio
}

/**
 * Posiciones de un equipo en su mitad, en el orden en que se van llenando:
 * el capitán arranca adelante, los picks completan hacia atrás y el último
 * va al arco (como en todo picado).
 */
function teamSlots(size: number): Slot[] {
  const rows = formationRows(Math.max(0, size - 1));
  const slots: Slot[] = [];
  rows.forEach((count, r) => {
    const y = rows.length === 1 ? 62 : 38 + (r * 48) / (rows.length - 1);
    for (let i = 0; i < count; i++) slots.push({ x: ((i + 1) * 100) / (count + 1), y });
  });
  slots.reverse();
  if (size > 0) slots.push({ x: 50, y: 15 });
  return slots;
}

const PitchSpot: React.FC<{
  player?: Player;
  team: Team;
  slot: Slot;
  avatar?: string;
  isCaptain: boolean;
  isLatest: boolean;
  isNext: boolean;
}> = ({ player, team, slot, avatar, isCaptain, isLatest, isNext }) => {
  // El equipo A ataca hacia abajo (mitad superior), el B hacia arriba.
  const top = team === 'A' ? slot.y / 2 : 100 - slot.y / 2;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${slot.x}%`, top: `${top}%` }}
    >
      <AnimatePresence mode="popLayout">
        {player ? (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.2, y: team === 'A' ? -40 : 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="relative">
              {isLatest && (
                <motion.span
                  className={cn(
                    'absolute -inset-1.5 rounded-full',
                    team === 'A' ? 'bg-primary/60' : 'bg-white/60'
                  )}
                  initial={{ scale: 0.8, opacity: 0.9 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: 3, ease: 'easeOut' }}
                />
              )}
              <PlayerAvatar
                name={player.name}
                src={avatar}
                team={team}
                size="lg"
                className={cn(isLatest && 'ring-4 ring-yellow-300/80')}
              />
              {isCaptain && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-yellow-400 text-[10px] font-black text-background-dark flex items-center justify-center border-2 border-background-dark">
                  C
                </span>
              )}
              {!isCaptain && player.pickOrder ? (
                <span className="absolute -bottom-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-background-dark text-[9px] font-black text-white flex items-center justify-center border border-white/30">
                  #{player.pickOrder - 2}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-white leading-none max-w-[72px] text-center truncate bg-black/60 backdrop-blur px-2 py-1 rounded-full">
              {player.name}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cn(
              'size-10 sm:size-14 rounded-full border-2 border-dashed flex items-center justify-center',
              team === 'A' ? 'border-primary/30' : 'border-white/25',
              isNext && 'animate-pulse border-solid',
              isNext && (team === 'A' ? 'border-primary bg-primary/15' : 'border-white bg-white/15')
            )}
          >
            <span className="text-white/30 text-lg font-black">?</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Pitch: React.FC<{
  state: DraftState;
  avatars: AvatarMap;
  className?: string;
}> = ({ state, avatars, className }) => {
  const latest = lastPick(state);

  const renderTeam = (team: Team) => {
    const players = teamPlayers(state, team);
    const slots = teamSlots(finalTeamSize(state, team));
    const captainId = team === 'A' ? state.captainA?.id : state.captainB?.id;
    return slots.map((slot, i) => (
      <PitchSpot
        key={`${team}-${i}`}
        player={players[i]}
        team={team}
        slot={slot}
        avatar={players[i] ? avatarFor(avatars, players[i].name) : undefined}
        isCaptain={players[i]?.id === captainId}
        isLatest={!!players[i] && players[i].id === latest?.id && (latest?.pickOrder ?? 0) > 0}
        isNext={!state.isComplete && state.currentTurn === team && i === players.length}
      />
    ));
  };

  return (
    <div
      className={cn(
        'relative w-full aspect-[2/3] sm:aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white/15 shadow-2xl pitch-grass',
        className
      )}
    >
      {/* Líneas de la cancha */}
      <div className="absolute inset-3 border-2 border-white/25 rounded-xl pointer-events-none" />
      <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-white/25 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[28%] aspect-square border-2 border-white/25 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 size-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[46%] h-[13%] border-x-2 border-b-2 border-white/25 rounded-b-lg pointer-events-none" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[46%] h-[13%] border-x-2 border-t-2 border-white/25 rounded-t-lg pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[22%] h-2 bg-white/30 rounded-b pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[22%] h-2 bg-white/30 rounded-t pointer-events-none" />

      {/* Etiquetas de cada mitad */}
      <div className="absolute top-5 left-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/90 pointer-events-none">
        Equipo A
      </div>
      <div className="absolute bottom-5 left-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 pointer-events-none">
        Equipo B
      </div>

      {renderTeam('A')}
      {renderTeam('B')}
    </div>
  );
};
