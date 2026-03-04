'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-20 py-4 bg-background-light/40 dark:bg-background-dark/40 backdrop-blur-md sticky top-0 z-50">
      <Link href="/draft7" className="flex items-center gap-3">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
          <Trophy className="size-5 font-bold" />
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-black leading-tight tracking-tight">
          Draft7
        </h2>
      </Link>
      <div className="flex flex-1 justify-end gap-4 md:gap-10">
        <nav className="hidden md:flex items-center gap-8">
          <a
            className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
            href="#"
          >
            Cómo funciona
          </a>
          <a
            className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
            href="#"
          >
            Historial Local
          </a>
          <a
            className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
            href="#"
          >
            Soporte
          </a>
        </nav>
        <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-background-dark text-sm font-bold transition-all">
          <span className="truncate">Iniciar Sesión</span>
        </button>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-primary/5 py-10 px-6 md:px-20 text-center md:text-left bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          <span className="text-slate-900 dark:text-slate-100 font-bold">Draft7</span>
          <span className="text-slate-500 text-sm ml-2">
            © 2024. Todos los derechos reservados.
          </span>
        </div>
        <div className="flex gap-6">
          <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">
            Privacidad
          </a>
          <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">
            Términos
          </a>
          <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
