'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Room, DraftState, CaptainRole, Player } from '@/types/draft7';
import {
  Search,
  PlusCircle,
  Timer,
  UserPlus,
  Trophy,
  Eye,
  Star,
  Copy,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── PICK LOGIC ──────────────────────────────────────────────────────────────
const PICK_PATTERN: Array<'A' | 'B'> = [
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

function applyPick(state: DraftState, playerId: string): DraftState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || state.players[playerIndex].pickedBy) return state;

  const newPlayers = [...state.players];
  const pickOrder = state.players.filter((p) => p.pickedBy).length + 1;
  newPlayers[playerIndex] = { ...newPlayers[playerIndex], pickedBy: state.currentTurn, pickOrder };

  const totalPicks = newPlayers.filter((p) => p.pickedBy && p.pickOrder !== 0).length;
  const nextTurn = PICK_PATTERN[totalPicks] ?? (state.currentTurn === 'A' ? 'B' : 'A');
  const isComplete = newPlayers.every((p) => p.pickedBy);

  return { ...state, players: newPlayers, currentTurn: nextTurn, isComplete };
}

// ─── PITCH PLAYER CARD ───────────────────────────────────────────────────────
const PitchPlayerCard: React.FC<{ player: Player; team: 'A' | 'B' }> = ({ player, team }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, y: team === 'A' ? -12 : 12 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.4 }}
    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    className="flex flex-col items-center gap-1"
  >
    <div
      className={`size-10 rounded-full flex items-center justify-center text-[11px] font-black shadow-lg border-2 shrink-0
      ${
        team === 'A'
          ? 'bg-primary text-background-dark border-primary/70'
          : 'bg-white text-slate-800 border-white/70'
      }`}
    >
      {player.name.substring(0, 2).toUpperCase()}
    </div>
    <span className="text-[9px] font-bold text-white drop-shadow-md leading-none max-w-[52px] text-center truncate bg-black/50 px-1.5 py-0.5 rounded-full">
      {player.name.split(' ')[0]}
    </span>
  </motion.div>
);

// ─── JOIN SCREEN ─────────────────────────────────────────────────────────────
const JoinScreen: React.FC<{
  roomId: string;
  room: Room;
  onJoin: (role: CaptainRole) => void;
}> = ({ roomId, room, onJoin }) => {
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

  const totalPlayers = room.state.players.length;
  const capA = room.state.captainA;
  const capB = room.state.captainB;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col gap-6"
      >
        <div className="text-center flex flex-col items-center gap-3">
          <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-background-dark">
            <Trophy className="size-7" />
          </div>
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest">Sala</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{roomId}</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {totalPlayers} jugadores · {capA?.name} vs {capB?.name}
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Código de capitán
              </span>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="Ej: A-4X2K"
                className="w-full rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 px-4 py-3 text-center text-xl font-mono font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase"
                autoFocus
              />
            </label>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full h-12 bg-primary text-background-dark font-black rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            >
              Entrar como capitán
            </button>
          </form>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
            <span className="text-xs text-slate-400">o</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </div>

          <button
            onClick={() => onJoin('spectator')}
            className="w-full h-12 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-medium"
          >
            <Eye className="size-4" />
            Ver como espectador
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── DRAFT SCREEN ─────────────────────────────────────────────────────────────
const DraftScreen: React.FC<{
  roomId: string;
  state: DraftState;
  role: CaptainRole;
  onPick: (playerId: string) => void;
}> = ({ state, role, onPick }) => {
  const [search, setSearch] = useState('');

  const canPick = role !== 'spectator' && role === state.currentTurn && !state.isComplete;
  const availablePlayers = state.players.filter(
    (p) => !p.pickedBy && p.name.toLowerCase().includes(search.toLowerCase())
  );
  const teamAPlayers = state.players.filter((p) => p.pickedBy === 'A');
  const teamBPlayers = state.players.filter((p) => p.pickedBy === 'B');

  const roleLabel =
    role === 'spectator'
      ? 'Espectador'
      : `Capitán ${role} — ${role === 'A' ? state.captainA?.name : state.captainB?.name}`;

  return (
    <main className="max-w-[1600px] mx-auto p-4 grid grid-cols-12 gap-6 lg:h-[calc(100vh-100px)]">
      {/* Role badge */}
      <div className="col-span-12">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Eye className="size-3" />
          {roleLabel}
          {role !== 'spectator' && !canPick && !state.isComplete && (
            <span className="text-slate-400"> · Esperando tu turno...</span>
          )}
        </div>
      </div>

      {/* Left: Team A */}
      <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:overflow-hidden">
        <div className="bg-white/5 border border-primary/20 rounded-xl p-4 flex flex-col lg:h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-primary font-bold text-lg uppercase tracking-wider">Equipo A</h3>
              <p className="text-xs text-slate-400">Cap: {state.captainA?.name}</p>
            </div>
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              {teamAPlayers.length}
            </span>
          </div>
          <div className="max-h-64 lg:flex-1 overflow-y-auto space-y-3 pr-2">
            <AnimatePresence>
              {teamAPlayers.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-primary/10 border border-primary/30 p-2 rounded-lg"
                >
                  <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center border border-primary/40">
                    <span className="text-xs font-bold">
                      {p.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[10px] text-primary uppercase font-medium">
                      Pick #{p.pickOrder}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {teamAPlayers.length === 0 && (
              <div className="text-center py-10 opacity-20 italic text-sm">Esperando picks...</div>
            )}
          </div>
        </div>
      </aside>

      {/* Center */}
      <section className="col-span-12 lg:col-span-6 flex flex-col gap-4 order-first lg:order-none">
        <div
          className={
            state.currentTurn === 'A'
              ? 'bg-primary rounded-xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(13,242,89,0.15)] ring-1 ring-white/20'
              : 'bg-white rounded-xl p-4 flex items-center justify-between shadow-xl ring-1 ring-white/20'
          }
        >
          <div className="flex items-center gap-4">
            <div className="size-12 bg-background-dark rounded-lg flex items-center justify-center">
              <UserPlus
                className={state.currentTurn === 'A' ? 'text-primary size-6' : 'text-white size-6'}
              />
            </div>
            <div>
              <h4 className="text-background-dark font-black text-xl leading-none uppercase">
                Turno de Capitán {state.currentTurn}
              </h4>
              <p className="text-background-dark/80 text-sm font-bold mt-1 uppercase tracking-tighter">
                {state.currentTurn === 'A' ? state.captainA?.name : state.captainB?.name} está
                eligiendo
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-background-dark/60 text-[10px] font-bold uppercase">En vivo</span>
            <div className="text-background-dark font-mono text-3xl font-black leading-none">
              <Timer className="inline-block mr-1 size-6" />
              LIVE
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 pitch-pattern rounded-2xl border-4 border-white/20 relative overflow-hidden shadow-2xl">
          {/* Markings */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-xl pointer-events-none z-0" />
          <div className="absolute top-1/2 left-4 right-4 h-px bg-white/20 -translate-y-1/2 pointer-events-none z-0" />
          <div className="absolute top-1/2 left-1/2 size-28 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-44 h-16 border-x-2 border-b-2 border-white/20 pointer-events-none z-0" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-44 h-16 border-x-2 border-t-2 border-white/20 pointer-events-none z-0" />

          {/* Team A — mitad superior */}
          <div className="absolute top-0 left-0 right-0 h-1/2 p-4 flex flex-wrap gap-2 content-start z-10 overflow-hidden">
            <AnimatePresence>
              {teamAPlayers.map((p) => (
                <PitchPlayerCard key={p.id} player={p} team="A" />
              ))}
            </AnimatePresence>
            {teamAPlayers.length === 0 && (
              <p className="w-full text-center text-white/20 text-xs italic mt-4">Equipo A</p>
            )}
          </div>

          {/* Team B — mitad inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 p-4 flex flex-wrap gap-2 content-end z-10 overflow-hidden">
            <AnimatePresence>
              {teamBPlayers.map((p) => (
                <PitchPlayerCard key={p.id} player={p} team="B" />
              ))}
            </AnimatePresence>
            {teamBPlayers.length === 0 && (
              <p className="w-full text-center text-white/20 text-xs italic mb-4">Equipo B</p>
            )}
          </div>
        </div>
      </section>

      {/* Right: Available */}
      <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:overflow-hidden">
        <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col lg:h-full shadow-inner">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <PlusCircle className="text-primary size-5" />
              Disponibles
              {!canPick && !state.isComplete && (
                <span className="ml-auto text-xs text-slate-500 font-normal">Solo lectura</span>
              )}
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
                placeholder="Buscar jugador..."
              />
            </div>
          </div>
          <div className="max-h-96 lg:flex-1 overflow-y-auto p-3 space-y-2">
            {availablePlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => canPick && onPick(p.id)}
                disabled={!canPick}
                className={`w-full group border p-3 rounded-lg transition-all text-left
                  ${
                    canPick
                      ? 'bg-slate-800/50 hover:bg-primary/20 border-white/5 hover:border-primary/50 cursor-pointer'
                      : 'bg-slate-800/30 border-white/5 cursor-default opacity-60'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-full bg-slate-700 flex items-center justify-center ring-2 transition-all
                      ${canPick ? 'ring-white/10 group-hover:ring-primary/50' : 'ring-white/5'}`}
                    >
                      <span className="text-white font-bold text-xs">
                        {p.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold transition-colors ${canPick ? 'group-hover:text-primary' : ''}`}
                      >
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Disponible
                      </p>
                    </div>
                  </div>
                  {canPick && (
                    <PlusCircle className="text-slate-500 group-hover:text-primary transition-all size-5" />
                  )}
                </div>
              </button>
            ))}
            {availablePlayers.length === 0 && !state.isComplete && (
              <div className="text-center py-20 opacity-20 italic">No hay más jugadores</div>
            )}
          </div>
          <div className="p-4 bg-slate-800/30 rounded-b-xl border-t border-white/10">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
              <span>Quedan</span>
              <span className="text-white">{availablePlayers.length} Jugadores</span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
};

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────
const ResultsScreen: React.FC<{ state: DraftState; roomId: string }> = ({ state }) => {
  const [copied, setCopied] = useState(false);
  const teamA = state.players.filter((p) => p.pickedBy === 'A');
  const teamB = state.players.filter((p) => p.pickedBy === 'B');

  const copyToClipboard = () => {
    const text = `⚽ *Draft7 Results*\n\n🟢 *Equipo A (Cap: ${state.captainA?.name})*\n${teamA.map((p) => `- ${p.name}`).join('\n')}\n\n⚪ *Equipo B (Cap: ${state.captainB?.name})*\n${teamB.map((p) => `- ${p.name}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight italic">
            Equipos Listos
          </h1>
          <p className="text-slate-600 dark:text-primary/70 mt-1">¡A la cancha!</p>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-background-dark rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
          {copied ? '¡Copiado!' : 'Copiar Equipos'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden"
        >
          <div className="bg-primary px-6 py-4 flex justify-between items-center">
            <h3 className="text-background-dark text-xl font-black uppercase">Equipo A</h3>
            <span className="bg-background-dark/20 px-3 py-1 rounded-full text-background-dark text-xs font-bold">
              {teamA.length} Jugadores
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-primary/10">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <Star className="size-6 fill-current" />
              </div>
              <div>
                <p className="text-xs uppercase text-primary font-bold tracking-widest">Capitán</p>
                <p className="text-xl font-bold">{state.captainA?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {teamA
                .filter((p) => p.id !== state.captainA?.id)
                .map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/5"
                  >
                    <span className="text-primary font-bold w-4">{i + 1}</span>
                    <span className="font-medium">{p.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-500/5 border border-slate-500/20 rounded-2xl overflow-hidden"
        >
          <div className="bg-slate-300 px-6 py-4 flex justify-between items-center">
            <h3 className="text-background-dark text-xl font-black uppercase">Equipo B</h3>
            <span className="bg-background-dark/20 px-3 py-1 rounded-full text-background-dark text-xs font-bold">
              {teamB.length} Jugadores
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-500/10">
              <div className="size-12 rounded-full bg-slate-500/20 flex items-center justify-center text-slate-400 border border-slate-500/30">
                <Star className="size-6 fill-current" />
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 font-bold tracking-widest">
                  Capitán
                </p>
                <p className="text-xl font-bold">{state.captainB?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {teamB
                .filter((p) => p.id !== state.captainB?.id)
                .map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/10 border border-slate-500/5"
                  >
                    <span className="text-slate-400 font-bold w-4">{i + 1}</span>
                    <span className="font-medium">{p.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── MAIN SALA COMPONENT ──────────────────────────────────────────────────────
export const Sala: React.FC<{ roomId: string }> = ({ roomId }) => {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [state, setState] = useState<DraftState | null>(null);
  const [role, setRole] = useState<CaptainRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load room on mount
  useEffect(() => {
    const storageKey = `draft7_role_${roomId}`;
    const savedRole = sessionStorage.getItem(storageKey) as CaptainRole | null;
    if (savedRole) setRole(savedRole);

    supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setRoom(data as Room);
        setState((data as Room).state);
        setLoading(false);
      });
  }, [roomId]);

  // Subscribe to real-time updates via Broadcast
  useEffect(() => {
    if (!room) return;

    channelRef.current = supabase
      .channel(`room:${roomId}`)
      .on('broadcast', { event: 'state_update' }, ({ payload }) => {
        setState(payload.state as DraftState);
      })
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [room, roomId]);

  const handleJoin = useCallback(
    (selectedRole: CaptainRole) => {
      sessionStorage.setItem(`draft7_role_${roomId}`, selectedRole);
      setRole(selectedRole);
    },
    [roomId]
  );

  const handlePick = useCallback(
    async (playerId: string) => {
      if (!state || !role || role === 'spectator') return;

      const newState = applyPick(state, playerId);
      // Optimistic update local
      setState(newState);

      // Persistir en DB y broadcastear a todos los clientes del canal
      await Promise.all([
        supabase.from('rooms').update({ state: newState }).eq('id', roomId),
        channelRef.current?.send({
          type: 'broadcast',
          event: 'state_update',
          payload: { state: newState },
        }),
      ]);
    },
    [state, role, roomId]
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Cargando sala...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-4">
          <AlertCircle className="size-12 text-red-400" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Sala no encontrada</h2>
          <p className="text-slate-500">
            El código <span className="font-mono font-bold">{roomId}</span> no existe o expiró.
          </p>
          <button
            onClick={() => router.push('/draft7')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-xl font-bold"
          >
            <RefreshCw className="size-4" />
            Crear nueva sala
          </button>
        </div>
      </div>
    );
  }

  if (!state || !room) return null;

  if (!role) {
    return <JoinScreen roomId={roomId} room={room} onJoin={handleJoin} />;
  }

  if (state.isComplete) {
    return <ResultsScreen state={state} roomId={roomId} />;
  }

  return <DraftScreen roomId={roomId} state={state} role={role} onPick={handlePick} />;
};
