import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface GoalAreaRowProps {
  id: string;
  displayName: string;
  emoji: string;
  color: string;
  currentWeekWins: number;
  weeklyTarget: number;
  onLogWin: (goalAreaId: string) => void;
}

export function GoalAreaRow({
  id, displayName, emoji, color, currentWeekWins, weeklyTarget, onLogWin
}: GoalAreaRowProps) {
  const progress = Math.min((currentWeekWins / weeklyTarget) * 100, 100);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-[var(--color-surface-primary)] rounded-[var(--radius-card)] p-4 flex items-center gap-4"
    >
      <span className="text-2xl">{emoji}</span>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--color-text-primary)] truncate">{displayName}</div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          {currentWeekWins}/{weeklyTarget} this week
        </div>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      </div>

      <button
        onClick={() => onLogWin(id)}
        className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: `${color}20`, color }}
        aria-label={`Log win for ${displayName}`}
      >
        <Plus size={20} />
      </button>
    </motion.div>
  );
}
