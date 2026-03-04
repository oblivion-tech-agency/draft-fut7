'use client';

import React, { useState } from 'react';
import { UserPlus, Dices, Copy, Check, Trophy, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Player, DraftState } from '@/types/draft7';

type Step = 'players' | 'captains' | 'success';

interface CreatedRoom {
  id: string;
  captainACode: string;
  captainBCode: string;
  captainAName: string;
  captainBName: string;
}

function generateRoomId(): string {
  const adjectives = ['ROJO', 'VERDE', 'AZUL', 'NEGRO', 'BLANCO', 'DORADO', 'PLATA'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${adj}-${num}`;
}

function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

export const Crear: React.FC = () => {
  const [step, setStep] = useState<Step>('players');
  const [inputText, setInputText] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCapA, setSelectedCapA] = useState<string | null>(null);
  const [selectedCapB, setSelectedCapB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleImport = () => {
    const names = inputText.split('\n').filter((n) => n.trim());
    if (names.length < 4) {
      alert('Por favor ingresa al menos 4 jugadores.');
      return;
    }
    const parsed: Player[] = names.map((name, i) => ({
      id: `p-${i}-${Date.now()}`,
      name: name.trim(),
    }));
    setPlayers(parsed);
    setStep('captains');
  };

  const randomCaptains = () => {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setSelectedCapA(shuffled[0].id);
    setSelectedCapB(shuffled[1].id);
  };

  const handleCrearSala = async () => {
    if (!selectedCapA || !selectedCapB) return;
    setLoading(true);
    setError(null);

    const capA = players.find((p) => p.id === selectedCapA)!;
    const capB = players.find((p) => p.id === selectedCapB)!;

    const roomId = generateRoomId();
    const captainACode = generateCode('A');
    const captainBCode = generateCode('B');

    const initialState: DraftState = {
      players: players.map((p) => {
        if (p.id === capA.id) return { ...p, pickedBy: 'A', pickOrder: 0 };
        if (p.id === capB.id) return { ...p, pickedBy: 'B', pickOrder: 0 };
        return p;
      }),
      captainA: { ...capA, pickedBy: 'A', pickOrder: 0 },
      captainB: { ...capB, pickedBy: 'B', pickOrder: 0 },
      currentTurn: 'A',
      turnPhase: 1,
      isComplete: false,
    };

    const { error: supabaseError } = await supabase.from('rooms').insert({
      id: roomId,
      state: initialState,
      captain_a_code: captainACode,
      captain_b_code: captainBCode,
    });

    if (supabaseError) {
      setError('Error al crear la sala. Verificá tu conexión.');
      setLoading(false);
      return;
    }

    setCreatedRoom({
      id: roomId,
      captainACode,
      captainBCode,
      captainAName: capA.name,
      captainBName: capB.name,
    });
    setStep('success');
    setLoading(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const roomUrl = createdRoom
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/draft7/sala/${createdRoom.id}`
    : '';

  if (step === 'success' && createdRoom) {
    return (
      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="text-center flex flex-col items-center gap-3">
            <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-background-dark">
              <Trophy className="size-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ¡Sala creada!
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Compartí el link y los códigos con cada capitán
            </p>
          </div>

          {/* Room link */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Link de la sala
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white dark:bg-white/5 border border-primary/20 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                {roomUrl}
              </div>
              <button
                onClick={() => copyToClipboard(roomUrl, 'link')}
                className="shrink-0 flex items-center gap-2 px-4 py-3 bg-primary text-background-dark rounded-xl font-bold text-sm transition-all hover:brightness-110"
              >
                {copied === 'link' ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied === 'link' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <a
              href={roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary text-sm font-medium hover:underline"
            >
              <ExternalLink className="size-4" />
              Abrir sala
            </a>
          </div>

          {/* Captain codes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                  Capitán Equipo A
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {createdRoom.captainAName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 font-mono text-xl font-black tracking-widest text-center text-slate-900 dark:text-white">
                  {createdRoom.captainACode}
                </div>
                <button
                  onClick={() => copyToClipboard(createdRoom.captainACode, 'capA')}
                  className="shrink-0 p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all"
                >
                  {copied === 'capA' ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Mandá este código en privado a {createdRoom.captainAName}
              </p>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Capitán Equipo B
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {createdRoom.captainBName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 font-mono text-xl font-black tracking-widest text-center text-slate-900 dark:text-white">
                  {createdRoom.captainBCode}
                </div>
                <button
                  onClick={() => copyToClipboard(createdRoom.captainBCode, 'capB')}
                  className="shrink-0 p-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                >
                  {copied === 'capB' ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Mandá este código en privado a {createdRoom.captainBName}
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            El link es público — cualquiera puede ver el draft como espectador.
            <br />
            Solo quien tenga el código puede pickear.
          </p>
        </motion.div>
      </div>
    );
  }

  if (step === 'players') {
    return (
      <div className="container mx-auto px-6 py-10 max-w-6xl">
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
              Paso 1 de 2 — Ingresá los nombres (uno por línea)
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
                <UserPlus />
                Continuar a Capitanes
              </button>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">
                  Vista Previa ({inputText.split('\n').filter((n) => n.trim()).length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {inputText
                  .split('\n')
                  .filter((n) => n.trim())
                  .map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5"
                    >
                      <div className="size-10 rounded-full bg-slate-200 dark:bg-primary/20 flex items-center justify-center text-slate-600 dark:text-primary font-bold text-xs">
                        {name.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{name}</p>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight uppercase italic">
              Selección de Capitanes
            </h1>
            <p className="text-slate-600 dark:text-primary/70 text-lg mt-1">Paso 2 de 2</p>
          </div>
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
            className={`bg-white dark:bg-primary/5 border-2 rounded-2xl p-8 shadow-xl transition-all ${selectedCapA ? 'border-primary shadow-primary/10' : 'border-slate-200 dark:border-white/10'}`}
          >
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Capitán Equipo A
            </p>
            <select
              value={selectedCapA || ''}
              onChange={(e) => setSelectedCapA(e.target.value)}
              className="w-full bg-transparent border-none text-2xl font-black focus:ring-0 cursor-pointer text-slate-900 dark:text-white"
            >
              <option value="" disabled>
                Seleccionar...
              </option>
              {players.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === selectedCapB}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`bg-white dark:bg-primary/5 border-2 rounded-2xl p-8 shadow-xl transition-all ${selectedCapB ? 'border-primary shadow-primary/10' : 'border-slate-200 dark:border-white/10'}`}
          >
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Capitán Equipo B
            </p>
            <select
              value={selectedCapB || ''}
              onChange={(e) => setSelectedCapB(e.target.value)}
              className="w-full bg-transparent border-none text-2xl font-black focus:ring-0 cursor-pointer text-slate-900 dark:text-white"
            >
              <option value="" disabled>
                Seleccionar...
              </option>
              {players.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === selectedCapA}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setStep('players')}
            className="px-8 py-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-900 dark:text-white"
          >
            Volver
          </button>
          <button
            disabled={!selectedCapA || !selectedCapB || loading}
            onClick={handleCrearSala}
            className="px-12 py-4 bg-primary text-background-dark font-black rounded-xl text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
          >
            {loading ? 'Creando sala...' : 'Crear Sala →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
