'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDraft } from '@/components/draft7/DraftContext';
import { Dices, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export const Setup: React.FC = () => {
  const { setPlayers, setCaptains, state } = useDraft();
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleImport = () => {
    const names = inputText.split('\n').filter((n) => n.trim());
    if (names.length < 4) {
      alert('Por favor ingresa al menos 4 jugadores (idealmente 14 para Fútbol 7)');
      return;
    }
    setPlayers(names);
    setStep(2);
  };

  const handleStartDraft = (capAId: string, capBId: string) => {
    const capA = state.players.find((p) => p.id === capAId)!;
    const capB = state.players.find((p) => p.id === capBId)!;
    setCaptains(capA, capB);
    router.push('/draft7/draft');
  };

  const [selectedCapA, setSelectedCapA] = useState<string | null>(null);
  const [selectedCapB, setSelectedCapB] = useState<string | null>(null);

  const randomCaptains = () => {
    const shuffled = [...state.players].sort(() => 0.5 - Math.random());
    setSelectedCapA(shuffled[0].id);
    setSelectedCapB(shuffled[1].id);
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      {step === 1 ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-10"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight uppercase italic">
              Importar Jugadores
            </h1>
            <p className="text-slate-600 dark:text-primary/70 text-lg">
              Pega los nombres aquí (uno por línea) para comenzar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <label className="flex flex-col w-full">
                <span className="text-slate-900 dark:text-white text-base font-semibold pb-2">
                  Lista de Jugadores
                </span>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full min-h-[300px] rounded-xl border border-slate-300 dark:border-primary/30 bg-white dark:bg-primary/5 p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-primary/30 font-sans text-sm leading-relaxed"
                  placeholder="Pega los nombres aquí (uno por línea)..."
                />
              </label>
              <button
                onClick={handleImport}
                className="w-full flex items-center justify-center gap-2 rounded-xl h-14 bg-primary text-background-dark text-lg font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                <UserPlus className="font-bold" />
                <span>Continuar a Capitanes</span>
              </button>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">
                  Vista Previa ({inputText.split('\n').filter((n) => n.trim()).length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-primary/50 italic">
                  Se detectarán automáticamente
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {inputText
                  .split('\n')
                  .filter((n) => n.trim())
                  .map((name, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 dark:bg-primary/20 flex items-center justify-center text-slate-600 dark:text-primary font-bold overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all">
                          <span className="text-xs">{name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-primary/40 uppercase tracking-widest font-semibold">
                            Jugador
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                {inputText.trim() === '' && (
                  <div className="col-span-full py-20 text-center opacity-30 italic">
                    Los jugadores aparecerán aquí...
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-10"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight uppercase italic">
              Selección de Capitanes
            </h2>
            <button
              onClick={randomCaptains}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
            >
              <Dices className="size-4" />
              Aleatorio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className={`relative group bg-white dark:bg-primary/5 border-2 rounded-2xl p-8 shadow-xl transition-all ${selectedCapA ? 'border-primary shadow-primary/10' : 'border-white/10'}`}
            >
              <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Capitán Equipo A
              </p>
              <select
                value={selectedCapA || ''}
                onChange={(e) => setSelectedCapA(e.target.value)}
                className="w-full bg-transparent border-none text-2xl font-black focus:ring-0 cursor-pointer"
              >
                <option value="" disabled>
                  Seleccionar...
                </option>
                {state.players.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === selectedCapB}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`relative group bg-white dark:bg-primary/5 border-2 rounded-2xl p-8 shadow-xl transition-all ${selectedCapB ? 'border-primary shadow-primary/10' : 'border-white/10'}`}
            >
              <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Capitán Equipo B
              </p>
              <select
                value={selectedCapB || ''}
                onChange={(e) => setSelectedCapB(e.target.value)}
                className="w-full bg-transparent border-none text-2xl font-black focus:ring-0 cursor-pointer"
              >
                <option value="" disabled>
                  Seleccionar...
                </option>
                {state.players.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === selectedCapA}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep(1)}
              className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
            >
              Volver
            </button>
            <button
              disabled={!selectedCapA || !selectedCapB}
              onClick={() => handleStartDraft(selectedCapA!, selectedCapB!)}
              className="px-12 py-4 bg-primary text-background-dark font-black rounded-xl text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            >
              Comenzar Draft
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
