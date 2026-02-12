# Phase 3A: Deploy to Vercel (Hardcoded Questions)

## Context

Extracted from the original Phase 3 and moved ahead of both Phase 4 (Polish) and Phase 3B (MongoDB). The game is fully functional with 30 hardcoded questions — there is no technical reason to wait for MongoDB before deploying. Getting a live URL enables real-device testing and soft launch.

## Why Now

- 30 hardcoded questions = 30-day content runway, more than enough for soft launch
- No `MONGODB_URI` needed, no connection pool tuning, no cold start risk
- Real-device testing on iOS Safari / Chrome Android catches issues localhost can't
- Gives us a shareable URL for Phase 4 QA before soft launch

## Prerequisites

- None. Current `main` branch builds and runs.

## Implementation Steps

### Step 1: Create Vercel Project

- Connect GitHub repo to Vercel
- No environment variables needed (hardcoded questions, no MongoDB)
- Framework preset: Next.js (auto-detected)
- Build command: `npm run build` (default)
- Output directory: `.next` (default)

### Step 2: Verify Production Build Locally

```bash
npm run build && npm run start
```

- Confirm game loads at `localhost:3000`
- Play through a full game
- Verify cookie persistence on page reload
- Check that share button works

### Step 3: Deploy

- Push to `main` (or connect Vercel to the branch)
- Vercel auto-deploys on push

### Step 4: Production Smoke Test

- [ ] Game loads on the `.vercel.app` URL
- [ ] Question displays correctly (matches today's date)
- [ ] Can play through all 5 guesses
- [ ] Timer works (10-second countdown)
- [ ] Cookie persistence across page reload
- [ ] Share button copies text to clipboard
- [ ] Test on iOS Safari (real device or BrowserStack)
- [ ] Test on Chrome Android (real device or BrowserStack)
- [ ] No console errors in production

### Step 5: Custom Domain (Optional, Can Defer)

- Add custom domain in Vercel dashboard
- Update `NEXT_PUBLIC_SITE_URL` if share links need the real domain
- DNS propagation: 5-30 min for Vercel-managed, longer for external DNS

## What This Does NOT Include

- MongoDB (Phase 3B)
- Cache-Control headers (not needed without DB)
- Rate limiting (not needed at soft launch scale)
- OG meta tags / og-image (Phase 5)
- Custom domain (optional, can use `.vercel.app` for soft launch)
