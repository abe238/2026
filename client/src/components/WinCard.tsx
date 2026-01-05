import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface WinCardProps {
  title: string;
  goalAreaEmoji: string;
  goalAreaColor: string;
  occurredAt: string;
  duration?: number;
  energyBoost?: number;
}

export function WinCard({ title, goalAreaEmoji, goalAreaColor, occurredAt, duration, energyBoost }: WinCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--color-surface-primary)] rounded-[var(--radius-card)] p-4 border-l-4"
      style={{ borderLeftColor: goalAreaColor }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{goalAreaEmoji}</span>
        <div className="flex-1">
          <p className="font-medium text-[var(--color-text-primary)]">{title}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {format(new Date(occurredAt), 'MMM d, h:mm a')}
            {duration && ` • ${duration} min`}
            {energyBoost && ` • ⚡ ${energyBoost}`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
