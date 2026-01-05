import { db, users, goalAreas } from './index';

const DEFAULT_GOAL_AREAS = [
  {
    id: 'physical_health' as const,
    displayName: 'Physical Health',
    emoji: '💪',
    color: '#10B981',
    weeklyMinWins: 4,
    intentionText: 'Move my body, feel strong, have energy for what matters',
    sortOrder: 0,
  },
  {
    id: 'mental_health' as const,
    displayName: 'Mental Health',
    emoji: '🧠',
    color: '#8B5CF6',
    weeklyMinWins: 3,
    intentionText: 'Stay calm, process feelings, maintain clarity',
    sortOrder: 1,
  },
  {
    id: 'family_ian' as const,
    displayName: 'Time with Ian',
    emoji: '👦',
    color: '#F59E0B',
    weeklyMinWins: 5,
    intentionText: 'Be present, play together, create memories',
    sortOrder: 2,
  },
  {
    id: 'family_wife' as const,
    displayName: 'Time with Wife',
    emoji: '❤️',
    color: '#EC4899',
    weeklyMinWins: 3,
    intentionText: 'Connect deeply, support each other, enjoy time together',
    sortOrder: 3,
  },
  {
    id: 'work_strategic' as const,
    displayName: 'Strategic Work',
    emoji: '🎯',
    color: '#3B82F6',
    weeklyMinWins: 3,
    intentionText: 'Focus on high-impact work that moves the needle',
    sortOrder: 4,
  },
  {
    id: 'work_leadership' as const,
    displayName: 'Leadership',
    emoji: '👥',
    color: '#6366F1',
    weeklyMinWins: 2,
    intentionText: 'Develop the team, have meaningful 1:1s, unblock others',
    sortOrder: 5,
  },
  {
    id: 'content_newsletter' as const,
    displayName: 'Newsletter',
    emoji: '✍️',
    color: '#F97316',
    weeklyMinWins: 1,
    intentionText: 'Write consistently, share insights, build audience',
    sortOrder: 6,
  },
];

async function seed() {
  console.log('Seeding database...');

  const [user] = await db.insert(users).values({
    email: 'demo@momentum2026.app',
    displayName: 'Demo User',
    timezone: 'America/Los_Angeles',
    weekStartDay: '1',
  }).returning();

  console.log('Created user:', user.id);

  for (const area of DEFAULT_GOAL_AREAS) {
    await db.insert(goalAreas).values({
      ...area,
      userId: user.id,
      isActive: true,
      flexibilityBudget: 0,
    });
  }

  console.log('Created 7 goal areas');
  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
