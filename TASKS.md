# Momentum 2026 - Task Tracker

Last Updated: 2026-01-05

## Project Overview
A wins-focused goal tracking system for neurodivergent users. Track small wins across 7 life areas with voice capture, anti-guilt UI, and momentum visualization.

**Production URL**: https://2026goals.srv944870.hstgr.cloud

## Tech Stack
- **Frontend**: React 19, Vite 7, TailwindCSS 4, Framer Motion, TanStack Query
- **Backend**: Node.js, Express, Drizzle ORM, PostgreSQL
- **Infrastructure**: Docker, GitHub Actions CI/CD, Traefik on Hostinger VPS

---

## Completed Tasks

### Foundation (Tasks 1-10) ✅
- [x] Project scaffolding (monorepo: client/server/shared)
- [x] Database schema with 7 goal areas
- [x] Express API routes (wins, momentum, goal-areas)
- [x] Drizzle ORM integration with PostgreSQL
- [x] Docker and docker-compose setup
- [x] GitHub Actions CI/CD pipeline

### Frontend Core (Tasks 11-20) ✅
- [x] AppShell with bottom navigation
- [x] MomentumCard component (score visualization)
- [x] GoalAreaRow component (progress bars, quick-add buttons)
- [x] WinCard component (celebrate wins display)
- [x] Voice capture modal UI (bottom sheet)
- [x] CSS design tokens (anti-guilt colors)

### Pages (Tasks 21-30) ✅
- [x] CommandCenter (Today) page - main dashboard
- [x] Quick win modal with API integration
- [x] Goals page - view/edit goal areas, targets, intentions
- [x] Vault page - historical wins grouped by week
- [x] Settings page - profile, preferences, about

### Routing & Navigation ✅
- [x] Hash-based client-side routing
- [x] Active state highlighting in nav
- [x] Page transitions working

---

## In Progress

### Voice Integration (Tasks 31-40) ✅
- [x] **Deepgram Integration** - Real speech-to-text via server API
  - Server route: POST /api/voice/process
  - Uses Deepgram Nova-2 model
  - Client sends audio blob, server returns transcript

- [x] **Claude API for Win Extraction** - Parse transcripts into wins
  - Uses Claude claude-sonnet-4-20250514 for intelligent extraction
  - Fallback keyword matching when Claude unavailable
  - Returns structured wins with confidence scores

---

## Pending Tasks

### Voice Polish (Tasks 41-45)
- [ ] Voice waveform visualization during recording
- [ ] Audio playback before confirm
- [ ] Confidence indicators on extracted wins
- [ ] Multi-win detection from single transcript

### Enhanced Features (Tasks 46-50)
- [ ] Weekly summary/reflection view
- [ ] Goal area reordering (drag & drop)
- [ ] Export wins data (CSV/JSON)
- [ ] PWA support (offline, install prompt)
- [ ] Push notifications for daily check-ins

### Quality & Polish
- [ ] Error boundaries and fallback UI
- [ ] Loading skeletons instead of "Loading..."
- [ ] Haptic feedback on mobile (vibration API)
- [ ] Dark mode support
- [ ] Accessibility audit (WCAG AA)

---

## Known Issues

1. **Voice capture is mocked** - Uses MediaRecorder but transcription is fake
2. **No auth** - Uses fixed user ID (MVP limitation)
3. **Timezone handling** - Hardcoded to America/Los_Angeles

---

## How to Contribute

1. Check this file for current status
2. Pick a pending task or address a known issue
3. Run `npm run build` before committing
4. Push to main triggers auto-deploy

### Local Development
```bash
npm install        # Install all workspace deps
npm run dev        # Start client dev server (port 5176)
cd server && npm run dev  # Start API server (port 3001)
```

### Production
```bash
git push origin main  # Triggers GitHub Actions → ghcr.io → VPS pull
```

---

## File Structure
```
/2026
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/   # CommandCenter, Goals, Vault, Settings
│   │   ├── components/  # UI components
│   │   ├── hooks/   # React Query hooks
│   │   └── lib/     # API client, utils
├── server/          # Express backend
│   ├── src/
│   │   ├── db/      # Schema, migrations, seeds
│   │   └── routes/  # API endpoints
├── shared/          # Shared TypeScript types
├── docker-compose.prod.yml
└── .github/workflows/deploy.yml
```
