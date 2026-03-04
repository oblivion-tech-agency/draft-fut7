'use client';

import React from 'react';
import Link from 'next/link';
import { Users, PlusCircle, CheckCircle, Database, UserCheck, Repeat, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export const Landing: React.FC = () => {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden pitch-bg min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
        <div className="container mx-auto px-6 py-16 md:py-28 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Users className="size-4" />
            Equipos equilibrados al instante
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-900 dark:text-slate-100 text-4xl md:text-7xl font-black leading-tight tracking-tight max-w-4xl mb-6"
          >
            Arma tus equipos de <br />
            <span className="text-primary font-black italic">Fútbol 7</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal max-w-2xl mb-10 leading-relaxed"
          >
            Organiza tu partido sin discusiones. Utiliza nuestro sistema especializado de turnos
            1-2-2 para equilibrar la cancha entre dos capitanes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md"
          >
            <Link
              href="/draft7/crear"
              className="flex-1 flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-background-dark text-lg font-black shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-1"
            >
              <PlusCircle className="mr-2 size-6" />
              Crear Sala
            </Link>
          </motion.div>

          <div className="mt-12 flex items-center gap-6 text-slate-500 dark:text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-1">
              <CheckCircle className="size-4 text-primary" />
              Sin registros
            </div>
            <div className="flex items-center gap-1">
              <Database className="size-4 text-primary" />
              Datos locales (Offline)
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 border-t border-primary/5">
        <div className="flex flex-col gap-4 mb-12 text-center items-center">
          <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-black tracking-tight italic">
            El Sistema de Turnos 1-2-2
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl">
            Diseñado específicamente para el fútbol amateur para eliminar la ventaja injusta del
            primer pick.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<UserCheck className="size-6" />}
            title="Selección de Capitanes"
            description="Define quiénes lideran. El azar o la elección manual determinan quién comienza el proceso de selección."
          />
          <FeatureCard
            icon={<Repeat className="size-6" />}
            title="Dinámica 1-2-2"
            highlight
            description="El Capitán A elige 1 jugador, luego el Capitán B elige 2, y luego el Capitán A elige 2 más. Se repite hasta completar los 14 jugadores."
          />
          <FeatureCard
            icon={<Save className="size-6" />}
            title="Guardado Automático"
            description="Toda la información se guarda en el almacenamiento local de tu navegador. Consulta tus plantillas pasadas cuando quieras."
          />
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="relative rounded-[2rem] bg-slate-900 dark:bg-primary/5 overflow-hidden px-8 py-16 text-center border border-primary/20">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-white dark:text-slate-100 text-3xl md:text-4xl font-black mb-4 tracking-tight italic">
              ¿Listo para armar el partido?
            </h2>
            <p className="text-slate-400 dark:text-slate-400 text-lg mb-8 max-w-xl">
              Entra ahora a la sala de selección y empieza a elegir a tus cracks para el juego de
              hoy.
            </p>
            <Link
              href="/draft7/crear"
              className="flex min-w-[240px] cursor-pointer items-center justify-center rounded-xl h-12 px-10 bg-primary text-background-dark text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
            >
              Comenzar el Draft ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      'flex flex-col gap-5 rounded-2xl border border-primary/10 bg-white/40 dark:bg-white/5 p-8 backdrop-blur-sm transition-all',
      highlight && 'ring-1 ring-primary/30 scale-105 md:scale-110 z-10 bg-primary/5'
    )}
  >
    <div
      className={cn(
        'size-12 rounded-xl flex items-center justify-center',
        highlight ? 'bg-primary text-background-dark' : 'bg-primary/20 text-primary'
      )}
    >
      {icon}
    </div>
    <div>
      <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);
