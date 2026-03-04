'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/components/draft7/DraftContext';
import { Copy, RefreshCw, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const Results: React.FC = () => {
  const { state, resetDraft } = useDraft();
  const router = useRouter();

  const teamA = state.players.filter((p) => p.pickedBy === 'A');
  const teamB = state.players.filter((p) => p.pickedBy === 'B');

  const copyToClipboard = () => {
    const text = `⚽ *Draft7 Results*\n\n🟢 *Equipo A (Cap: ${state.captainA?.name})*\n${teamA.map((p) => `- ${p.name}`).join('\n')}\n\n⚪ *Equipo B (Cap: ${state.captainB?.name})*\n${teamB.map((p) => `- ${p.name}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles!');
  };

  const handleReset = () => {
    resetDraft();
    router.push('/draft7');
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight italic">
            Equipos Listos
          </h1>
          <p className="text-slate-600 dark:text-primary/70 text-base font-normal">
            La formación está confirmada. ¡A la cancha!
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-background-dark rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <Copy className="size-5" />
          <span>Copiar Equipos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Team A Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden"
        >
          <div className="bg-primary px-6 py-4 flex justify-between items-center">
            <h3 className="text-background-dark text-xl font-black uppercase tracking-wider">
              Equipo A
            </h3>
            <span className="bg-background-dark/20 px-3 py-1 rounded-full text-background-dark text-xs font-bold">
              {teamA.length} Jugadores
            </span>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-primary/10">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                  <Star className="size-6 fill-current" />
                </div>
                <div>
                  <p className="text-xs uppercase text-primary font-bold tracking-widest">
                    Capitán
                  </p>
                  <p className="text-xl font-bold">{state.captainA?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-2">
                {teamA
                  .filter((p) => p.id !== state.captainA?.id)
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-bold w-4">{i + 1}</span>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team B Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-500/5 border border-slate-500/20 rounded-2xl overflow-hidden"
        >
          <div className="bg-slate-300 px-6 py-4 flex justify-between items-center">
            <h3 className="text-background-dark text-xl font-black uppercase tracking-wider">
              Equipo B
            </h3>
            <span className="bg-background-dark/20 px-3 py-1 rounded-full text-background-dark text-xs font-bold">
              {teamB.length} Jugadores
            </span>
          </div>
          <div className="p-6">
            <div className="space-y-4">
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
              <div className="grid grid-cols-1 gap-3 pt-2">
                {teamB
                  .filter((p) => p.id !== state.captainB?.id)
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-500/10 border border-slate-500/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-bold w-4">{i + 1}</span>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleReset}
          className="w-full md:w-auto px-12 py-4 bg-primary text-background-dark font-black rounded-xl text-lg hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCw className="size-5" />
          Empezar Nuevo Draft
        </button>
        <p className="text-slate-500 text-sm">
          Los resultados se guardan automáticamente en el historial local.
        </p>
      </div>
    </div>
  );
};
