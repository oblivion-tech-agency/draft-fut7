import React from 'react';
import { cn } from '@/lib/utils';
import { Team } from '@/lib/draft7/pick';

const SIZES = {
  sm: 'size-9 text-[11px]',
  md: 'size-11 text-xs',
  lg: 'size-10 sm:size-14 text-xs sm:text-sm',
  xl: 'size-20 text-2xl',
};

export const PlayerAvatar: React.FC<{
  name: string;
  src?: string;
  team?: Team;
  size?: keyof typeof SIZES;
  className?: string;
}> = ({ name, src, team, size = 'md', className }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full overflow-hidden flex items-center justify-center font-black border-2 shadow-lg',
        SIZES[size],
        team === 'A' && 'bg-primary text-background-dark border-primary',
        team === 'B' && 'bg-white text-slate-900 border-white',
        !team && 'bg-slate-700 text-white border-white/10',
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="absolute inset-0 size-full object-cover" />
      ) : (
        initials || '?'
      )}
    </div>
  );
};
