'use client';

import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '@/types/fish-tracker';
import Header from './Header';
import Keypad from './Keypad';
import HistoryItem from './HistoryItem';

const INITIAL_HISTORY: Transaction[] = [
  {
    id: '1',
    name: 'Operacion Libre',
    type: 'Sell',
    amount: 2500.0,
    quantity: 25,
    unitPrice: 100,
    timestamp: new Date(),
    synced: true,
  },
  {
    id: '2',
    name: 'Venta Merluza',
    type: 'Sell',
    amount: 420.0,
    quantity: 14.0,
    timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
    synced: true,
  },
  {
    id: '3',
    name: 'Compra Pulpo',
    type: 'Buy',
    amount: -85.4,
    quantity: 2.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    synced: false,
  },
];

const FishTrackerApp: React.FC = () => {
  const [transactionType, setTransactionType] = useState<TransactionType>('Sell');
  const [category, setCategory] = useState<Category>('Modo Libre');
  const [history, setHistory] = useState<Transaction[]>(INITIAL_HISTORY);

  // Calculator State
  const [input, setInput] = useState<string>('2500');
  const [multiplier, setMultiplier] = useState<number | null>(null);

  const displayAmount = useMemo(() => {
    const val = parseFloat(input || '0');
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }, [input]);

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setInput('0');
      setMultiplier(null);
    } else if (key === 'backspace') {
      setInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (key === '×') {
      if (input !== '0') {
        setMultiplier(parseFloat(input));
        setInput('0');
      }
    } else if (key === '=') {
      if (multiplier !== null) {
        const result = multiplier * parseFloat(input);
        setInput(result.toString());
        setMultiplier(null);
      }
    } else if (key === '.') {
      if (!input.includes('.')) {
        setInput((prev) => prev + '.');
      }
    } else {
      setInput((prev) => (prev === '0' ? key : prev + key));
    }
  };

  const handleSave = () => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      name:
        category === 'Modo Libre'
          ? 'Operacion Libre'
          : `${transactionType === 'Buy' ? 'Compra' : 'Venta'} ${category}`,
      type: transactionType,
      amount: parseFloat(input) * (transactionType === 'Buy' ? -1 : 1),
      quantity: multiplier || undefined,
      unitPrice: multiplier ? parseFloat(input) / multiplier : undefined,
      timestamp: new Date(),
      synced: false,
    };
    setHistory([newTransaction, ...history]);
    setInput('0');
    setMultiplier(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-sans max-w-[480px] mx-auto shadow-2xl border-x border-slate-800">
      <Header />

      {/* Hero Display */}
      <div className="flex flex-col items-center justify-center py-8 px-6 bg-card-dark">
        <p className="text-[#9dabb9] text-[10px] font-bold uppercase tracking-widest mb-1">
          {category}: Operacion Libre
        </p>
        <h1 className="text-white tracking-tight text-[44px] font-bold leading-none">
          {displayAmount}
        </h1>
        <div className="mt-2 flex items-center gap-2 text-primary font-bold text-sm h-6">
          {multiplier !== null && (
            <>
              <span>{multiplier}</span>
              <span className="text-slate-500 font-normal">×</span>
              <span>{input}</span>
            </>
          )}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Toggle Buy/Sell */}
        <div className="flex bg-button-dark p-1 rounded-xl">
          <button
            onClick={() => setTransactionType('Buy')}
            className={`flex flex-1 h-10 items-center justify-center rounded-lg text-sm font-bold transition-all ${
              transactionType === 'Buy' ? 'bg-card-dark shadow-sm text-primary' : 'text-[#9dabb9]'
            }`}
          >
            Comprar
          </button>
          <button
            onClick={() => setTransactionType('Sell')}
            className={`flex flex-1 h-10 items-center justify-center rounded-lg text-sm font-bold transition-all ${
              transactionType === 'Sell' ? 'bg-card-dark shadow-sm text-primary' : 'text-[#9dabb9]'
            }`}
          >
            Vender
          </button>
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {(
            [
              'Modo Libre',
              'Langostino',
              'Merluza',
              'Centolla',
              'Pulpo',
              'Pez Grande',
              'Pez Chico',
            ] as Category[]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all text-sm font-bold border-2 ${
                category === cat
                  ? 'border-primary text-primary bg-primary/10'
                  : 'bg-button-dark border-transparent text-[#9dabb9]'
              }`}
            >
              {cat === 'Modo Libre' && (
                <span className="material-symbols-outlined text-sm">calculate</span>
              )}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keypad Section */}
      <div className="px-6 py-4">
        <Keypad onKeyPress={handleKeyPress} />
      </div>

      {/* History Section */}
      <div className="flex-1 px-6 pb-20 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9dabb9]">
            Historial Reciente
          </h3>
          <span className="text-xs text-primary font-bold cursor-pointer hover:opacity-80 transition-opacity">
            Ver Todo
          </span>
        </div>
        <div className="space-y-2 overflow-y-auto pr-1 no-scrollbar flex-1">
          {history.map((tx) => (
            <HistoryItem key={tx.id} transaction={tx} />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 left-0 right-0 px-6 py-4 border-t border-slate-800 bg-card-dark flex gap-4">
        <button
          className="flex-1 py-4 bg-button-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
          onClick={() => alert('Imprimiendo ticket...')}
        >
          <span className="material-symbols-outlined text-xl">print</span>
          Imprimir
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl">save</span>
          Guardar
        </button>
      </div>
    </div>
  );
};

export default FishTrackerApp;
