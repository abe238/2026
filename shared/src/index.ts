// Goal Area types
export type GoalAreaId =
  | 'physical_health'
  | 'mental_health'
  | 'family_ian'
  | 'family_wife'
  | 'work_strategic'
  | 'work_leadership'
  | 'content_newsletter';

export interface GoalArea {
  id: GoalAreaId;
  userId: string;
  displayName: string;
  emoji: string;
  color: string;
  weeklyMinWins: number;
  intentionText: string | null;
  flexibilityBudget: number;
  isActive: boolean;
  sortOrder: number;
}

// Win types
export type CaptureMethod = 'voice' | 'tap' | 'manual' | 'import';

export interface Win {
  id: string;
  userId: string;
  goalAreaId: GoalAreaId;
  title: string;
  description: string | null;
  duration: number | null; // minutes
  energyBoost: number | null; // 1-5
  occurredAt: Date;
  capturedAt: Date;
  captureMethod: CaptureMethod;
  voiceTranscript: string | null;
  isArchived: boolean;
}

// Momentum types
export interface MomentumLevel {
  label: string;
  emoji: string;
  minScore: number;
  color: string;
}

export interface GoalAreaMomentum {
  goalAreaId: GoalAreaId;
  currentWeekWins: number;
  weeklyTarget: number;
  streak: number;
  momentumScore: number;
  trend: 'up' | 'stable' | 'down';
}

// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  weekStartDay: 0 | 1 | 6; // Sun, Mon, Sat
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
