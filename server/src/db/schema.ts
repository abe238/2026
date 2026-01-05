import { pgTable, varchar, text, integer, timestamp, boolean, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const goalAreaIdEnum = pgEnum('goal_area_id', [
  'physical_health',
  'mental_health',
  'family_ian',
  'family_wife',
  'work_strategic',
  'work_leadership',
  'content_newsletter'
]);

export const captureMethodEnum = pgEnum('capture_method', [
  'voice',
  'tap',
  'manual',
  'import'
]);

export const weekStartDayEnum = pgEnum('week_start_day', ['0', '1', '6']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  timezone: varchar('timezone', { length: 50 }).notNull().default('America/Los_Angeles'),
  weekStartDay: weekStartDayEnum('week_start_day').notNull().default('1'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const goalAreas = pgTable('goal_areas', {
  id: goalAreaIdEnum('id').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  color: varchar('color', { length: 20 }).notNull(),
  weeklyMinWins: integer('weekly_min_wins').notNull().default(3),
  intentionText: text('intention_text'),
  flexibilityBudget: integer('flexibility_budget').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pk: { columns: [table.id, table.userId] }
}));

export const wins = pgTable('wins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goalAreaId: goalAreaIdEnum('goal_area_id').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  duration: integer('duration'),
  energyBoost: integer('energy_boost'),
  occurredAt: timestamp('occurred_at').notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
  captureMethod: captureMethodEnum('capture_method').notNull().default('manual'),
  voiceTranscript: text('voice_transcript'),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const intentions = pgTable('intentions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goalAreaId: goalAreaIdEnum('goal_area_id').notNull(),
  weekStart: timestamp('week_start').notNull(),
  intentionText: text('intention_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const flexibilityEvents = pgTable('flexibility_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fromGoalAreaId: goalAreaIdEnum('from_goal_area_id').notNull(),
  toGoalAreaId: goalAreaIdEnum('to_goal_area_id').notNull(),
  weekStart: timestamp('week_start').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const voiceCaptures = pgTable('voice_captures', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transcript: text('transcript').notNull(),
  audioUrl: varchar('audio_url', { length: 500 }),
  extractedWins: text('extracted_wins'),
  processingStatus: varchar('processing_status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  goalAreas: many(goalAreas),
  wins: many(wins),
  intentions: many(intentions),
  flexibilityEvents: many(flexibilityEvents),
  voiceCaptures: many(voiceCaptures),
}));

export const goalAreasRelations = relations(goalAreas, ({ one, many }) => ({
  user: one(users, {
    fields: [goalAreas.userId],
    references: [users.id],
  }),
  wins: many(wins),
}));

export const winsRelations = relations(wins, ({ one }) => ({
  user: one(users, {
    fields: [wins.userId],
    references: [users.id],
  }),
}));
