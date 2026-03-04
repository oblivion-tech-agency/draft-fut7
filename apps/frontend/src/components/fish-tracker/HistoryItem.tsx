import React from 'react';
import { Transaction } from '@/types/fish-tracker';

interface HistoryItemProps {
  transaction: Transaction;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ transaction }) => {
  const isNegative = transaction.amount < 0;

  const getIcon = () => {
    if (transaction.name.includes('Operacion')) return 'calculate';
    if (transaction.type === 'Sell') return 'trending_up';
    return 'shopping_cart';
  };

  const getIconColor = () => {
    if (transaction.name.includes('Operacion')) return 'text-primary bg-primary/10';
    if (transaction.type === 'Sell') return 'text-green-500 bg-green-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-button-dark/40 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center ${getIconColor()}`}>
          <span className="material-symbols-outlined text-xl">{getIcon()}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">{transaction.name}</p>
          <p className="text-[10px] text-[#9dabb9] font-medium">
            Hoy, {formatTime(transaction.timestamp)}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <p className={`text-sm font-bold ${isNegative ? 'text-red-400' : 'text-white'}`}>
            {transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
          {transaction.quantity && (
            <p className="text-[10px] text-slate-500 font-bold">
              {transaction.quantity} {transaction.unitPrice ? `x ${transaction.unitPrice}` : 'kg'}
            </p>
          )}
        </div>
        <span
          className={`material-symbols-outlined text-lg ${transaction.synced ? 'text-green-500' : 'text-primary'}`}
        >
          {transaction.synced ? 'cloud_done' : 'cloud_sync'}
        </span>
      </div>
    </div>
  );
};

export default HistoryItem;
