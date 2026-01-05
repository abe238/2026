import { useState } from 'react';
import { useGoalAreas, useUpdateGoalArea } from '../hooks/useGoalAreas';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';

interface GoalArea {
  id: string;
  displayName: string;
  emoji: string;
  color: string;
  weeklyMinWins: number;
  intentionText: string;
  isActive: boolean;
}

export function GoalsPage() {
  const { data: goalAreas, isLoading } = useGoalAreas() as { data: GoalArea[] | undefined; isLoading: boolean };
  const updateGoalArea = useUpdateGoalArea();

  const [editModal, setEditModal] = useState<GoalArea | null>(null);
  const [editForm, setEditForm] = useState({ weeklyMinWins: 3, intentionText: '' });

  const handleEdit = (area: GoalArea) => {
    setEditModal(area);
    setEditForm({
      weeklyMinWins: area.weeklyMinWins || 3,
      intentionText: area.intentionText || '',
    });
  };

  const handleSave = async () => {
    if (!editModal) return;
    await updateGoalArea.mutateAsync({
      id: editModal.id,
      data: editForm,
    });
    setEditModal(null);
  };

  if (isLoading) {
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
          Your Goals 🎯
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Customize your 7 goal areas
        </p>
      </header>

      <div className="space-y-3">
        {goalAreas?.map((area) => (
          <motion.button
            key={area.id}
            onClick={() => handleEdit(area)}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[var(--color-surface-primary)] rounded-xl p-4 flex items-center gap-4 shadow-sm text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${area.color}20` }}
            >
              {area.emoji}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--color-text-primary)]">
                {area.displayName}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {area.weeklyMinWins} wins/week target
              </p>
              {area.intentionText && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1 italic">
                  "{area.intentionText}"
                </p>
              )}
            </div>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: area.color }}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {editModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setEditModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[var(--color-surface-primary)] rounded-2xl p-6 max-w-md mx-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{editModal.emoji}</span>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {editModal.displayName}
                  </h3>
                </div>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Weekly Target (wins/week)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editForm.weeklyMinWins}
                    onChange={(e) => setEditForm({ ...editForm, weeklyMinWins: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-momentum-steady)] focus:outline-none text-[var(--color-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Your Intention (optional)
                  </label>
                  <textarea
                    value={editForm.intentionText}
                    onChange={(e) => setEditForm({ ...editForm, intentionText: e.target.value })}
                    placeholder="Why is this goal important to you?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-momentum-steady)] focus:outline-none text-[var(--color-text-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateGoalArea.isPending}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-momentum-steady)] text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateGoalArea.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save
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
