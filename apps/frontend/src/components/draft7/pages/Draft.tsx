'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/components/draft7/DraftContext';
import { Search, PlusCircle, Timer, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Draft: React.FC = () => {
  const { state, pickPlayer } = useDraft();
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (state.isComplete) {
      const timeout = setTimeout(() => router.push('/draft7/results'), 500);
      return () => clearTimeout(timeout);
    }
  }, [state.isComplete, router]);

  const availablePlayers = state.players.filter(
    (p) => !p.pickedBy && p.name.toLowerCase().includes(search.toLowerCase())
  );
  const teamAPlayers = state.players.filter((p) => p.pickedBy === 'A');
  const teamBPlayers = state.players.filter((p) => p.pickedBy === 'B');

  return (
    <main className="max-w-[1600px] mx-auto p-4 grid grid-cols-12 gap-6 lg:h-[calc(100vh-100px)]">
      {/* Left Sidebar: Team A */}
      <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:overflow-hidden">
        <div className="bg-white/5 border border-primary/20 rounded-xl p-4 flex flex-col lg:h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-primary font-bold text-lg uppercase tracking-wider">Equipo A</h3>
              <p className="text-xs text-slate-400">Capitán: {state.captainA?.name}</p>
            </div>
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              {teamAPlayers.length} Elegidos
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
                  <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-primary/40 shadow-sm">
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

      {/* Center: Pitch & Turn Info */}
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
            <span className="text-background-dark/60 text-[10px] font-bold uppercase">
              Draft en curso
            </span>
            <div className="text-background-dark font-mono text-3xl font-black leading-none">
              <Timer className="inline-block mr-1 size-6" />
              LIVE
            </div>
          </div>
        </div>

        <div className="hidden lg:block flex-1 pitch-pattern rounded-2xl border-4 border-white/20 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-4 border-2 border-white/30 rounded-xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 size-36 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-24 border-x-2 border-b-2 border-white/30 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-24 border-x-2 border-t-2 border-white/30 pointer-events-none"></div>

          <div className="absolute inset-0 p-8 flex items-center justify-center">
            <div className="text-white/10 text-6xl font-black italic select-none">DRAFT7</div>
          </div>
        </div>
      </section>

      {/* Right Sidebar: Available Players */}
      <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:overflow-hidden">
        <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col lg:h-full shadow-inner">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <PlusCircle className="text-primary size-5" />
              Disponibles
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
                placeholder="Buscar jugador..."
                type="text"
              />
            </div>
          </div>
          <div className="max-h-96 lg:flex-1 overflow-y-auto p-3 space-y-2">
            {availablePlayers.map((p) => (
              <button
                key={p.id}
                onClick={() => pickPlayer(p.id)}
                className="w-full group bg-slate-800/50 hover:bg-primary/20 border border-white/5 hover:border-primary/50 p-3 rounded-lg cursor-pointer transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-primary/50 transition-all">
                      <span className="text-white font-bold text-xs">
                        {p.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Disponible
                      </p>
                    </div>
                  </div>
                  <PlusCircle className="text-slate-500 group-hover:text-primary group-active:scale-90 transition-all size-5" />
                </div>
              </button>
            ))}
            {availablePlayers.length === 0 && (
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
