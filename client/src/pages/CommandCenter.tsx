import { useState } from 'react';
import { MomentumCard } from '../components/MomentumCard';
import { GoalAreaRow } from '../components/GoalAreaRow';
import { WinCard } from '../components/WinCard';
import { useMomentum } from '../hooks/useMomentum';
import { useWeeklyWins, useCreateWin } from '../hooks/useWins';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';

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
  const createWin = useCreateWin();

  const [quickWinModal, setQuickWinModal] = useState<{ open: boolean; goalAreaId: string; goalAreaName: string } | null>(null);
  const [winTitle, setWinTitle] = useState('');

  const handleLogWin = (goalAreaId: string) => {
    const area = momentum?.byGoalArea.find(a => a.goalAreaId === goalAreaId);
    setQuickWinModal({ open: true, goalAreaId, goalAreaName: area?.displayName || goalAreaId });
    setWinTitle('');
  };

  const handleSubmitWin = async () => {
    if (!quickWinModal || !winTitle.trim()) return;

    await createWin.mutateAsync({
      goalAreaId: quickWinModal.goalAreaId,
      title: winTitle.trim(),
      occurredAt: new Date().toISOString(),
      captureMethod: 'tap',
    });

    setQuickWinModal(null);
    setWinTitle('');
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

      <AnimatePresence>
        {quickWinModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setQuickWinModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[var(--color-surface-primary)] rounded-2xl p-6 max-w-md mx-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Log Win: {quickWinModal.goalAreaName}
                </h3>
                <button
                  onClick={() => setQuickWinModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <input
                type="text"
                value={winTitle}
                onChange={(e) => setWinTitle(e.target.value)}
                placeholder="What did you accomplish?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-momentum-steady)] focus:outline-none text-[var(--color-text-primary)]"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitWin()}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setQuickWinModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitWin}
                  disabled={!winTitle.trim() || createWin.isPending}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-momentum-steady)] text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createWin.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Win
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
