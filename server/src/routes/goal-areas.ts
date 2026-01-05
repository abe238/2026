import { Router } from 'express';
import { db, goalAreas } from '../db';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

const updateGoalAreaSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  emoji: z.string().max(10).optional(),
  weeklyMinWins: z.number().min(0).max(20).optional(),
  intentionText: z.string().optional(),
  flexibilityBudget: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }

    const areas = await db.select()
      .from(goalAreas)
      .where(eq(goalAreas.userId, userId));

    res.json({ success: true, data: areas });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch goal areas' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }

    const goalAreaId = req.params.id as any;
    const data = updateGoalAreaSchema.parse(req.body);

    const [updated] = await db.update(goalAreas)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(goalAreas.id, goalAreaId),
          eq(goalAreas.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Goal area not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to update goal area' });
  }
});

export default router;
