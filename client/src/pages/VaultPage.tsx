import { useWinsVault } from '../hooks/useWins';
import { WinCard } from '../components/WinCard';
import { motion } from 'framer-motion';
import { format, parseISO, startOfWeek, subWeeks } from 'date-fns';

interface Win {
  id: string;
  goalAreaId: string;
  title: string;
  occurredAt: string;
  duration?: number;
  energyBoost?: number;
}

const GOAL_AREA_META: Record<string, { emoji: string; color: string; displayName: string }> = {
  physical_health: { emoji: '💪', color: '#10B981', displayName: 'Physical Health' },
  mental_health: { emoji: '🧠', color: '#8B5CF6', displayName: 'Mental Health' },
  family_ian: { emoji: '👦', color: '#F59E0B', displayName: 'Family: Ian' },
  family_wife: { emoji: '❤️', color: '#EC4899', displayName: 'Family: Wife' },
  work_strategic: { emoji: '🎯', color: '#3B82F6', displayName: 'Work: Strategic' },
  work_leadership: { emoji: '👥', color: '#6366F1', displayName: 'Work: Leadership' },
  content_newsletter: { emoji: '✍️', color: '#14B8A6', displayName: 'Content: Newsletter' },
};

export function VaultPage() {
  const { data: wins, isLoading } = useWinsVault() as { data: Win[] | undefined; isLoading: boolean };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--color-text-secondary)]">Loading...</div>
      </div>
    );
  }

  const groupByWeek = (wins: Win[]) => {
    const grouped: Record<string, Win[]> = {};
    const now = new Date();

    wins?.forEach((win) => {
      const date = parseISO(win.occurredAt);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(win);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([weekStart, wins]) => ({
        weekStart,
        label: getWeekLabel(parseISO(weekStart), now),
        wins,
      }));
  };

  const getWeekLabel = (weekStart: Date, now: Date) => {
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    if (weekStart.getTime() === thisWeekStart.getTime()) return 'This Week';
    if (weekStart.getTime() === subWeeks(thisWeekStart, 1).getTime()) return 'Last Week';
    return format(weekStart, 'MMM d');
  };

  const grouped = groupByWeek(wins || []);
  const totalWins = wins?.length || 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Your Win Vault 🏆
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          {totalWins} wins collected
        </p>
      </header>

      {totalWins === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-4xl mb-4">🌟</p>
          <p className="text-[var(--color-text-secondary)]">
            Your vault is empty. Start collecting wins!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ weekStart, label, wins }) => (
            <section key={weekStart}>
              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                {label} · {wins.length} wins
              </h2>
              <div className="space-y-3">
                {wins.map((win) => {
                  const meta = GOAL_AREA_META[win.goalAreaId] || { emoji: '🏆', color: '#6366F1', displayName: 'Other' };
                  return (
                    <WinCard
                      key={win.id}
                      title={win.title}
                      goalAreaEmoji={meta.emoji}
                      goalAreaColor={meta.color}
                      occurredAt={win.occurredAt}
                      duration={win.duration}
                      energyBoost={win.energyBoost}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
