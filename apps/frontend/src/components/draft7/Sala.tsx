'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Room, DraftState, CaptainRole, Player } from '@/types/draft7';
import {
  Search,
  Eye,
  Copy,
  RefreshCw,
  Check,
  AlertCircle,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  X,
  ListOrdered,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Team,
  applyPick,
  finalTeamSize,
  lastPick,
  picksMade,
  teamPlayers,
  totalPicks,
  upcomingTurns,
} from '@/lib/draft7/pick';
import { AvatarMap, avatarFor, useAvatars } from '@/lib/draft7/avatars';
import {
  flashTitle,
  notificationsSupported,
  playPick,
  playYourTurn,
  requestNotificationPermission,
  showSystemNotification,
  stopFlashTitle,
  unlockAudio,
  vibrate,
} from '@/lib/draft7/alerts';
import { cn } from '@/lib/utils';
import { Pitch } from './sala/Pitch';
import { PlayerAvatar } from './sala/PlayerAvatar';

const POLL_INTERVAL_MS = 4000;
const SOUND_KEY = 'draft7_sound';

const captainOf = (state: DraftState, team: Team) =>
  team === 'A' ? state.captainA : state.captainB;

function readSoundPref(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

function writeSoundPref(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
  } catch {
    // Sin storage (modo privado): la preferencia dura lo que la pestaña.
  }
}

// ─── JOIN SCREEN ─────────────────────────────────────────────────────────────
const JoinScreen: React.FC<{
  roomId: string;
  room: Room;
  state: DraftState;
  avatars: AvatarMap;
  onJoin: (role: CaptainRole) => void;
}> = ({ roomId, room, state, avatars, onJoin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const upper = code.toUpperCase().trim();
    if (upper === room.captain_a_code) {
      onJoin('A');
    } else if (upper === room.captain_b_code) {
      onJoin('B');
    } else {
      setError('Código incorrecto. Revisá el código que te mandaron.');
    }
  };

  const capA = state.captainA;
  const capB = state.captainB;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col gap-8"
      >
        <div className="text-center flex flex-col items-center gap-2">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Sala</p>
          <h1 className="text-4xl font-black tracking-tight">{roomId}</h1>
          <p className="text-slate-400 text-sm">
            {state.players.length} jugadores · {picksMade(state)}/{totalPicks(state)} picks
          </p>
        </div>

        <div className="flex items-center justify-center gap-6">
          {capA && (
            <div className="flex flex-col items-center gap-2 w-28">
              <PlayerAvatar
                name={capA.name}
                src={avatarFor(avatars, capA.name)}
                team="A"
                size="xl"
              />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Equipo A
              </span>
              <span className="font-bold truncate max-w-full">{capA.name}</span>
            </div>
          )}
          <span className="text-2xl font-black italic text-slate-500">VS</span>
          {capB && (
            <div className="flex flex-col items-center gap-2 w-28">
              <PlayerAvatar
                name={capB.name}
                src={avatarFor(avatars, capB.name)}
                team="B"
                size="xl"
              />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Equipo B
              </span>
              <span className="font-bold truncate max-w-full">{capB.name}</span>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 backdrop-blur">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-300">
                ¿Sos capitán? Ingresá tu código
              </span>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="A-4X2K"
                className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-4 text-center text-2xl font-mono font-black tracking-[0.3em] text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase"
                autoFocus
              />
            </label>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full h-14 bg-primary text-background-dark font-black rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-primary/20"
            >
              Entrar como capitán
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={() => onJoin('spectator')}
            className="w-full h-12 flex items-center justify-center gap-2 border border-white/10 text-slate-300 rounded-2xl hover:bg-white/5 transition-all font-medium"
          >
            <Eye className="size-4" />
            Mirar en vivo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── SCOREBOARD ──────────────────────────────────────────────────────────────
const TeamCard: React.FC<{
  state: DraftState;
  team: Team;
  avatars: AvatarMap;
  isMine: boolean;
}> = ({ state, team, avatars, isMine }) => {
  const captain = captainOf(state, team);
  const players = teamPlayers(state, team);
  const size = finalTeamSize(state, team);
  const active = !state.isComplete && state.currentTurn === team;
  const isA = team === 'A';

  return (
    <div
      className={cn(
        'relative flex-1 min-w-0 rounded-2xl border p-3 sm:p-4 transition-all duration-500',
        isA ? 'border-primary/20 bg-primary/5' : 'border-white/10 bg-white/5',
        active && isA && 'border-primary bg-primary/15 shadow-[0_0_40px_rgba(13,242,89,0.25)]',
        active && !isA && 'border-white bg-white/15 shadow-[0_0_40px_rgba(255,255,255,0.18)]',
        isA ? 'text-left' : 'text-right'
      )}
    >
      <div className={cn('flex items-center gap-3', !isA && 'flex-row-reverse')}>
        {captain && (
          <PlayerAvatar name={captain.name} src={avatarFor(avatars, captain.name)} team={team} />
        )}
        <div className="min-w-0">
          <p
            className={cn(
              'text-[10px] font-black uppercase tracking-[0.2em]',
              isA ? 'text-primary' : 'text-slate-300'
            )}
          >
            Equipo {team}
            {isMine && <span className="ml-1 text-yellow-300">· vos</span>}
          </p>
          <p className="font-black truncate text-sm sm:text-base">{captain?.name}</p>
        </div>
      </div>
      <div className={cn('mt-3 flex items-center gap-2', !isA && 'flex-row-reverse')}>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isA ? 'bg-primary' : 'bg-white',
              !isA && 'ml-auto'
            )}
            animate={{ width: `${(players.length / size) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black tabular-nums">
          {players.length}/{size}
        </span>
      </div>
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1',
              isA
                ? 'left-3 bg-primary text-background-dark'
                : 'right-3 bg-white text-background-dark'
            )}
          >
            <span className="size-1.5 rounded-full bg-background-dark animate-pulse" />
            Eligiendo
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

const TurnBanner: React.FC<{
  state: DraftState;
  role: CaptainRole;
  connected: boolean;
}> = ({ state, role, connected }) => {
  const turn = state.currentTurn;
  const isMyTurn = role === turn;
  const captain = captainOf(state, turn);
  const made = picksMade(state);
  const total = totalPicks(state);
  const upcoming = upcomingTurns(state, 6);

  return (
    <motion.div
      key={`${turn}-${made}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 border',
        isMyTurn
          ? 'bg-yellow-300 text-background-dark border-yellow-200 shadow-[0_0_50px_rgba(253,224,71,0.35)]'
          : 'bg-white/5 border-white/10'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isMyTurn ? (
          <motion.div
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <BellRing className="size-6" />
          </motion.div>
        ) : (
          <span className="relative flex size-3">
            <span
              className={cn(
                'absolute inline-flex size-full rounded-full opacity-75 animate-ping',
                turn === 'A' ? 'bg-primary' : 'bg-white'
              )}
            />
            <span
              className={cn(
                'relative inline-flex size-3 rounded-full',
                turn === 'A' ? 'bg-primary' : 'bg-white'
              )}
            />
          </span>
        )}
        <div className="min-w-0">
          <p className="font-black uppercase leading-tight truncate">
            {isMyTurn
              ? '¡Te toca elegir!'
              : role === 'spectator'
                ? `${captain?.name} está eligiendo`
                : `Esperando a ${captain?.name}…`}
          </p>
          <p className={cn('text-xs', isMyTurn ? 'text-background-dark/70' : 'text-slate-400')}>
            Pick {Math.min(made + 1, total)} de {total} · Equipo {turn}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1">
          {upcoming.map((t, i) => (
            <span
              key={i}
              className={cn(
                'size-6 rounded-md text-[10px] font-black flex items-center justify-center',
                t === 'A' ? 'bg-primary text-background-dark' : 'bg-white text-background-dark',
                i === 0 ? 'scale-110 ring-2 ring-offset-1 ring-offset-transparent' : 'opacity-50',
                isMyTurn ? 'ring-background-dark' : 'ring-yellow-300'
              )}
            >
              {t}
            </span>
          ))}
        </div>
        <span
          className={cn(
            'flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest',
            isMyTurn ? 'text-background-dark/70' : connected ? 'text-red-400' : 'text-slate-500'
          )}
          title={connected ? 'Conectado en tiempo real' : 'Reconectando…'}
        >
          <span
            className={cn(
              'size-2 rounded-full',
              connected ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
            )}
          />
          {connected ? 'En vivo' : 'Sync'}
        </span>
      </div>
    </motion.div>
  );
};

// ─── AVAILABLE PLAYERS ───────────────────────────────────────────────────────
const AvailablePlayers: React.FC<{
  state: DraftState;
  avatars: AvatarMap;
  canPick: boolean;
  myTeam: Team | null;
  picking: boolean;
  onPick: (playerId: string) => void;
}> = ({ state, avatars, canPick, myTeam, picking, onPick }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const available = state.players.filter((p) => !p.pickedBy);
  const filtered = available.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const selectedPlayer = available.find((p) => p.id === selected) ?? null;

  // Si el jugador seleccionado ya no está disponible o perdí el turno, limpiar.
  useEffect(() => {
    if (!canPick || (selected && !available.some((p) => p.id === selected))) setSelected(null);
  }, [canPick, selected, available]);

  return (
    <div
      className={cn(
        'rounded-3xl border flex flex-col overflow-hidden transition-all',
        canPick ? 'border-yellow-300/60 bg-yellow-300/5' : 'border-white/10 bg-white/[0.03]'
      )}
    >
      <div className="p-4 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg flex items-center gap-2">
            Disponibles
            <span className="text-xs font-bold bg-white/10 rounded-full px-2 py-0.5">
              {available.length}
            </span>
          </h3>
          {!canPick && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {myTeam ? 'Esperá tu turno' : 'Solo lectura'}
            </span>
          )}
        </div>
        {available.length > 6 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Buscar jugador…"
            />
          </div>
        )}
      </div>

      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto">
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map((p) => {
            const isSelected = p.id === selected;
            return (
              <motion.button
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={() => canPick && setSelected(isSelected ? null : p.id)}
                disabled={!canPick || picking}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl p-3 border text-center transition-colors',
                  canPick
                    ? 'border-white/10 bg-white/5 hover:border-yellow-300/70 hover:bg-yellow-300/10 cursor-pointer'
                    : 'border-white/5 bg-white/[0.02] cursor-default',
                  isSelected && 'border-yellow-300 bg-yellow-300/20 ring-2 ring-yellow-300'
                )}
              >
                <PlayerAvatar
                  name={p.name}
                  src={avatarFor(avatars, p.name)}
                  size="md"
                  className={cn(!canPick && 'opacity-70')}
                />
                <span className="text-xs font-bold leading-tight line-clamp-2">{p.name}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="col-span-full text-center py-10 text-slate-500 italic text-sm">
            {available.length === 0 ? 'No quedan jugadores' : 'Sin resultados'}
          </p>
        )}
      </div>

      <AnimatePresence>
        {selectedPlayer && canPick && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-0 p-3 border-t border-yellow-300/40 bg-background-dark/95 backdrop-blur flex items-center gap-3"
          >
            <PlayerAvatar
              name={selectedPlayer.name}
              src={avatarFor(avatars, selectedPlayer.name)}
              team={myTeam ?? undefined}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                ¿Confirmás?
              </p>
              <p className="font-black truncate">{selectedPlayer.name}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="p-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
              aria-label="Cancelar"
            >
              <X className="size-4" />
            </button>
            <button
              onClick={() => onPick(selectedPlayer.id)}
              disabled={picking}
              className="px-5 py-3 rounded-xl bg-yellow-300 text-background-dark font-black hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {picking ? 'Eligiendo…' : 'Elegir'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── PICK FEED ───────────────────────────────────────────────────────────────
const PickFeed: React.FC<{ state: DraftState; avatars: AvatarMap }> = ({ state, avatars }) => {
  const picks = state.players
    .filter((p) => p.pickedBy && p.pickOrder)
    .sort((a, b) => (b.pickOrder ?? 0) - (a.pickOrder ?? 0));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <h3 className="px-4 py-3 border-b border-white/10 font-black flex items-center gap-2">
        <ListOrdered className="size-4 text-slate-400" />
        Historial de picks
      </h3>
      <ol className="p-2 max-h-72 overflow-y-auto">
        <AnimatePresence initial={false}>
          {picks.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(253,224,71,0.25)' }}
              animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(253,224,71,0)' }}
              transition={{ backgroundColor: { duration: 2.5 } }}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-xl',
                i === 0 && 'bg-white/5'
              )}
            >
              <span className="w-7 text-xs font-black text-slate-500 tabular-nums">
                #{(p.pickOrder ?? 0) - 2}
              </span>
              <PlayerAvatar
                name={p.name}
                src={avatarFor(avatars, p.name)}
                team={p.pickedBy}
                size="sm"
              />
              <span className="flex-1 font-bold text-sm truncate">{p.name}</span>
              <span
                className={cn(
                  'text-[10px] font-black px-2 py-0.5 rounded-full',
                  p.pickedBy === 'A' ? 'bg-primary/20 text-primary' : 'bg-white/15 text-white'
                )}
              >
                {captainOf(state, p.pickedBy as Team)?.name}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        {picks.length === 0 && (
          <li className="text-center py-8 text-slate-500 italic text-sm">Todavía no hay picks</li>
        )}
      </ol>
    </div>
  );
};

// ─── OVERLAYS ────────────────────────────────────────────────────────────────
const PickAnnouncement: React.FC<{
  pick: Player | null;
  state: DraftState;
  avatars: AvatarMap;
  onDone: () => void;
}> = ({ pick, state, avatars, onDone }) => {
  useEffect(() => {
    if (!pick) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [pick, onDone]);

  const team = pick?.pickedBy as Team | undefined;

  return (
    <AnimatePresence>
      {pick && team && (
        <motion.div
          key={pick.id}
          initial={{ opacity: 0, y: -60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-32px)] max-w-sm pointer-events-none"
        >
          <div
            className={cn(
              'flex items-center gap-4 rounded-3xl p-4 shadow-2xl border-2',
              team === 'A'
                ? 'bg-primary text-background-dark border-primary'
                : 'bg-white text-background-dark border-white'
            )}
          >
            <motion.div
              initial={{ rotate: -20, scale: 0.4 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}
            >
              <PlayerAvatar
                name={pick.name}
                src={avatarFor(avatars, pick.name)}
                size="xl"
                className="border-background-dark/20"
              />
            </motion.div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                Pick #{(pick.pickOrder ?? 0) - 2} · {captainOf(state, team)?.name} eligió a
              </p>
              <p className="text-2xl font-black leading-tight truncate">{pick.name}</p>
              <p className="text-xs font-bold opacity-70">Equipo {team}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const YourTurnOverlay: React.FC<{ show: boolean; name?: string; onClose: () => void }> = ({
  show,
  name,
  onClose,
}) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="relative flex flex-col items-center gap-4 text-center"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute top-8 size-24 rounded-full border-4 border-yellow-300"
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }}
              />
            ))}
            <div className="relative size-40 rounded-full bg-yellow-300 text-background-dark flex items-center justify-center shadow-[0_0_80px_rgba(253,224,71,0.6)]">
              <motion.div
                animate={{ rotate: [0, -18, 18, -12, 12, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.4 }}
              >
                <BellRing className="size-20" />
              </motion.div>
            </div>
            <p className="text-5xl font-black italic uppercase text-white drop-shadow-lg">
              ¡Te toca!
            </p>
            <p className="text-slate-200 text-lg">
              {name ? `${name}, elegí` : 'Elegí'} a tu próximo jugador
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── DRAFT SCREEN ────────────────────────────────────────────────────────────
const DraftScreen: React.FC<{
  state: DraftState;
  role: CaptainRole;
  avatars: AvatarMap;
  connected: boolean;
  picking: boolean;
  soundOn: boolean;
  notifPermission: NotificationPermission | null;
  onToggleSound: () => void;
  onEnableNotifications: () => void;
  onPick: (playerId: string) => void;
}> = ({
  state,
  role,
  avatars,
  connected,
  picking,
  soundOn,
  notifPermission,
  onToggleSound,
  onEnableNotifications,
  onPick,
}) => {
  const myTeam = role === 'spectator' ? null : role;
  const canPick = !!myTeam && myTeam === state.currentTurn && !state.isComplete;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4">
      {/* Barra de rol y controles */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-slate-400">
          <Eye className="size-3.5" />
          {myTeam ? `Capitán ${myTeam} · ${captainOf(state, myTeam)?.name}` : 'Espectador'}
        </span>
        <div className="flex items-center gap-2">
          {myTeam && notificationsSupported() && notifPermission !== 'granted' && (
            <button
              onClick={onEnableNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-300/40 text-yellow-300 font-bold hover:bg-yellow-300/10"
            >
              <Bell className="size-3.5" />
              Avisarme
            </button>
          )}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-full border border-white/10 text-slate-300 hover:bg-white/5"
            aria-label={soundOn ? 'Silenciar' : 'Activar sonido'}
            title={soundOn ? 'Silenciar' : 'Activar sonido'}
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        </div>
      </div>

      <div className="sticky top-[73px] z-40 -mx-4 px-4 py-2 bg-background-dark/80 backdrop-blur-md">
        <TurnBanner state={state} role={role} connected={connected} />
      </div>

      <div className="flex gap-3">
        <TeamCard state={state} team="A" avatars={avatars} isMine={myTeam === 'A'} />
        <TeamCard state={state} team="B" avatars={avatars} isMine={myTeam === 'B'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)] gap-4 items-start">
        <div className={cn('flex justify-center', canPick && 'order-2 lg:order-none')}>
          <Pitch state={state} avatars={avatars} className="max-w-[560px]" />
        </div>
        <div className={cn('flex flex-col gap-4', canPick && 'order-1 lg:order-none')}>
          <AvailablePlayers
            state={state}
            avatars={avatars}
            canPick={canPick}
            myTeam={myTeam}
            picking={picking}
            onPick={onPick}
          />
          <PickFeed state={state} avatars={avatars} />
        </div>
      </div>
    </div>
  );
};

// ─── RESULTS SCREEN ──────────────────────────────────────────────────────────
const ResultsScreen: React.FC<{ state: DraftState; avatars: AvatarMap }> = ({ state, avatars }) => {
  const [copied, setCopied] = useState(false);
  const teamA = teamPlayers(state, 'A');
  const teamB = teamPlayers(state, 'B');

  const copyToClipboard = () => {
    const list = (team: Player[], captain: Player | null) =>
      team.map((p) => `- ${p.name}${p.id === captain?.id ? ' (C)' : ''}`).join('\n');
    const text = `⚽ *Draft7*\n\n🟢 *Equipo A*\n${list(teamA, state.captainA)}\n\n⚪ *Equipo B*\n${list(teamB, state.captainB)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TeamList = ({ team, players }: { team: Team; players: Player[] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: team === 'A' ? 0.1 : 0.2 }}
      className={cn(
        'rounded-3xl border overflow-hidden',
        team === 'A' ? 'border-primary/30 bg-primary/5' : 'border-white/15 bg-white/5'
      )}
    >
      <div
        className={cn(
          'px-5 py-3 flex justify-between items-center text-background-dark',
          team === 'A' ? 'bg-primary' : 'bg-white'
        )}
      >
        <h3 className="text-lg font-black uppercase">Equipo {team}</h3>
        <span className="text-xs font-bold">{players.length} jugadores</span>
      </div>
      <ul className="p-3 flex flex-col gap-1">
        {players.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-2 py-1.5">
            <PlayerAvatar name={p.name} src={avatarFor(avatars, p.name)} team={team} size="sm" />
            <span className="font-bold flex-1 truncate">{p.name}</span>
            {p.id === captainOf(state, team)?.id && (
              <span className="text-[10px] font-black bg-yellow-400 text-background-dark rounded-full px-2 py-0.5">
                CAPITÁN
              </span>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl font-black italic tracking-tight"
          >
            ¡Equipos listos!
          </motion.h1>
          <p className="text-primary/80 mt-1">A la cancha 🏟️</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/draft7/crear"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-2xl border border-white/15 font-bold whitespace-nowrap hover:bg-white/5"
          >
            <Plus className="size-4" />
            Nuevo draft
          </Link>
          <button
            onClick={copyToClipboard}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-primary text-background-dark rounded-2xl font-black whitespace-nowrap shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
            {copied ? '¡Copiado!' : 'Copiar equipos'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6 items-start">
        <Pitch state={state} avatars={avatars} className="mx-auto max-w-[520px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          <TeamList team="A" players={teamA} />
          <TeamList team="B" players={teamB} />
        </div>
      </div>
    </div>
  );
};

// ─── MAIN SALA COMPONENT ─────────────────────────────────────────────────────
export const Sala: React.FC<{ roomId: string }> = ({ roomId }) => {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [state, setState] = useState<DraftState | null>(null);
  const [role, setRole] = useState<CaptainRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [connected, setConnected] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<Player | null>(null);
  const [showYourTurn, setShowYourTurn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prevStateRef = useRef<DraftState | null>(null);

  const avatars = useAvatars(state?.players.map((p) => p.name) ?? []);

  /** Aplica un estado recibido, ignorando versiones más viejas que la actual. */
  const receiveState = useCallback((incoming: DraftState) => {
    setState((current) => {
      if (current && picksMade(incoming) < picksMade(current)) return current;
      return incoming;
    });
  }, []);

  const fetchState = useCallback(async () => {
    const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).single();
    if (error || !data) return null;
    return data as Room;
  }, [roomId]);

  // Carga inicial
  useEffect(() => {
    try {
      const savedRole = sessionStorage.getItem(`draft7_role_${roomId}`) as CaptainRole | null;
      if (savedRole) setRole(savedRole);
    } catch {
      // sessionStorage no disponible
    }
    setSoundOn(readSoundPref());
    if (notificationsSupported()) setNotifPermission(Notification.permission);

    fetchState().then((data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setRoom(data);
        setState(data.state);
      }
      setLoading(false);
    });
  }, [roomId, fetchState]);

  // Tiempo real: broadcast entre clientes + cambios en la tabla como respaldo
  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on('broadcast', { event: 'state_update' }, ({ payload }) => {
        receiveState(payload.state as DraftState);
      })
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const next = (payload.new as Partial<Room>)?.state;
          if (next) receiveState(next);
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
        // Al (re)conectar, traer el estado por si nos perdimos algo
        if (status === 'SUBSCRIBED') fetchState().then((d) => d && receiveState(d.state));
      });
    channelRef.current = channel;

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [room, roomId, receiveState, fetchState]);

  // Polling de respaldo: así nunca hace falta recargar la página, aunque el
  // websocket se caiga (pasa seguido en celulares que bloquean la pantalla).
  useEffect(() => {
    if (!room || state?.isComplete) return;

    const refresh = () => {
      if (document.visibilityState === 'visible') {
        fetchState().then((d) => d && receiveState(d.state));
      }
    };
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [room, state?.isComplete, fetchState, receiveState]);

  // Desbloquear audio en la primera interacción (requisito de los navegadores)
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Detectar picks nuevos y cambios de turno para avisar
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;
    if (!prev || !state || !role) return;

    if (picksMade(state) > picksMade(prev)) {
      const pick = lastPick(state);
      if (pick) setAnnouncement(pick);

      const myTurnNow = role === state.currentTurn && !state.isComplete;
      const myTurnBefore = role === prev.currentTurn;
      if (myTurnNow && !myTurnBefore) {
        setShowYourTurn(true);
        if (soundOn) playYourTurn();
        vibrate();
        flashTitle('🔔 ¡Te toca elegir!');
        showSystemNotification(
          '¡Te toca elegir!',
          pick ? `${captainOf(state, pick.pickedBy as Team)?.name} eligió a ${pick.name}` : ''
        );
      } else if (soundOn) {
        playPick();
      }
    }
  }, [state, role, soundOn]);

  useEffect(() => () => stopFlashTitle(), []);

  const handleJoin = useCallback(
    (selectedRole: CaptainRole) => {
      try {
        sessionStorage.setItem(`draft7_role_${roomId}`, selectedRole);
      } catch {
        // sessionStorage no disponible
      }
      unlockAudio();
      setRole(selectedRole);
    },
    [roomId]
  );

  const handleToggleSound = useCallback(() => {
    setSoundOn((on) => {
      writeSoundPref(!on);
      if (!on) {
        unlockAudio();
        playPick();
      }
      return !on;
    });
  }, []);

  const handleEnableNotifications = useCallback(async () => {
    unlockAudio();
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (soundOn) playYourTurn();
  }, [soundOn]);

  const handlePick = useCallback(
    async (playerId: string) => {
      if (!state || !role || role === 'spectator' || picking) return;
      setPicking(true);
      setPickError(null);

      // Partir del estado más reciente para no pisar un pick del otro capitán
      const latest = (await fetchState())?.state ?? state;
      if (latest.currentTurn !== role || latest.isComplete) {
        receiveState(latest);
        setPickError('Ya no es tu turno.');
        setPicking(false);
        return;
      }
      if (latest.players.find((p) => p.id === playerId)?.pickedBy) {
        receiveState(latest);
        setPickError('Ese jugador ya fue elegido.');
        setPicking(false);
        return;
      }

      const newState = applyPick(latest, playerId);
      setState(newState);

      const [{ error }] = await Promise.all([
        supabase.from('rooms').update({ state: newState }).eq('id', roomId),
        channelRef.current?.send({
          type: 'broadcast',
          event: 'state_update',
          payload: { state: newState },
        }),
      ]);
      if (error) {
        setPickError('No se pudo guardar el pick. Probá de nuevo.');
        setState(latest);
      }
      setPicking(false);
    },
    [state, role, roomId, picking, fetchState, receiveState]
  );

  useEffect(() => {
    if (!pickError) return;
    const t = setTimeout(() => setPickError(null), 3000);
    return () => clearTimeout(t);
  }, [pickError]);

  const clearAnnouncement = useCallback(() => setAnnouncement(null), []);
  const closeYourTurn = useCallback(() => setShowYourTurn(false), []);

  let content: React.ReactNode = null;

  if (loading) {
    content = (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Cargando sala…</p>
        </div>
      </div>
    );
  } else if (notFound) {
    content = (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-4">
          <AlertCircle className="size-12 text-red-400" />
          <h2 className="text-2xl font-black">Sala no encontrada</h2>
          <p className="text-slate-400">
            El código <span className="font-mono font-bold">{roomId}</span> no existe o expiró.
          </p>
          <button
            onClick={() => router.push('/draft7/crear')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-xl font-bold"
          >
            <RefreshCw className="size-4" />
            Crear nueva sala
          </button>
        </div>
      </div>
    );
  } else if (state && room && !role) {
    content = (
      <JoinScreen roomId={roomId} room={room} state={state} avatars={avatars} onJoin={handleJoin} />
    );
  } else if (state && role && state.isComplete) {
    content = <ResultsScreen state={state} avatars={avatars} />;
  } else if (state && role) {
    content = (
      <DraftScreen
        state={state}
        role={role}
        avatars={avatars}
        connected={connected}
        picking={picking}
        soundOn={soundOn}
        notifPermission={notifPermission}
        onToggleSound={handleToggleSound}
        onEnableNotifications={handleEnableNotifications}
        onPick={handlePick}
      />
    );
  }

  return (
    <div className="relative min-h-full bg-background-dark text-white overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(13,242,89,0.12),transparent_70%)]" />
      <div className="relative">{content}</div>

      {state && (
        <PickAnnouncement
          pick={announcement}
          state={state}
          avatars={avatars}
          onDone={clearAnnouncement}
        />
      )}
      <YourTurnOverlay
        show={showYourTurn}
        name={role && role !== 'spectator' && state ? captainOf(state, role)?.name : undefined}
        onClose={closeYourTurn}
      />

      <AnimatePresence>
        {pickError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-red-500 text-white font-bold px-4 py-3 rounded-2xl shadow-xl"
          >
            <AlertCircle className="size-4" />
            {pickError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
