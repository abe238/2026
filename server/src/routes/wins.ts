import { Router } from 'express';
import { db, wins } from '../db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

const createWinSchema = z.object({
  goalAreaId: z.enum(['physical_health', 'mental_health', 'family_ian', 'family_wife', 'work_strategic', 'work_leadership', 'content_newsletter']),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  duration: z.number().optional(),
  energyBoost: z.number().min(1).max(5).optional(),
  occurredAt: z.string().datetime(),
  captureMethod: z.enum(['voice', 'tap', 'manual', 'import']).default('manual'),
  voiceTranscript: z.string().optional(),
});

router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }

    const data = createWinSchema.parse(req.body);
    const [win] = await db.insert(wins).values({
      userId,
      ...data,
      occurredAt: new Date(data.occurredAt),
    }).returning();

    res.json({ success: true, data: win });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to create win' });
  }
});

router.get('/weekly', async (req, res) => {
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

    const weeklyWins = await db.select()
      .from(wins)
      .where(
        and(
          eq(wins.userId, userId),
          eq(wins.isArchived, false),
          gte(wins.occurredAt, weekStart),
          lte(wins.occurredAt, weekEnd)
        )
      )
      .orderBy(desc(wins.occurredAt));

    res.json({ success: true, data: weeklyWins });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch weekly wins' });
  }
});

router.get('/vault', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const vaultWins = await db.select()
      .from(wins)
      .where(
        and(
          eq(wins.userId, userId),
          eq(wins.isArchived, false)
        )
      )
      .orderBy(desc(wins.occurredAt))
      .limit(limit)
      .offset(offset);

    res.json({ success: true, data: vaultWins });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch wins vault' });
  }
});

router.get('/log', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }

    const goalAreaId = req.query.goalAreaId as string;
    const allWins = await db.select()
      .from(wins)
      .where(
        and(
          eq(wins.userId, userId),
          goalAreaId ? eq(wins.goalAreaId, goalAreaId as any) : undefined
        )
      )
      .orderBy(desc(wins.occurredAt));

    res.json({ success: true, data: allWins });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch wins log' });
  }
});

export default router;
