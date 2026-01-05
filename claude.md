# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Momentum 2026** is a wins collection system designed for neurodivergent users (ADHD, dyslexia, dysgraphia). Unlike traditional habit trackers that create guilt through missed-day counts, Momentum celebrates accomplishments and provides gentle momentum awareness.

See `docs/PRD-Goal-Tracking-System.md` for the complete product requirements.

## Core Product Philosophy

**This is NOT a habit tracker. It's a "Wins Collection System" with momentum awareness.**

| Traditional Trackers | Momentum 2026 |
|---------------------|---------------|
| Daily streaks that reset to zero | Weekly rhythms that pause, never break |
| "You missed 3 days" | "2 wins this week - momentum building" |
| Empty checkboxes showing failures | Filled dots showing accomplishments |
| Typing-first input | Voice-first (bypasses dysgraphia) |

### The Three Golden Rules
1. **Never require typing** → Voice or one-tap for everything
2. **Never show what's missing** → Only positive progress
3. **Never punish absence** → Welcome back warmly, pause streaks don't break them

### Anti-Guilt Contract
Every design decision must pass: "Could this make someone feel bad about themselves?" If yes → redesign it.

## The Seven Goal Areas

| ID | Name | Weekly Rhythm |
|----|------|---------------|
| `physical_health` | Physical Health | 3-4x/week |
| `mental_health` | Mental Health | 2-3x/week |
| `family_ian` | Family - Ian | 2-3x/week |
| `family_wife` | Family - Wife | 2-3x/week |
| `work_strategic` | Work - Strategic | 3-4x/week |
| `work_leadership` | Work - Leadership | 2-3x/week |
| `content_newsletter` | Content/Newsletter | 1-2x/week |

## Technical Architecture

### Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, React Router v6
- **State**: React Context + TanStack Query
- **Backend**: Express + TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **Voice**: LiveKit + Deepgram (reuse VPS infrastructure at `wss://livekit.srv944870.hstgr.cloud`)
- **AI**: Claude API for win extraction from voice

### Key Data Model

The fundamental unit is a **Win** (celebration), not a habit check:

```typescript
interface Win {
  id: string
  userId: string
  goalAreaId: string
  title: string                    // "20 mins of Peloton cycling"
  duration?: string                // "20 minutes"
  captureMethod: 'voice' | 'quick_tap' | 'journal' | 'check_in'
  energyBoost?: 1 | 2 | 3 | 4 | 5
  occurredAt: Date
  occurredDate: string             // YYYY-MM-DD for grouping
}
```

Streaks and momentum are **calculated on-demand** from the Win log, never stored.

### Streak Logic
- Any 1 win in a week = streak continues
- Current week with no wins = `isPaused: true` (not broken)
- Past week with no wins = streak ends there

## Design System

### Typography (Dyslexia-Friendly)
- Font: Lexend or Atkinson Hyperlegible
- Body size: 16-18px minimum
- Line height: 1.5-1.8
- Alignment: Left only (never justified)
- Emphasis: Bold only (never italics)

### Color Tokens
```css
--accent-gold: #d4a853;     /* Wins, progress */
--accent-green: #7cb086;    /* Health */
--accent-coral: #c47a63;    /* Family */
--accent-purple: #8b7ec7;   /* Mental health */
--accent-blue: #6ba3d6;     /* Content */
--bg-primary: #1a1d24;
--bg-card: #252932;
```

**Never use red for "behind" states.** Empty dots are subtle gray (#3a3f4a), not red.

## Design OS Workflow

This project uses Design OS slash commands for product design:

```
/product-vision    → Define product overview
/product-roadmap   → Break into sections
/data-model        → Define entities
/design-tokens     → Colors and typography
/design-shell      → App navigation/layout
/shape-section     → Section specs
/sample-data       → Generate data.json + types.ts
/design-screen     → Create React components
/export-product    → Generate handoff package
```

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1s |
| Time to Interactive | <2s |
| Voice to Confirmation | <10s |
| API Response (p95) | <200ms |

## Key User Flows

### Voice Capture (Primary)
1. Tap floating mic button
2. Speak: "Did a 30-minute Peloton ride"
3. AI extracts win with goal area
4. One tap to confirm → Celebration animation

**Target: 6-8 seconds total**

### One Thing Focus
Daily focus rotates based on:
1. Goal area furthest from weekly target
2. Tie-breaker: weighted random by target importance

Users see ONE focus by default with "Show all 7" toggle available.

## Copy Guidelines

| Context | Don't Say | Do Say |
|---------|-----------|--------|
| Low wins | "Only 1 win this week" | "1 win captured - momentum starting" |
| Zero wins | "No wins logged" | "Ready when you are" |
| After absence | "You missed 5 days" | "Good to see you" |
| Behind target | "2/5 complete" | "2 wins - room to build" |
