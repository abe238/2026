import { MomentumCard } from '../components/MomentumCard';
import { GoalAreaRow } from '../components/GoalAreaRow';
import { WinCard } from '../components/WinCard';
import { useMomentum } from '../hooks/useMomentum';
import { useWeeklyWins } from '../hooks/useWins';
import { motion } from 'framer-motion';

interface MomentumLevel {
  label: string;
  emoji: string;
  color: string;
}

interface GoalAreaMomentum {
  goalAreaId: string;
  displayName: string;
  emoji: string;
  color: string;
  currentWeekWins: number;
  weeklyTarget: number;
}

interface MomentumData {
  overall: {
    score: number;
    level: MomentumLevel;
  };
  byGoalArea: GoalAreaMomentum[];
}

interface Win {
  id: string;
  goalAreaId: string;
  title: string;
  occurredAt: string;
  duration?: number;
  energyBoost?: number;
}

const GOAL_AREA_META: Record<string, { emoji: string; color: string }> = {
  physical_health: { emoji: '💪', color: '#10B981' },
  mental_health: { emoji: '🧠', color: '#8B5CF6' },
  family_ian: { emoji: '👦', color: '#F59E0B' },
  family_wife: { emoji: '❤️', color: '#EC4899' },
  work_strategic: { emoji: '🎯', color: '#3B82F6' },
  work_leadership: { emoji: '👥', color: '#6366F1' },
  content_newsletter: { emoji: '✍️', color: '#F97316' },
};

export function CommandCenter() {
  const { data: momentum, isLoading: momentumLoading } = useMomentum() as { data: MomentumData | undefined; isLoading: boolean };
  const { data: weeklyWins } = useWeeklyWins() as { data: Win[] | undefined };

  const handleLogWin = (goalAreaId: string) => {
    console.log('Log win for:', goalAreaId);
  };

  if (momentumLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[var(--color-text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Good morning! 👋
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Let's celebrate your wins today
        </p>
      </header>

      {momentum && (
        <MomentumCard
          score={momentum.overall.score}
          level={momentum.overall.level}
        />
      )}

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          Your Goal Areas
        </h2>
        <div className="space-y-3">
          {momentum?.byGoalArea.map((area) => (
            <GoalAreaRow
              key={area.goalAreaId}
              id={area.goalAreaId}
              displayName={area.displayName}
              emoji={area.emoji}
              color={area.color}
              currentWeekWins={area.currentWeekWins}
              weeklyTarget={area.weeklyTarget}
              onLogWin={handleLogWin}
            />
          ))}
        </div>
      </section>

      {weeklyWins && weeklyWins.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Recent Wins 🎉
          </h2>
          <div className="space-y-3">
            {weeklyWins.slice(0, 5).map((win) => {
              const meta = GOAL_AREA_META[win.goalAreaId] || { emoji: '🏆', color: '#6366F1' };
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
      )}

      {(!weeklyWins || weeklyWins.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-4xl mb-4">🌟</p>
          <p className="text-[var(--color-text-secondary)]">
            No wins logged yet this week. Tap + to celebrate your first one!
          </p>
        </motion.div>
      )}
    </div>
  );
}
