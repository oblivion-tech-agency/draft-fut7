'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ChevronDown, Move } from 'lucide-react';
import { DraftState, Player, TeamLineup } from '@/types/draft7';
import { Team, lastPick } from '@/lib/draft7/pick';
import {
  Slot,
  formationSlots,
  formationsFor,
  moveInLineup,
  teamLayout,
  withFormation,
} from '@/lib/draft7/formations';
import { AvatarMap, avatarFor } from '@/lib/draft7/avatars';
import { cn } from '@/lib/utils';
import { PlayerAvatar } from './PlayerAvatar';

// El equipo A ataca hacia abajo (mitad superior), el B hacia arriba.
const slotTop = (team: Team, slot: Slot) => (team === 'A' ? slot.y / 2 : 100 - slot.y / 2);

// Distancia máxima (en % del ancho de la cancha) para soltar sobre una posición.
const DROP_RADIUS = 16;

const PitchSpot: React.FC<{
  player?: Player;
  team: Team;
  slot: Slot;
  avatar?: string;
  isCaptain: boolean;
  isLatest: boolean;
  isNext: boolean;
  isNew: boolean;
  draggable: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDrag: (info: PanInfo) => void;
  onDragEnd: (info: PanInfo) => void;
}> = ({
  player,
  team,
  slot,
  avatar,
  isCaptain,
  isLatest,
  isNext,
  isNew,
  draggable,
  isDragging,
  isDropTarget,
  onDragStart,
  onDrag,
  onDragEnd,
}) => (
  <div
    className={cn('absolute -translate-x-1/2 -translate-y-1/2', isDragging ? 'z-30' : 'z-10')}
    style={{ left: `${slot.x}%`, top: `${slotTop(team, slot)}%` }}
  >
    <AnimatePresence mode="popLayout">
      {player ? (
        <motion.div
          key={player.id}
          layoutId={`pitch-${player.id}`}
          initial={isNew ? { opacity: 0, scale: 0.2, y: team === 'A' ? -40 : 40 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          drag={draggable}
          dragSnapToOrigin
          dragMomentum={false}
          whileDrag={{ scale: 1.15 }}
          onDragStart={onDragStart}
          onDrag={(_, info) => onDrag(info)}
          onDragEnd={(_, info) => onDragEnd(info)}
          className={cn(
            'flex flex-col items-center gap-1',
            draggable && 'cursor-grab active:cursor-grabbing touch-none select-none'
          )}
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
              className={cn(
                isLatest && 'ring-4 ring-yellow-300/80',
                isDropTarget && 'ring-4 ring-yellow-300',
                isDragging && 'shadow-2xl shadow-black/60'
              )}
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
            'size-10 sm:size-14 rounded-full border-2 border-dashed flex items-center justify-center transition-colors',
            team === 'A' ? 'border-primary/30' : 'border-white/25',
            isNext && 'animate-pulse border-solid',
            isNext && (team === 'A' ? 'border-primary bg-primary/15' : 'border-white bg-white/15'),
            isDropTarget && 'border-solid border-yellow-300 bg-yellow-300/25 scale-110'
          )}
        >
          <span className="text-white/30 text-lg font-black">?</span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/** Dibujo chico de una táctica: media cancha atacando hacia arriba. */
const FormationDrawing: React.FC<{ size: number; formation: string; team: Team }> = ({
  size,
  formation,
  team,
}) => (
  <svg viewBox="0 0 40 52" className="w-10 h-[52px] shrink-0" aria-hidden>
    <rect x="1" y="1" width="38" height="50" rx="3" className="fill-[#14532d] stroke-white/30" />
    <rect x="11" y="42" width="18" height="9" className="fill-none stroke-white/30" />
    <line x1="1" y1="1.5" x2="39" y2="1.5" className="stroke-white/30" />
    {formationSlots(size, formation).map((s, i, all) => (
      <circle
        key={i}
        cx={(s.x / 100) * 40}
        cy={52 * (1 - s.y / 100)}
        r="2.8"
        className={
          i === all.length - 1 ? 'fill-yellow-300' : team === 'A' ? 'fill-primary' : 'fill-white'
        }
      />
    ))}
  </svg>
);

const FormationPicker: React.FC<{
  team: Team;
  size: number;
  value: string;
  onChange: (formation: string) => void;
}> = ({ team, size, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = formationsFor(size);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (options.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-xl border pl-1.5 pr-3 py-1 font-black transition-colors',
          open
            ? 'border-yellow-300 bg-yellow-300/10'
            : 'border-white/15 bg-white/5 hover:bg-white/10'
        )}
      >
        <FormationDrawing size={size} formation={value} team={team} />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Táctica</span>
          <span className="text-lg tabular-nums">{value}</span>
        </span>
        <ChevronDown
          className={cn('size-4 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 top-full mt-2 z-50 w-[min(19rem,calc(100vw-2rem))] grid grid-cols-3 gap-2 p-2 rounded-2xl border border-white/15 bg-background-dark/95 backdrop-blur shadow-2xl"
          >
            {options.map((f) => (
              <li key={f} role="option" aria-selected={f === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(f);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex flex-col items-center gap-1 rounded-xl p-2 border text-sm font-black text-white tabular-nums transition-colors',
                    f === value
                      ? 'border-yellow-300 bg-yellow-300/15'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  )}
                >
                  <FormationDrawing size={size} formation={f} team={team} />
                  {f}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Pitch: React.FC<{
  state: DraftState;
  avatars: AvatarMap;
  className?: string;
  /** Equipo que el usuario puede acomodar (el suyo, si es capitán). */
  editableTeam?: Team | null;
  onLineupChange?: (lineup: TeamLineup) => void;
}> = ({ state, avatars, className, editableTeam, onLineupChange }) => {
  const latest = lastPick(state);
  const pitchRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  // Jugadores que ya estaban en la cancha: al moverlos no repiten la entrada.
  const seen = useRef(new Set<string>());
  useEffect(() => {
    state.players.forEach((p) => p.pickedBy && seen.current.add(p.id));
  });

  const layouts = { A: teamLayout(state, 'A'), B: teamLayout(state, 'B') };
  const canEdit = !!editableTeam && !!onLineupChange;

  /** Posición del equipo editable más cercana al punto donde se soltó. */
  const slotAt = (info: PanInfo): number | null => {
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect || !editableTeam) return null;
    const x = info.point.x - window.scrollX - rect.left;
    const y = info.point.y - window.scrollY - rect.top;
    let best: number | null = null;
    let bestDist = (DROP_RADIUS / 100) * rect.width;
    layouts[editableTeam].slots.forEach((slot, i) => {
      const dx = (slot.x / 100) * rect.width - x;
      const dy = (slotTop(editableTeam, slot) / 100) * rect.height - y;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const renderTeam = (team: Team) => {
    const { slots, placed } = layouts[team];
    const captainId = team === 'A' ? state.captainA?.id : state.captainB?.id;
    const nextSlot = placed.findIndex((p) => !p);
    const editable = canEdit && team === editableTeam;
    return slots.map((slot, i) => {
      const player = placed[i];
      return (
        <PitchSpot
          key={`${team}-${i}`}
          player={player}
          team={team}
          slot={slot}
          avatar={player ? avatarFor(avatars, player.name) : undefined}
          isCaptain={player?.id === captainId}
          isLatest={!!player && player.id === latest?.id && (latest?.pickOrder ?? 0) > 0}
          isNext={!state.isComplete && state.currentTurn === team && i === nextSlot}
          isNew={!!player && !seen.current.has(player.id)}
          draggable={editable && !!player}
          isDragging={editable && dragging === i}
          isDropTarget={editable && dragging !== null && dropTarget === i && dragging !== i}
          onDragStart={() => setDragging(i)}
          onDrag={(info) => setDropTarget(slotAt(info))}
          onDragEnd={(info) => {
            const to = slotAt(info);
            setDragging(null);
            setDropTarget(null);
            if (to !== null && to !== i && onLineupChange) {
              onLineupChange(moveInLineup(state, team, i, to));
            }
          }}
        />
      );
    });
  };

  return (
    <div className={cn('w-full flex flex-col gap-3', className)}>
      {canEdit && editableTeam && (
        <div className="flex items-center justify-between gap-3">
          <FormationPicker
            team={editableTeam}
            size={layouts[editableTeam].size}
            value={layouts[editableTeam].formation}
            onChange={(f) => onLineupChange?.(withFormation(state, editableTeam, f))}
          />
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400 text-right">
            <Move className="size-3.5 shrink-0" />
            Arrastrá a tus jugadores para cambiarlos de lugar
          </p>
        </div>
      )}

      <div
        ref={pitchRef}
        className="relative w-full aspect-[2/3] sm:aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white/15 shadow-2xl pitch-grass select-none"
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
          Equipo A · {layouts.A.formation}
        </div>
        <div className="absolute bottom-5 left-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 pointer-events-none">
          Equipo B · {layouts.B.formation}
        </div>

        {renderTeam('A')}
        {renderTeam('B')}
      </div>
    </div>
  );
};
