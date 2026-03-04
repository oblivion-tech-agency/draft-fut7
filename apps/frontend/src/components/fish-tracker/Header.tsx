import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-background-dark">
      <div className="flex items-center gap-3">
        <div className="text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl font-bold">set_meal</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight">Control de Pescados</h2>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-button-dark text-white hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">sync</span>
        </button>
        <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-button-dark text-white hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
