'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Crown, X, Check } from 'lucide-react';

interface StudentCardProps {
  name: string;
  isRevealed?: boolean;
  isKing?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  teamColor?: 'blue' | 'amber';
  showCrown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-purple-500 to-violet-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-amber-500 to-yellow-600',
    'from-fuchsia-500 to-purple-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

export default function StudentCard({
  name,
  isRevealed = false,
  isKing = false,
  isSelected = false,
  isDisabled = false,
  onClick,
  teamColor = 'blue',
  showCrown = false,
  size = 'md',
}: StudentCardProps) {
  const sizeClasses = {
    sm: 'px-4 py-2.5 text-base gap-2.5',
    md: 'px-5 py-3.5 text-lg gap-3',
    lg: 'px-6 py-4 text-xl gap-3',
  };

  const avatarSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const colorClasses = {
    blue: {
      bg: 'bg-blue-900/30 border-blue-700/30 hover:bg-blue-800/40 hover:border-blue-600/50',
      selected: 'bg-blue-600/40 border-blue-400/60 ring-2 ring-blue-400/50 glow-blue',
      revealed: 'bg-white/[0.02] border-white/5',
    },
    amber: {
      bg: 'bg-amber-900/30 border-amber-700/30 hover:bg-amber-800/40 hover:border-amber-600/50',
      selected: 'bg-amber-600/40 border-amber-400/60 ring-2 ring-amber-400/50 glow-amber',
      revealed: 'bg-white/[0.02] border-white/5',
    },
  };

  const colors = colorClasses[teamColor];
  const avatarGradient = getAvatarColor(name);
  const initial = name.charAt(0);

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled || isRevealed}
      className={cn(
        'relative flex items-center rounded-xl border font-semibold transition-all cursor-pointer',
        sizeClasses[size],
        isRevealed
          ? colors.revealed
          : isSelected
            ? colors.selected
            : colors.bg,
        (isDisabled || isRevealed) && 'cursor-not-allowed opacity-50'
      )}
      whileHover={!isDisabled && !isRevealed ? { scale: 1.05, y: -2 } : {}}
      whileTap={!isDisabled && !isRevealed ? { scale: 0.95 } : {}}
      layout
    >
      {/* Avatar */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
          avatarSizes[size],
          isRevealed ? 'opacity-30' : '',
          `bg-gradient-to-br ${avatarGradient}`
        )}
      >
        {initial}
      </div>

      <span className={cn(
        'text-white font-medium',
        isRevealed && 'text-gray-600 line-through'
      )}>
        {name}
      </span>

      {showCrown && (
        <motion.div
          className="absolute -top-3 -right-2"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Crown
            className="w-6 h-6 text-yellow-400 fill-yellow-400"
            style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.6))' }}
          />
        </motion.div>
      )}

      {isRevealed && !isKing && (
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500/80 rounded-full p-0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ boxShadow: '0 0 6px rgba(239,68,68,0.4)' }}
        >
          <X className="w-3 h-3 text-white" />
        </motion.div>
      )}

      {isKing && isRevealed && (
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-500/90 rounded-full p-0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ boxShadow: '0 0 8px rgba(250,204,21,0.5)' }}
        >
          <Crown className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {isSelected && !showCrown && (
        <motion.div
          className="absolute -top-2 -left-2 bg-green-500 rounded-full p-0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ boxShadow: '0 0 6px rgba(34,197,94,0.4)' }}
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}
