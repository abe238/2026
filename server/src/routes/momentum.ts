import { Router } from 'express';
import { db, wins, goalAreas } from '../db';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

const router = Router();

const MOMENTUM_LEVELS = [
  { label: 'Rising', emoji: '🚀', minScore: 80, color: '#10B981' },
  { label: 'Steady', emoji: '✨', minScore: 60, color: '#6366F1' },
  { label: 'Building', emoji: '🌱', minScore: 40, color: '#F59E0B' },
  { label: 'Starting', emoji: '🌅', minScore: 0, color: '#8B5CF6' },
];

function getMomentumLevel(score: number) {
  return MOMENTUM_LEVELS.find(l => score >= l.minScore) || MOMENTUM_LEVELS[3];
}

function calculateMomentumScore(current: number, target: number, streak: number): number {
  const completion = Math.min(current / Math.max(target, 1), 1) * 100;
  const streakBonus = Math.min(streak * 5, 20);
  return Math.min(Math.round(completion + streakBonus), 100);
}

router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const areas = await db.select().from(goalAreas).where(eq(goalAreas.userId, userId));

    const weeklyWinCounts = await db.select({
      goalAreaId: wins.goalAreaId,
      count: sql<number>`count(*)::int`,
    })
      .from(wins)
      .where(
        and(
          eq(wins.userId, userId),
          eq(wins.isArchived, false),
          gte(wins.occurredAt, weekStart),
          lte(wins.occurredAt, weekEnd)
        )
      )
      .groupBy(wins.goalAreaId);

    const winCountMap = new Map(weeklyWinCounts.map(w => [w.goalAreaId, w.count]));

    const momentum = areas.map(area => {
      const currentWeekWins = winCountMap.get(area.id) || 0;
      const streak = 0;
      const momentumScore = calculateMomentumScore(currentWeekWins, area.weeklyMinWins, streak);
      const level = getMomentumLevel(momentumScore);

      return {
        goalAreaId: area.id,
        displayName: area.displayName,
        emoji: area.emoji,
        color: area.color,
        currentWeekWins,
        weeklyTarget: area.weeklyMinWins,
        streak,
        momentumScore,
        momentumLevel: level,
        trend: currentWeekWins >= area.weeklyMinWins ? 'up' :
               currentWeekWins >= area.weeklyMinWins / 2 ? 'stable' : 'building' as const,
      };
    });

    const overallScore = momentum.length > 0
      ? Math.round(momentum.reduce((sum, m) => sum + m.momentumScore, 0) / momentum.length)
      : 0;

    res.json({
      success: true,
      data: {
        overall: {
          score: overallScore,
          level: getMomentumLevel(overallScore),
        },
        byGoalArea: momentum,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      },
    });
  } catch (err) {
    console.error('Momentum error:', err);
    res.status(500).json({ success: false, error: 'Failed to calculate momentum' });
  }
});

export default router;
