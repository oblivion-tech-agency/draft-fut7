import React from 'react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  const keys = [
    { label: '7', style: 'bg-button-dark' },
    { label: '8', style: 'bg-button-dark' },
    { label: '9', style: 'bg-button-dark' },
    { label: 'backspace', icon: 'backspace', style: 'bg-orange-500/10 text-orange-500' },
    { label: '4', style: 'bg-button-dark' },
    { label: '5', style: 'bg-button-dark' },
    { label: '6', style: 'bg-button-dark' },
    { label: '×', style: 'bg-button-dark text-primary font-bold text-2xl' },
    { label: '1', style: 'bg-button-dark' },
    { label: '2', style: 'bg-button-dark' },
    { label: '3', style: 'bg-button-dark' },
    { label: '=', style: 'bg-primary text-white row-span-2 text-3xl shadow-lg shadow-primary/20' },
    { label: '0', style: 'bg-button-dark' },
    { label: '.', style: 'bg-button-dark' },
    { label: 'C', style: 'bg-primary/10 text-primary' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {keys.map((key, idx) => (
        <button
          key={idx}
          onClick={() => onKeyPress(key.label)}
          className={`h-14 rounded-xl flex items-center justify-center text-xl font-bold hover:brightness-125 active:scale-95 transition-all ${key.style}`}
        >
          {key.icon ? <span className="material-symbols-outlined">{key.icon}</span> : key.label}
        </button>
      ))}
    </div>
  );
};

export default Keypad;
