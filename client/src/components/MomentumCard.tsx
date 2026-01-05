import { motion } from 'framer-motion';

interface MomentumCardProps {
  score: number;
  level: { label: string; emoji: string; color: string };
  trend?: 'up' | 'stable' | 'down';
}

export function MomentumCard({ score, level, trend: _trend = 'stable' }: MomentumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface-primary)] rounded-[var(--radius-card)] p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Your Momentum</h2>
        <span className="text-3xl">{level.emoji}</span>
      </div>

      <div className="flex items-end gap-4">
        <div className="text-5xl font-bold" style={{ color: level.color }}>
          {score}
        </div>
        <div className="pb-2">
          <div className="text-sm text-[var(--color-text-secondary)]">out of 100</div>
          <div className="font-medium" style={{ color: level.color }}>{level.label}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: level.color }}
        />
      </div>
    </motion.div>
  );
}
