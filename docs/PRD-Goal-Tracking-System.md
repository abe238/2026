# Momentum 2026: Goal Tracking System
## Product Requirements Document & Technical Design

**Version:** 1.2
**Last Updated:** January 5, 2026
**Author:** Claude Code
**Status:** Ready for Implementation

### Key Decisions Made
| Decision | Resolution |
|----------|------------|
| One Thing Rotation | Lowest wins this week → weighted random tie-breaker |
| Streak Metric | Any 1 win in week = streak continues |
| Voice Infrastructure | Reuse LiveKit + Deepgram from VPS (ManagerHub) |
| Data Model | Wins-centric, streaks computed not stored |
| Timestamps | Full datetime on all events (occurredAt + occurredDate + occurredTime) |
| Daily Tasks | Optional "Intentions" feature, no guilt tracking |
| Goal View | ONE focus by default + "Show all 7" toggle |
| **Wins Log** | Track full activity details (what, duration, how it felt) - not just counts |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [User Research Foundation](#4-user-research-foundation)
5. [Core Design Principles](#5-core-design-principles)
6. [Goal Areas Specification](#6-goal-areas-specification)
7. [Data Model Design](#7-data-model-design)
8. [User Experience Flows](#8-user-experience-flows)
9. [Technical Architecture](#9-technical-architecture)
10. [API Specification](#10-api-specification)
11. [Component Architecture](#11-component-architecture)
12. [Voice Integration](#12-voice-integration)
13. [Nudge System](#13-nudge-system)
14. [Gamification System](#14-gamification-system)
15. [Migration & Schema Changes](#15-migration--schema-changes)
16. [Success Metrics](#16-success-metrics)
17. [Implementation Phases](#17-implementation-phases)
18. [Open Questions](#18-open-questions)

---

## 1. Executive Summary

Momentum 2026 is a **wins collection system** designed for neurodivergent users (ADHD, dyslexia, dysgraphia). Unlike traditional habit trackers that create guilt through missed-day counts and broken streaks, Momentum celebrates what WAS accomplished and provides gentle momentum awareness.

### Key Differentiators

| Traditional Habit Trackers | Momentum 2026 |
|---------------------------|---------------|
| Daily streaks that reset to zero | Weekly rhythms that pause, never break |
| "You missed 3 days" | "2 wins this week - momentum building" |
| Empty checkboxes showing failures | Filled dots showing accomplishments |
| Typing-first input | Voice-first (bypasses dysgraphia) |
| Rigid daily targets | Flexible weekly ranges (e.g., "2-4 times") |
| Punishment for absence | Warm welcome back |

### Core Insight

**This is NOT a habit tracker. It's a "Wins Collection System" with momentum awareness.**

The fundamental unit is a **WIN** (celebration), not a habit check.

---

## 2. Problem Statement

### Primary User Profile

**Abe** - Executive with ADHD, dyslexia, and dysgraphia who:
- Abandons apps when they make him feel guilty about falling behind
- Has fleeting thoughts that disappear before he can capture them
- Forgets positive experiences (ADHD brains discount past wins)
- Struggles with time blindness (future rewards feel invisible)
- Experiences decision paralysis when presented with too many options
- Finds typing slow and error-prone due to dysgraphia

### Failed Approaches

1. **Daily habit trackers** → Shame spiral when streaks break
2. **Complex journaling apps** → Too much friction, abandoned after week 1
3. **Reminder-heavy apps** → Feels like nagging, creates anxiety
4. **Goal dashboards** → Shows what's NOT done, triggers guilt

### Root Cause Analysis

Traditional productivity apps assume:
- Users have consistent motivation
- Showing deficits motivates improvement
- Daily consistency is achievable and desirable
- Typing is the natural input method

For neurodivergent users, these assumptions create **shame spirals** that lead to app abandonment.

---

## 3. Product Vision

### Vision Statement

> "A system that welcomes return, celebrates progress, and never makes you feel bad for being human."

### Success Criteria

1. **User returns after 7-day absence** → 80%+ re-engagement rate
2. **Voice capture to confirmation** → <10 seconds
3. **Weekly reflection completion** → 60%+ weekly
4. **Zero guilt-inducing UI patterns** → User testing confirms no shame triggers

### Anti-Goals

- NOT a comprehensive life management system
- NOT a calendar replacement
- NOT a task manager (no due dates for habits)
- NOT a social/competitive platform
- NOT an accountability partner app

---

## 4. User Research Foundation

### ADHD + Neurodivergent UX Research

| Research Area | Finding | Momentum Application |
|--------------|---------|---------------------|
| Dopamine baseline | Lower baseline means delayed rewards feel invisible | Immediate celebration on every win logged |
| Progressive disclosure | Too much information causes overwhelm | One Thing focus per day, not 7 goal areas |
| Gamification retention | 48% higher retention with gamification | Weekly streaks, surprise celebrations, Wins Vault |
| Streak psychology | Broken streaks cause shame spirals and abandonment | Streaks PAUSE, never reset; grace built-in |
| Voice input | Speaking bypasses dysgraphia, captures fleeting thoughts | Voice-first with AI auto-categorization |
| Time blindness | Can't feel time passing, future feels abstract | Weekly rhythms (not daily), always show clock |

### The Three Golden Rules

1. **Never require typing** → Voice or one-tap for everything
2. **Never show what's missing** → Only positive progress ("1 more to hit target" not "1 of 2 done")
3. **Never punish absence** → Welcome back warmly, pause streaks don't break them

### Typography Requirements (Dyslexia)

| Element | Requirement | Reason |
|---------|-------------|--------|
| Font | Lexend or Atkinson Hyperlegible | Designed for readability |
| Body size | 16-18px minimum | Never smaller |
| Line height | 1.5-1.8 | Generous spacing |
| Letter spacing | +0.5 to +1.5% | Expanded |
| Alignment | Left only | Never justified |
| Emphasis | Bold, never italics | Italics hard to read |

---

## 5. Core Design Principles

### Hierarchy of Needs for Neurodivergent Users

```
┌─────────────────────────────────────────────────────────────┐
│  Level 5: DELIGHT                                           │
│  Micro-animations, celebrations, personality                │
├─────────────────────────────────────────────────────────────┤
│  Level 4: MOTIVATION                                        │
│  Gamification, progress visualization, dopamine triggers    │
├─────────────────────────────────────────────────────────────┤
│  Level 3: GUIDANCE                                          │
│  Tell user what to do next, reduce decision paralysis       │
├─────────────────────────────────────────────────────────────┤
│  Level 2: CLARITY                                           │
│  Readable typography, clear hierarchy, minimal cognitive load│
├─────────────────────────────────────────────────────────────┤
│  Level 1: SAFETY (Anti-Guilt)                  ← FOUNDATION │
│  Welcoming return, no punishment, grace built in            │
└─────────────────────────────────────────────────────────────┘
```

### The Anti-Guilt Contract

Every design decision must pass this test:

> "Could this make someone feel bad about themselves?"

If yes → redesign it.

#### Specific Anti-Guilt Patterns

| Pattern | Implementation |
|---------|---------------|
| Empty states | "Ready when you are" not "No check-ins this week" |
| Progress display | Filled dots only, no empty boxes highlighting gaps |
| Streak handling | Pause on absence, never reset to zero |
| Color coding | Warm gold for progress, no red for "behind" |
| Absence handling | "Welcome back" not "You've been away for X days" |
| Weekly vs daily | Weekly targets give catch-up room |
| Grace days | "Flexibility available" not "3 days remaining" |

---

## 6. Goal Areas Specification

### The Seven Life Areas

| ID | Name | Identity Statement | Weekly Rhythm | Icon | Color |
|----|------|-------------------|---------------|------|-------|
| `physical_health` | Physical Health | "I'm becoming stronger and more energetic" | 3-4x/week | 💪 | `#7cb086` (soft green) |
| `mental_health` | Mental Health | "I'm nurturing my mind and well-being" | 2-3x/week | 🧠 | `#8b7ec7` (soft purple) |
| `family_ian` | Family - Ian | "I'm a present, engaged father" | 2-3x/week | 👦 | `#c47a63` (warm coral) |
| `family_wife` | Family - Wife | "I'm an attentive, loving partner" | 2-3x/week | ❤️ | `#c47a63` (warm coral) |
| `work_strategic` | Work - Strategic | "I'm building company vision and impact" | 3-4x/week | 🎯 | `#d4a853` (gold) |
| `work_leadership` | Work - Leadership | "I'm developing my team and influence" | 2-3x/week | 👥 | `#d4a853` (gold) |
| `content_newsletter` | Content/Newsletter | "I'm sharing expertise and building audience" | 1-2x/week | ✍️ | `#6ba3d6` (soft blue) |

### Rhythm Types

Instead of rigid targets (e.g., "exactly 3 times per week"), use flexible ranges:

```typescript
type RhythmType = 'daily_available' | 'few_per_week' | 'weekly' | 'whenever'

interface WeeklyRhythm {
  min: number        // Minimum for "on track" status
  ideal: number      // Target for "building momentum"
  max: number        // Upper bound (for balance)
  rhythmType: RhythmType
}

// Examples:
const physicalHealth: WeeklyRhythm = { min: 2, ideal: 4, max: 6, rhythmType: 'few_per_week' }
const familyIan: WeeklyRhythm = { min: 2, ideal: 3, max: 5, rhythmType: 'few_per_week' }
const content: WeeklyRhythm = { min: 1, ideal: 2, max: 3, rhythmType: 'weekly' }
```

### Momentum Status Calculation

Based on a **rolling 4-week window** (not single-week pass/fail):

```typescript
type MomentumStatus = 'building' | 'maintaining' | 'recovering' | 'starting'

function calculateMomentumStatus(last4Weeks: WeeklyWinCount[]): MomentumStatus {
  const metTargetWeeks = last4Weeks.filter(w => w.count >= w.minTarget).length

  if (metTargetWeeks >= 3) return 'building'      // 3-4 weeks on track
  if (metTargetWeeks === 2) return 'maintaining'  // 2 weeks on track
  if (metTargetWeeks === 1) return 'recovering'   // 1 week on track
  return 'starting'                                // Fresh start
}
```

**Critical:** "Recovering" is a neutral status, not a failure state. UI copy:
- Building: "Strong momentum in Physical Health"
- Maintaining: "Steady progress in Mental Health"
- Recovering: "Getting back on track with Family Time"
- Starting: "Beginning your journey with Content"

---

## 7. Data Model Design

### Design Philosophy

The data model is **wins-centric**, not streak-centric:
- The fundamental unit is a **Win** (what was accomplished)
- Streaks and momentum are **calculated**, not stored
- Grace is **proactive** (user-initiated breaks), not retroactive (counting missed days)

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│    User     │──────<│    GoalArea     │──────<│     Win      │
└─────────────┘       └─────────────────┘       └──────────────┘
      │                      │                         │
      │                      │                         │
      │               ┌──────┴──────┐                  │
      │               │             │                  │
      │         ┌─────┴─────┐ ┌─────┴─────┐            │
      │         │ Flexibility│ │ WeekSnap  │            │
      │         │  (breaks)  │ │(computed) │            │
      │         └───────────┘ └───────────┘            │
      │                                                │
      └────────────────────────────────────────────────┘
                              │
                        ┌─────┴─────┐
                        │  Capture  │
                        │  (voice)  │
                        └───────────┘
```

### Core Entities

#### User (Enhanced)

```typescript
interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: Date
  lastActiveAt: Date
  settings: UserSettings
}

interface UserSettings {
  timezone: string
  weekStartsOn: 'sunday' | 'monday'
  nudgePreferences: NudgePreferences
  notificationChannels: NotificationChannels
  onboardingCompleted: boolean
  reducedMotion: boolean          // Accessibility
  highContrast: boolean           // Accessibility
}
```

#### GoalArea (Enhanced from existing)

```typescript
interface GoalArea {
  id: string
  userId: string
  slug: GoalAreaSlug  // 'physical_health' | 'mental_health' | etc.
  name: string

  // NEW: Identity-based framing
  identityStatement: string       // "I'm becoming stronger"

  // NEW: Flexible rhythm (replaces fixed weeklyTarget)
  weeklyRhythm: WeeklyRhythm

  icon: string
  color: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

interface WeeklyRhythm {
  minPerWeek: number              // Floor for "on track"
  idealPerWeek: number            // Target for "building"
  maxPerWeek: number              // Ceiling (balance)
  rhythmType: 'daily' | 'few_per_week' | 'weekly' | 'flexible'
}
```

#### Win (Enhanced - The Atomic Unit)

```typescript
interface Win {
  id: string
  userId: string
  goalAreaId: string

  // Content - THE ACTUAL ACTIVITY DETAILS
  title: string                   // "20 mins of Peloton cycling"
  description?: string            // Optional longer note
  duration?: string               // "20 minutes", "45 minutes", "2 hours"
  durationMinutes?: number        // Numeric for aggregation (optional)

  // Capture metadata
  captureMethod: 'voice' | 'quick_tap' | 'journal' | 'check_in'
  captureId?: string              // Link to voice capture

  // Experience tracking
  energyBoost?: 1 | 2 | 3 | 4 | 5  // How did it feel? (1=low, 5=amazing)
  photoUrl?: string               // Proof/celebration photo

  // Timestamps (ALWAYS log full datetime)
  occurredAt: Date                // When the win happened (user can specify)
  occurredDate: string            // YYYY-MM-DD for grouping
  occurredTime?: string           // HH:MM if known
  capturedAt: Date                // When it was logged (auto)

  // Celebration
  isCelebrated: boolean
  celebratedAt?: Date

  // Never deleted, only archived
  isArchived: boolean
}
```

> **Note on Timestamps:** All events log full datetime. `occurredAt` captures the exact moment. `occurredDate` allows easy daily grouping. `occurredTime` is optional for quick-taps where time isn't specified.

### Wins Log View (NEW)

Users must be able to see **exactly what they did** and how it contributed to their goals. The Wins Log provides a chronological view of all captured wins:

| Field | Example | Source |
|-------|---------|--------|
| Date | 2026-01-05 | `occurredDate` |
| Time | 07:30 | `occurredTime` |
| What I Did | 20 mins of Peloton cycling | `title` |
| Goal Area | Physical Health | `goalAreaId` → GoalArea.name |
| Duration | 20 minutes | `duration` |
| How Captured | Voice | `captureMethod` |
| Energy Boost | 4/5 | `energyBoost` |
| Notes | Felt great after! | `description` |

**Voice Capture Flow:**
```
User: "I did 20 mins of peloton"
         ↓
AI extracts: title="20 mins of Peloton cycling"
             duration="20 minutes"
             durationMinutes=20
             goalAreaId=physical_health (auto-categorized)
         ↓
Win saved to database
         ↓
User can view in Wins Log with full details
         ↓
Weekly counts auto-calculated from Win records
```

This ensures users always know:
1. **What** they did (the actual activity)
2. **When** they did it (date + time)
3. **Which goal** it counted toward
4. **How long** it took
5. **How it felt** (energy boost)

#### Intention (NEW - Optional Daily Tasks)

```typescript
// User's daily intentions/reminders - things they want to do
interface Intention {
  id: string
  userId: string
  text: string
  date: string                    // YYYY-MM-DD
  goalAreaId?: string             // Optional link to goal area
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
}
```

> **Note:** Intentions are NOT guilt-tracked. Uncompleted intentions simply disappear at end of day. No "you missed X intentions" messaging.

#### Flexibility (NEW - Replaces Grace Days Counter)

```typescript
// User-initiated breaks, NOT retroactive counting
interface Flexibility {
  id: string
  userId: string
  date: Date
  reason?: 'rest' | 'sick' | 'travel' | 'family_priority' | 'intentional_break'
  note?: string
  createdAt: Date
}
```

**Key Difference:** Traditional habit trackers COUNT missed days ("3 grace days used").
Momentum lets users DECLARE breaks proactively ("I'm taking today to rest").

This is psychologically different:
- Deficit counting: "You failed 3 times"
- Proactive flexibility: "You chose to prioritize rest"

#### WeeklySnapshot (Computed, Not Stored)

```typescript
// This is CALCULATED on-demand, not persisted
interface WeeklySnapshot {
  weekStart: Date
  goalAreaId: string

  winsCount: number
  minTarget: number
  idealTarget: number

  // Status
  statusLabel: 'ahead' | 'on_track' | 'building' | 'room_to_grow'

  // Momentum (4-week rolling)
  momentumStatus: 'building' | 'maintaining' | 'recovering' | 'starting'

  // For display
  displayDots: ('filled' | 'empty')[]  // Max 5-7 dots
}
```

### Why Computed, Not Stored?

Storing weekly snapshots creates:
1. Stale data risk
2. Complex sync logic
3. Historical "failure" records that could guilt users

Instead, compute on-demand from the immutable Win log.

### Streak Calculation (Any 1 Win = Streak Continues)

```typescript
interface WeekStreak {
  consecutiveWeeks: number  // How many weeks with at least 1 win
  isPaused: boolean         // No wins this week yet, but week not over
  lastActiveWeek: string    // ISO week (e.g., "2026-W01")
}

function calculateWeekStreak(userId: string): WeekStreak {
  const wins = getAllWins(userId)
  const winsByWeek = groupByISOWeek(wins)
  const currentWeek = getCurrentISOWeek()

  // Count consecutive weeks going backwards
  let consecutiveWeeks = 0
  let weekToCheck = currentWeek

  while (true) {
    const winsThisWeek = winsByWeek.get(weekToCheck) || []

    if (winsThisWeek.length > 0) {
      consecutiveWeeks++
      weekToCheck = getPreviousWeek(weekToCheck)
    } else if (weekToCheck === currentWeek) {
      // Current week with no wins yet - streak not broken, just paused
      weekToCheck = getPreviousWeek(weekToCheck)
      // Don't increment, but keep checking
    } else {
      // Past week with no wins - streak ends here
      break
    }
  }

  return {
    consecutiveWeeks,
    isPaused: (winsByWeek.get(currentWeek) || []).length === 0,
    lastActiveWeek: consecutiveWeeks > 0 ? currentWeek : null
  }
}

// Example:
// Week 1: 5 wins → counts
// Week 2: 1 win → counts
// Week 3: 0 wins → BREAKS streak
// Week 4: 3 wins → starts new streak
// Week 5 (current): 0 wins so far → isPaused=true, streak=1
```

---

## 8. User Experience Flows

### 8.1 Daily Experience: The One Thing Flow

**Morning (Command Center)**

```
┌─────────────────────────────────────────────────────────────┐
│  Good morning, Abe                          8:15 AM  Sat   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🎯 TODAY'S FOCUS                                     │ │
│  │                                                       │ │
│  │  Physical Health       ●●○○  2 wins this week         │ │
│  │  "Time to move your body"                             │ │
│  │                                                       │ │
│  │  [🎙️ Log a Win]              [Change Focus]          │ │
│  │                                                       │ │
│  │  [▼ Show all 7 goal areas]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  TODAY'S INTENTIONS (optional)                        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │  ○ Call mom about Sunday dinner                       │ │
│  │  ○ Review Q1 OKRs draft                               │ │
│  │  [+ Add intention]                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  RECENT WINS                                          │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │  Yesterday: "Great 1:1 with Sarah" 👥                 │ │
│  │  Yesterday: "30-min Peloton ride" 💪                  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

EXPANDED VIEW (when "Show all 7" tapped):
┌───────────────────────────────────────────────────────────┐
│  ALL GOAL AREAS                            [▲ Collapse]   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Physical Health    ●●○○    [+ Log Win]                   │
│  Mental Health      ●○○     [+ Log Win]                   │
│  Family - Ian       ●●      [+ Log Win]                   │
│  Family - Wife      ●       [+ Log Win]                   │
│  Work - Strategic   ●●●     [+ Log Win]                   │
│  Work - Leadership  ●●      [+ Log Win]                   │
│  Content            ○       [+ Log Win]                   │
└───────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- ONE focus area shown by default (reduces decision paralysis)
- **"Show all 7" toggle** available for users who want full visibility
- Focus rotates based on algorithm below
- Recent wins shown for positive reinforcement
- Optional "Today's Intentions" section for users who want task reminders

#### One Thing Rotation Algorithm

```typescript
function getTodaysFocus(userId: string): GoalArea {
  const weeklyProgress = getWeeklyProgress(userId)

  // Step 1: Calculate "distance from target" for each goal area
  const scored = weeklyProgress.map(gp => ({
    goalArea: gp.goalArea,
    distance: gp.minTarget - gp.winsCount,  // Positive = needs attention
    weight: gp.goalArea.weeklyRhythm.idealPerWeek  // Higher targets = more important
  }))

  // Step 2: Find those furthest from target
  const maxDistance = Math.max(...scored.map(s => s.distance))
  const needsAttention = scored.filter(s => s.distance === maxDistance)

  // Step 3: If tie, use weighted random selection
  if (needsAttention.length === 1) {
    return needsAttention[0].goalArea
  }

  // Weighted random: higher ideal target = higher probability
  const totalWeight = needsAttention.reduce((sum, s) => sum + s.weight, 0)
  let random = Math.random() * totalWeight

  for (const item of needsAttention) {
    random -= item.weight
    if (random <= 0) return item.goalArea
  }

  return needsAttention[0].goalArea  // Fallback
}

// Example:
// Physical Health: 2 wins, min target 3 → distance = 1
// Mental Health: 1 win, min target 2 → distance = 1 (TIE)
// Family-Ian: 2 wins, min target 2 → distance = 0 (met target)
//
// Physical (ideal=4) and Mental (ideal=3) are tied.
// Weighted random: Physical has 4/7 chance, Mental has 3/7 chance.
```

### 8.2 Win Logging Flow (Critical Path)

**Target: Voice to confirmation in <10 seconds**

```
OPTION A: Voice-First (Primary)

Step 1: Tap floating mic button (ever-present)
        ↓
Step 2: Speak: "Did a 30-minute Peloton ride"
        ↓
Step 3: AI processes (show real-time transcription)
        ↓
Step 4: Confirmation card appears:
        ┌─────────────────────────────────────┐
        │  ✨ WIN CAPTURED                    │
        │                                     │
        │  "30-minute Peloton ride"           │
        │  → Physical Health                  │
        │                                     │
        │  [✓ Save]     [🔄 Edit]    [✕]     │
        └─────────────────────────────────────┘
        ↓
Step 5: One tap to confirm → Celebration animation

Total time: 6-8 seconds
```

```
OPTION B: Quick Tap (Secondary)

Step 1: Tap goal area from Command Center or Goals page
        ↓
Step 2: Pre-filled quick entry:
        ┌─────────────────────────────────────┐
        │  LOG WIN: Physical Health 💪        │
        │                                     │
        │  [Just worked out]                  │
        │  [Morning run]                      │
        │  [Gym session]                      │
        │  [Other...]                         │
        └─────────────────────────────────────┘
        ↓
Step 3: One tap on suggestion → Confirmation

Total time: 3-4 seconds
```

```
OPTION C: Journal Mode (Reflection)

From Goals & Wins page → "Reflect on Today"
        ↓
Guided prompt: "What wins do you want to celebrate?"
        ↓
Free-form with AI-assisted tagging
        ↓
Review extracted wins → Confirm batch

Total time: 2-5 minutes (intentional reflection)
```

### 8.3 Weekly View: Celebration, Not Judgment

**Goals & Wins Page**

```
┌─────────────────────────────────────────────────────────────┐
│  THIS WEEK'S MOMENTUM                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  Physical Health        ●●●○○    "3 strong sessions"        │
│  Mental Health          ●●○○     "Building momentum"        │
│  Family - Ian           ●●       "Quality time together"    │
│  Family - Wife          ●        "Date night planned"       │
│  Work - Strategic       ●●●      "Big presentation done"    │
│  Work - Leadership      ●●○      "1:1s completed"           │
│  Content                ○        "Ideas brewing"            │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ✨ 7 areas active this week. You're showing up.            │
│                                                             │
│  [🏆 View Wins Vault]                    [🎲 Random Win]   │
└─────────────────────────────────────────────────────────────┘
```

**Visual Design Principles:**
- Filled dots (●) = wins logged (gold/warm color)
- Empty dots (○) = opportunity (NOT failure)
- NO red colors, NO X marks, NO "missed" counts
- Encouragement copy even for low counts ("Ideas brewing" not "0 this week")
- Summary focuses on positive ("7 areas active")

### 8.4 Welcome Back Flow (After 2+ Days Absence)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Hey, good to see you. 👋                                   │
│                                                             │
│  No catch-up needed.                                        │
│                                                             │
│  What's ONE thing you want to focus on today?               │
│                                                             │
│  [🎙️ Voice Capture]              [Skip for now]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What NOT to show:**
- ❌ "You've been away for 5 days"
- ❌ "You missed 12 check-ins"
- ❌ "Your streaks have been paused"
- ❌ Any count of what wasn't done

**What TO show:**
- ✅ Warm, brief welcome
- ✅ One simple action
- ✅ Easy exit option

---

## 9. Technical Architecture

### 9.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                React + TypeScript                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐ │   │
│  │  │ Voice   │ │ Goals   │ │ Command │ │ Settings  │ │   │
│  │  │ Capture │ │ & Wins  │ │ Center  │ │           │ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └───────────┘ │   │
│  │                    │                                 │   │
│  │              React Context                           │   │
│  │         (Auth, Wins, Goals, UI State)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │ REST API
┌─────────────────────────┼───────────────────────────────────┐
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Express Server                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐ │   │
│  │  │ Auth    │ │ Wins    │ │ Voice   │ │ Nudges    │ │   │
│  │  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes    │ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └───────────┘ │   │
│  │                    │                                 │   │
│  │              Drizzle ORM                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  PostgreSQL                          │   │
│  │  wins | goal_areas | users | captures | nudges       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 External Services                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐               │   │
│  │  │ Claude  │ │ Whisper │ │ Twilio  │               │   │
│  │  │ (AI)    │ │ (STT)   │ │ (SMS)   │               │   │
│  │  └─────────┘ └─────────┘ └─────────┘               │   │
│  └─────────────────────────────────────────────────────┘   │
│                         SERVER                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Performance Requirements

| Metric | Target | Reason |
|--------|--------|--------|
| First Contentful Paint | <1s | ADHD users abandon slow apps |
| Time to Interactive | <2s | Immediate feedback critical |
| Voice to Confirmation | <10s | Capture fleeting thoughts |
| API Response (p95) | <200ms | Instant feedback on all actions |
| Offline Support | Full read, queued write | Used in sauna, car |

### 9.3 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + TypeScript | Existing stack, strong typing |
| Styling | Tailwind CSS | Design tokens, responsive |
| State | React Context + TanStack Query | Simple, server state management |
| Routing | React Router v6 | Existing, works well |
| Backend | Express + TypeScript | Existing stack |
| ORM | Drizzle | Type-safe, existing |
| Database | PostgreSQL | Existing, robust |
| Voice | LiveKit + Deepgram | Reuse VPS infrastructure, real-time STT |
| AI | Claude API | Natural language processing |
| SMS | Twilio | Nudge delivery |

---

## 10. API Specification

### 10.1 Wins API

```typescript
// POST /api/wins - Create a win
interface CreateWinRequest {
  goalAreaId: string
  title: string                  // "20 mins of Peloton cycling"
  description?: string           // Optional notes
  duration?: string              // "20 minutes", "45 minutes"
  durationMinutes?: number       // Numeric for aggregation
  captureMethod: 'voice' | 'quick_tap' | 'journal' | 'check_in'
  captureId?: string
  energyBoost?: 1 | 2 | 3 | 4 | 5
  occurredAt?: string            // ISO timestamp, defaults to now
}

interface CreateWinResponse {
  win: Win
  weeklyProgress: {
    goalAreaId: string
    winsThisWeek: number
    minTarget: number
    idealTarget: number
    statusLabel: string
  }
  celebration?: {
    type: 'first_win' | 'streak_week' | 'target_hit' | 'surprise'
    message: string
  }
}

// GET /api/wins/weekly?weekStart=2026-01-01
interface WeeklyWinsResponse {
  wins: Win[]
  byGoalArea: {
    [goalAreaId: string]: {
      wins: Win[]
      count: number
      minTarget: number
      idealTarget: number
      statusLabel: 'ahead' | 'on_track' | 'building' | 'room_to_grow'
      displayDots: ('filled' | 'empty')[]
    }
  }
  summary: {
    totalWins: number
    areasActive: number
    encouragement: string
  }
}

// GET /api/wins/vault?limit=50&offset=0&goalAreaId=xyz
interface WinsVaultResponse {
  wins: Win[]
  total: number
  byGoalArea: { [id: string]: number }
  randomWin?: Win  // For "Random Win" dopamine hit
}

// GET /api/wins/log?startDate=2026-01-01&endDate=2026-01-07&goalAreaId=xyz
// The Wins Log - chronological view of all activity details
interface WinsLogResponse {
  wins: WinLogEntry[]
  total: number
  filters: {
    startDate: string
    endDate: string
    goalAreaId?: string
  }
}

interface WinLogEntry {
  id: string
  occurredDate: string           // "2026-01-05"
  occurredTime?: string          // "07:30"
  title: string                  // "20 mins of Peloton cycling"
  goalAreaName: string           // "Physical Health" (denormalized for display)
  goalAreaColor: string          // "#7cb086"
  duration?: string              // "20 minutes"
  captureMethod: string          // "Voice"
  energyBoost?: number           // 4
  description?: string           // "Felt great after!"
}
```

### 10.2 Goal Areas API

```typescript
// GET /api/goal-areas
interface GoalAreasResponse {
  goalAreas: GoalArea[]
  todaysFocus: {
    goalAreaId: string
    reason: 'lowest_this_week' | 'scheduled' | 'user_selected' | 'random'
  }
}

// PATCH /api/goal-areas/:id
interface UpdateGoalAreaRequest {
  identityStatement?: string
  weeklyRhythm?: Partial<WeeklyRhythm>
  isActive?: boolean
}
```

### 10.3 Momentum API

```typescript
// GET /api/momentum
interface MomentumResponse {
  overall: 'thriving' | 'steady' | 'recovering' | 'starting'
  byGoalArea: {
    [goalAreaId: string]: {
      status: 'building' | 'maintaining' | 'recovering' | 'starting'
      last4Weeks: { weekStart: string; winsCount: number; metTarget: boolean }[]
      encouragement: string
    }
  }
  weekStreak: {
    weeksConsistent: number  // How many weeks with at least 1 check-in
    isPaused: boolean
    pausedSince?: string
  }
}
```

### 10.4 Intentions API

```typescript
// GET /api/intentions?date=2026-01-04
interface IntentionsResponse {
  intentions: Intention[]
  completedCount: number
  totalCount: number
}

// POST /api/intentions
interface CreateIntentionRequest {
  text: string
  date?: string        // Defaults to today
  goalAreaId?: string
}

// PATCH /api/intentions/:id
interface UpdateIntentionRequest {
  isCompleted?: boolean
  text?: string
}

// DELETE /api/intentions/:id
// Intentions can be deleted without guilt-tracking
```

### 10.5 Voice Capture API

```typescript
// POST /api/captures/voice
interface VoiceCaptureRequest {
  audioBlob: Blob  // multipart/form-data
  duration: number
}

interface VoiceCaptureResponse {
  captureId: string
  transcript: string
  extractedWins: {
    title: string
    goalAreaId: string
    confidence: number
  }[]
  status: 'processed' | 'needs_review'
}

// POST /api/captures/:id/confirm
interface ConfirmCaptureRequest {
  wins: {
    title: string
    goalAreaId: string
    energyBoost?: number
  }[]
}
```

---

## 11. Component Architecture

### 11.1 Component Hierarchy

```
App
├── AuthProvider
│   └── AppShell
│       ├── MainNav (sidebar)
│       ├── VoiceCapture (floating button)
│       └── Routes
│           ├── CommandCenter
│           │   ├── TimeGreeting
│           │   ├── TodaysFocusCard
│           │   ├── RecentWins
│           │   └── QuickActions
│           │
│           ├── GoalsWins
│           │   ├── WeeklyMomentumGrid
│           │   │   └── GoalAreaRow (x7)
│           │   ├── WinsVault
│           │   └── RandomWinButton
│           │
│           ├── VoiceAI
│           │   ├── VoiceRecorder
│           │   ├── TranscriptDisplay
│           │   └── WinConfirmation
│           │
│           ├── WorkLeadership
│           │   ├── StrategicBalanceGauge
│           │   ├── TeamConnectionList
│           │   └── LeadershipWins
│           │
│           ├── LifeDomains
│           │   ├── DomainTabs (Events, People, Ideas, Chores)
│           │   └── DomainList
│           │
│           └── Settings
│               ├── ProfileSection
│               ├── NudgePreferences
│               └── AccessibilityOptions
```

### 11.2 Key Component Specifications

#### VoiceCapture (Floating)

```typescript
interface VoiceCaptureProps {
  onCaptureComplete: (wins: ExtractedWin[]) => void
}

// States:
// - idle: Mic button visible, ready to record
// - recording: Pulsing animation, waveform visible
// - processing: "Thinking..." with spinner
// - confirming: Shows extracted wins for confirmation
// - celebrating: Confetti/celebration animation
```

#### GoalAreaRow (Anti-Guilt Progress Display)

```typescript
interface GoalAreaRowProps {
  goalArea: GoalArea
  winsThisWeek: number
  displayDots: ('filled' | 'empty')[]
  encouragement: string  // "3 strong sessions" or "Ideas brewing"
  onTap: () => void
}

// Visual rules:
// - Filled dots: Gold (#d4a853)
// - Empty dots: Subtle gray (#3a3f4a), NOT red
// - Text: Warm, encouraging, never "X missed"
// - Tap: Opens quick-add for that goal area
```

#### WinsVault

```typescript
interface WinsVaultProps {
  wins: Win[]
  totalCount: number
  byGoalArea: { [id: string]: number }
}

// Features:
// - Infinite scroll or paginated
// - Filter by goal area
// - "Random Win" button for dopamine hit
// - Search by keyword
// - Never shows "No wins" - shows "Your wins will appear here"
```

### 11.3 State Management

```typescript
// contexts/WinsContext.tsx
interface WinsContextValue {
  // Current week
  weeklyWins: Win[]
  winsByGoalArea: Map<string, Win[]>

  // Actions
  logWin: (win: CreateWinRequest) => Promise<CreateWinResponse>

  // Vault
  vaultWins: Win[]
  loadMoreVault: () => Promise<void>
  getRandomWin: () => Win | null

  // Loading states
  isLogging: boolean
  isLoadingWeek: boolean
}

// contexts/MomentumContext.tsx
interface MomentumContextValue {
  overall: MomentumStatus
  byGoalArea: Map<string, GoalAreaMomentum>

  todaysFocus: {
    goalArea: GoalArea
    reason: string
  }

  weekStreak: {
    weeksConsistent: number
    isPaused: boolean
  }
}
```

---

## 12. Voice Integration

### 12.1 Architecture Decision: Reuse LiveKit from VPS

**Decision:** Use existing LiveKit infrastructure from ManagerHub instead of building separate Whisper integration.

**Existing VPS Infrastructure:**
- LiveKit server: `wss://livekit.srv944870.hstgr.cloud`
- Real-time STT: Deepgram (already configured)
- Python agent: systemd service for voice handling

**Benefits:**
- Zero new infrastructure to deploy
- Proven real-time streaming (vs. upload-then-process)
- Sub-second latency for transcription
- Existing token API pattern to copy

### 12.2 Voice Capture Flow (LiveKit)

```
User Tap → LiveKit Room Join → WebRTC Audio Stream
         ↓
Real-time: Deepgram STT (streaming transcription)
         ↓
Transcript displayed in real-time
         ↓
User Tap Stop → Final transcript sent to Claude API
         ↓
Claude extracts wins with goal area classification
         ↓
Client shows confirmation UI
         ↓
User confirms → Wins saved
```

### 12.3 LiveKit Integration Components

**From ManagerHub (copy/adapt):**

```typescript
// API Route: /api/livekit/token
// Generates JWT for LiveKit room access
import { AccessToken, VideoGrant } from 'livekit-server-sdk'

export async function POST(req: Request) {
  const { userId } = await req.json()

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: `momentum_${userId}`,
      ttl: '15m'
    }
  )

  token.addGrant({
    roomJoin: true,
    room: `momentum_capture_${userId}_${Date.now()}`,
    canPublish: true,
    canSubscribe: true
  } as VideoGrant)

  return Response.json({
    token: await token.toJwt(),
    url: process.env.LIVEKIT_URL  // wss://livekit.srv944870.hstgr.cloud
  })
}
```

**React Component (adapted from ManagerHub AgentControlBar):**

```typescript
// components/VoiceCaptureRoom.tsx
import { LiveKitRoom, useVoiceAssistant } from '@livekit/components-react'
import { Track } from 'livekit-client'

function VoiceCaptureRoom({ token, url, onTranscript }) {
  return (
    <LiveKitRoom token={token} serverUrl={url}>
      <VoiceCaptureControls onTranscript={onTranscript} />
    </LiveKitRoom>
  )
}

function VoiceCaptureControls({ onTranscript }) {
  const { state, audioTrack } = useVoiceAssistant()

  // Real-time transcript displayed as user speaks
  // Final transcript sent to parent on stop

  return (
    <div>
      <MicrophoneButton />
      <TranscriptDisplay />
      <ConfirmButton />
    </div>
  )
}
```

### 12.4 Environment Variables

```env
# Reuse from ManagerHub
LIVEKIT_URL=wss://livekit.srv944870.hstgr.cloud
LIVEKIT_API_KEY=<existing key>
LIVEKIT_API_SECRET=<existing secret>
```

### 12.2 AI Prompt for Win Extraction

```markdown
You are extracting WINS (accomplishments) from a voice transcript.

Context: The user tracks 7 life goal areas:
- physical_health: Exercise, workouts, health activities
- mental_health: Meditation, therapy, journaling, self-care
- family_ian: Quality time with son Ian
- family_wife: Quality time with wife
- work_strategic: Strategic work, big projects, vision
- work_leadership: Team development, 1:1s, mentoring
- content_newsletter: Writing, content creation, newsletter

Rules:
1. Extract ONLY accomplishments (things done), not plans or intentions
2. Phrase positively as wins, not tasks
3. Assign confidence score (0-1) for goal area match
4. If unclear, use confidence < 0.7

Input transcript: "{transcript}"

Output JSON:
{
  "wins": [
    {
      "title": "30-minute Peloton ride",
      "goalAreaId": "physical_health",
      "confidence": 0.95
    }
  ]
}
```

### 12.3 Superwhisper Integration

For iOS users with Superwhisper app:

```
Option 1: URL Scheme
  momentum://capture?text={encoded_transcript}

Option 2: Share Extension
  Accept text/plain from Share Sheet
  Process with same AI extraction pipeline

Option 3: Shortcuts Integration
  Create iOS Shortcut that:
  1. Records with Superwhisper
  2. Sends transcript to Momentum API
  3. Opens Momentum for confirmation
```

---

## 13. Nudge System

### 13.1 Nudge Philosophy

Nudges are **invitations**, not obligations:
- Brief (1-2 sentences max)
- Actionable (include link to specific action)
- Encouraging (never guilt-inducing)
- Contextual (reference what user said they'd do)
- Respectful (easy to pause/adjust)

### 13.2 Nudge Types & Templates

```typescript
type NudgeType =
  | 'morning_focus'      // Reminder of today's focus
  | 'evening_reflection' // Invitation to reflect
  | 'welcome_back'       // After 2+ days absence
  | 'celebration'        // When target hit
  | 'gentle_reminder'    // Mid-week if low activity

const nudgeTemplates: Record<NudgeType, string[]> = {
  morning_focus: [
    "Your focus today: {focus}. You've got this. 🎯",
    "Morning! Ready to tackle {focus}?",
  ],
  evening_reflection: [
    "How'd today go? {link}",
    "Ready to capture some wins? {link}",
  ],
  welcome_back: [
    "Hey, good to see you! {link}",
    "No pressure. Whenever you're ready: {link}",
  ],
  celebration: [
    "You hit your {goalArea} goal this week! 🎉",
    "That's {streak} weeks of {goalArea} momentum!",
  ],
  gentle_reminder: [
    "Quick check-in when you have a moment? {link}",
  ],
}
```

### 13.3 Nudge Scheduling

```typescript
interface NudgeSchedule {
  morningTime: string      // "08:15" - as user leaves house
  eveningTime: string      // "21:45" - before sauna
  weekendMode: boolean     // Different timing on weekends
  pauseUntil?: Date        // User can pause all nudges
  urgentOnly: boolean      // Only celebrations, no reminders
}

// Nudge decision tree
function shouldSendNudge(user: User, type: NudgeType): boolean {
  if (user.nudgeSettings.pauseUntil > now) return false
  if (user.nudgeSettings.urgentOnly && type !== 'celebration') return false
  if (type === 'welcome_back' && daysSinceActive(user) < 2) return false
  if (type === 'gentle_reminder' && hasCheckedInToday(user)) return false
  return true
}
```

### 13.4 Anti-Guilt Nudge Rules

**NEVER send:**
- "You haven't checked in for X days"
- "Your streak is at risk"
- "Don't forget to..."
- "You're behind on..."

**ALWAYS frame as:**
- Invitation, not obligation
- Celebration, not reminder
- Opportunity, not requirement

---

## 14. Gamification System

### 14.1 Core Gamification Elements

| Element | Implementation | Anti-Guilt Consideration |
|---------|---------------|------------------------|
| Weekly Streaks | Count consecutive weeks with ≥1 check-in | Pauses on absence, never resets |
| Progress Dots | Fill in as wins logged | No empty boxes highlighted |
| Celebrations | Animation on milestones | Surprise timing, not predictable |
| Wins Vault | Cumulative achievement store | Always growing, never decreasing |
| Random Win | Dopamine hit button | Variable reward psychology |

### 14.2 Celebration Triggers

```typescript
interface CelebrationTrigger {
  type: 'first_win' | 'target_hit' | 'streak_week' | 'vault_milestone' | 'surprise'
  check: (context: CelebrationContext) => boolean
  message: (context: CelebrationContext) => string
  animation: 'confetti' | 'glow' | 'stars' | 'subtle'
}

const celebrationTriggers: CelebrationTrigger[] = [
  {
    type: 'first_win',
    check: (ctx) => ctx.userTotalWins === 1,
    message: () => "Your first win! This is the start of something great.",
    animation: 'confetti',
  },
  {
    type: 'target_hit',
    check: (ctx) => ctx.weeklyCount === ctx.idealTarget,
    message: (ctx) => `You hit your ${ctx.goalAreaName} goal this week!`,
    animation: 'stars',
  },
  {
    type: 'streak_week',
    check: (ctx) => ctx.consecutiveWeeks % 4 === 0 && ctx.consecutiveWeeks > 0,
    message: (ctx) => `${ctx.consecutiveWeeks} weeks of showing up. Incredible.`,
    animation: 'confetti',
  },
  {
    type: 'surprise',
    check: () => Math.random() < 0.1,  // 10% chance
    message: () => "Just wanted to say: you're doing great.",
    animation: 'glow',
  },
]
```

### 14.3 Variable Reward Psychology

Based on Duolingo research, variable (unpredictable) rewards are more engaging:

```typescript
function shouldShowSurpriseCelebration(): boolean {
  // Not every win, not predictable
  const baseChance = 0.08  // 8% base
  const timeBonus = isEvening() ? 0.05 : 0  // Higher in evening
  const droughtBonus = daysSinceLastCelebration() > 3 ? 0.1 : 0

  return Math.random() < (baseChance + timeBonus + droughtBonus)
}

const surpriseMessages = [
  "Quick reminder: you're making progress, even when it doesn't feel like it.",
  "That's another win in the vault. They add up.",
  "Look at you, showing up for yourself.",
  "Small wins → Big momentum.",
]
```

---

## 15. Migration & Schema Changes

### 15.1 Schema Changes from Existing

The existing schema needs these modifications:

#### GoalAreas Table (NEW)

```sql
CREATE TABLE goal_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  slug goal_area_slug NOT NULL,  -- enum
  name TEXT NOT NULL,
  identity_statement TEXT,
  weekly_rhythm_min INTEGER DEFAULT 2,
  weekly_rhythm_ideal INTEGER DEFAULT 3,
  weekly_rhythm_max INTEGER DEFAULT 5,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, slug)
);
```

#### Wins Table (Enhanced)

```sql
-- Add new columns to existing wins table
ALTER TABLE wins
  ADD COLUMN capture_method TEXT DEFAULT 'manual',
  ADD COLUMN energy_boost INTEGER,
  ADD COLUMN occurred_at TIMESTAMP,
  ADD COLUMN is_archived BOOLEAN DEFAULT false;

-- Rename for clarity
ALTER TABLE wins RENAME COLUMN title TO title;
ALTER TABLE wins RENAME COLUMN created_at TO captured_at;
```

#### Intentions Table (NEW - Daily tasks/reminders)

```sql
CREATE TABLE intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  date DATE NOT NULL,
  goal_area_id UUID REFERENCES goal_areas(id),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Index for daily queries
CREATE INDEX idx_intentions_user_date ON intentions(user_id, date);
```

#### Flexibility Table (NEW - Replaces grace tracking)

```sql
CREATE TABLE flexibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  reason TEXT,  -- 'rest' | 'sick' | 'travel' | 'family_priority' | 'intentional_break'
  note TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date)
);
```

#### Streaks Table (DEPRECATED)

```sql
-- The streaks table concept is replaced by computed momentum
-- We'll keep it for historical data but stop writing to it
-- New momentum is calculated from wins table directly
```

### 15.2 Data Migration

```sql
-- Seed goal areas for existing user
INSERT INTO goal_areas (user_id, slug, name, identity_statement, weekly_rhythm_min, weekly_rhythm_ideal, weekly_rhythm_max)
SELECT
  id,
  'physical_health',
  'Physical Health',
  'I''m becoming stronger and more energetic',
  2, 4, 6
FROM users
WHERE NOT EXISTS (SELECT 1 FROM goal_areas WHERE user_id = users.id AND slug = 'physical_health');

-- Repeat for all 7 goal areas...
```

---

## 16. Success Metrics

### 16.1 North Star Metric

**Weekly Active Users who log at least 1 win**

This measures engagement without punishing low activity.

### 16.2 Key Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Return rate after 7-day absence | >80% | Users who return within 14 days of 7-day gap |
| Voice capture completion | >85% | Captures that result in ≥1 confirmed win |
| Weekly reflection rate | >60% | Users who check Goals page weekly |
| Streak pause (not break) | >90% | Of users who miss a week, streaks pause not reset |
| Time to first win (new users) | <60s | Onboarding optimization |
| Voice to confirmation time | <10s | Critical path performance |

### 16.3 Anti-Metrics (What NOT to Optimize)

- ❌ Daily active users (creates pressure)
- ❌ Streak length (creates anxiety)
- ❌ Notification open rate (creates guilt)
- ❌ "Missed days" (shouldn't exist in data)

---

## 17. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Core win logging with anti-guilt display

- [ ] Migrate database schema (goal_areas, enhanced wins)
- [ ] Build GoalArea seeding for new users
- [ ] Implement WeeklyMomentumGrid component
- [ ] Implement CreateWin API endpoint
- [ ] Build quick-tap win logging flow
- [ ] Implement weekly view with filled-dots display

**Exit Criteria:** User can log wins and see weekly progress without any guilt-inducing UI

### Phase 2: Voice Integration (Week 3-4)

**Goal:** Voice-first win capture

- [ ] Integrate Web Audio API for recording
- [ ] Build Whisper API integration
- [ ] Create Claude extraction prompt
- [ ] Implement VoiceCapture floating component
- [ ] Build confirmation/edit flow
- [ ] Add celebration animations

**Exit Criteria:** Voice to confirmed win in <10 seconds

### Phase 3: Momentum & Gamification (Week 5-6)

**Goal:** 4-week rolling momentum, celebrations

- [ ] Implement momentum calculation algorithm
- [ ] Build MomentumContext with computed status
- [ ] Create celebration trigger system
- [ ] Implement surprise reward logic
- [ ] Build Wins Vault with Random Win
- [ ] Add streak pause (not break) logic

**Exit Criteria:** User sees encouraging momentum status, receives occasional celebrations

### Phase 4: Nudges & Polish (Week 7-8)

**Goal:** Non-intrusive nudge system, welcome back flow

- [ ] Build nudge scheduling system
- [ ] Integrate Twilio for SMS
- [ ] Create anti-guilt nudge templates
- [ ] Implement Welcome Back flow
- [ ] Build flexibility (proactive break) feature
- [ ] Add accessibility options (reduced motion, high contrast)

**Exit Criteria:** Nudges feel like invitations, return after absence is warm

---

## 18. Open Questions

### 18.1 Product Questions

1. **One Thing Rotation Algorithm:** ✅ DECIDED
   - **Primary:** Lowest wins this week (goal area furthest from target)
   - **Tie-breaker:** Random with weighting (based on target importance)
   - See algorithm spec below

2. **Grace Day Visibility:** Should we show "Flexibility available" or hide it entirely?
   - Showing it might remind users of the concept of "missing" days
   - Hiding it assumes users understand the system

3. **Streak Definition:** ✅ DECIDED
   - **Any 1 win in the week** = streak continues
   - Most forgiving option, reduces anxiety
   - See streak calculation spec below

### 18.2 Technical Questions

1. **Offline Support Scope:** Full offline-first with sync, or optimistic updates only?
2. **Voice Processing Location:** Client-side WebRTC or server-side Whisper?
3. **Real-time Updates:** WebSocket for multi-device sync or polling?
4. **Superwhisper Integration:** Priority level? iOS Share Extension complexity?

### 18.3 Decisions Needed

| Question | Options | Recommendation |
|----------|---------|----------------|
| Focus rotation | Lowest wins / Scheduled / AI | Start with lowest wins, add scheduling |
| Streak metric | Any win / 3+ areas / Check-in | Any 1 win (most forgiving) |
| Offline | Full PWA / Optimistic only | Optimistic with background sync |
| Voice hosting | ~~Browser Whisper / Server Whisper~~ | **LiveKit + Deepgram (reuse VPS)** ✅ |

---

## Appendix A: Design System Reference

### Color Tokens

```css
:root {
  /* Backgrounds */
  --bg-primary: #1a1d24;
  --bg-card: #252932;
  --bg-elevated: #2d323d;

  /* Accents */
  --accent-gold: #d4a853;     /* Wins, progress */
  --accent-green: #7cb086;    /* Success, health */
  --accent-coral: #c47a63;    /* Family, love */
  --accent-purple: #8b7ec7;   /* Mental health */
  --accent-blue: #6ba3d6;     /* Content */

  /* Text */
  --text-primary: #f0ede6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* Never use for "behind" states */
  --danger-soft: #e07a5f;     /* Only for destructive actions */
}
```

### Typography Scale

```css
:root {
  --font-family: 'Lexend', 'Atkinson Hyperlegible', sans-serif;

  --text-xs: 0.75rem;    /* 12px - avoid */
  --text-sm: 0.875rem;   /* 14px - labels only */
  --text-base: 1rem;     /* 16px - minimum body */
  --text-lg: 1.125rem;   /* 18px - preferred body */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px - headings */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  --line-height: 1.6;
  --letter-spacing: 0.01em;
}
```

### Component Tokens

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);

  --touch-target: 44px;  /* Minimum */
  --touch-preferred: 48px;
}
```

---

## Appendix B: Copy Guidelines

### Encouraging Copy Examples

| Context | Don't Say | Do Say |
|---------|-----------|--------|
| Low wins | "Only 1 win this week" | "1 win captured - momentum starting" |
| Zero wins | "No wins logged" | "Ready when you are" |
| After absence | "You missed 5 days" | "Good to see you" |
| Streak risk | "Streak at risk!" | (Don't mention it) |
| Behind target | "2/5 complete" | "2 wins - room to build" |
| Empty vault | "No wins yet" | "Your victories will live here" |

### Celebration Copy Examples

```typescript
const celebrationCopy = {
  first_win: [
    "Your first win! This is the start of something great.",
    "And so it begins. Welcome to Momentum.",
  ],
  target_hit: [
    "You hit your {goalArea} target this week! 🎉",
    "{goalArea} goal: crushed. You showed up.",
  ],
  streak_milestone: [
    "{weeks} weeks of consistent momentum. That's rare.",
    "Look at you, {weeks} weeks strong. This is who you're becoming.",
  ],
  surprise: [
    "Just wanted to say: you're doing great.",
    "Small wins compound. Keep going.",
    "Another one for the vault. They add up.",
  ],
}
```

---

## Appendix C: Research Sources

- Intuit Design Hub: "How my ADHD makes me a better designer"
- UX Collective: "Software accessibility for users with ADHD"
- Tiimo App: "Gamification ADHD: How to make tasks easier to start"
- ADHD Centre UK: "ADHD Gamification | How To Boost Focus"
- accessiBe: "Dyslexia-Friendly Fonts: How Typography Supports Accessibility"
- Section508.gov: "Understanding Accessible Fonts and Typography"
- Brain Dump App: Voice-first journaling design patterns
- Moore Momentum: "The ADHD Reward System: Why You Struggle With Motivation"
- Imaginovation: "How Gamification in ADHD Apps Can Boost User Retention"
- James Clear: "Atomic Habits" (identity-based habit formation)
- Nir Eyal: "Hooked" (variable reward psychology)
- BJ Fogg: "Tiny Habits" (friction reduction)

---

*Document generated by Claude Code for Momentum 2026*
*Last updated: January 4, 2026*
