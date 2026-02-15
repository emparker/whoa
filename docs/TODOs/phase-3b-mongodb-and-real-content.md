# Phase 3: MongoDB & Real Content

## Context
Phases 1-2 are complete — the core game loop works with 30 hardcoded questions in `lib/questions.ts`. Phase 3 migrates the data source to MongoDB Atlas via Mongoose, adds caching and rate limiting, and prepares for Vercel deployment. The hardcoded array is preserved as both seed data and a fallback when MongoDB is unreachable.

## Files Overview

| File | Action | Purpose |
|------|--------|---------|
| `lib/db.ts` | **Create** | MongoDB connection singleton (global cache for serverless) |
| `lib/models/Question.ts` | **Create** | Mongoose schema + model with unique indexes on `date` and `questionNumber` |
| `scripts/seed-questions.ts` | **Create** | Upsert seed script with data validation |
| `.env.example` | **Create** | Documents `MONGODB_URI` and `NEXT_PUBLIC_SITE_URL` |
| `lib/questions.ts` | **Modify** | Export `QUESTIONS`, add `getTodayQuestionAsync()` (DB-first, hardcoded fallback) |
| `app/page.tsx` | **Modify** | Async Server Component, ISR with `revalidate = 3600` |
| `app/api/question/today/route.ts` | **Modify** | Async DB query, Cache-Control header, rate limiter (30 req/min/IP) |
| `package.json` | **Modify** | Add `mongoose`, `tsx`, `"seed"` script |
| `types/index.ts` | No change | Interface already compatible |

## Key Design Decisions

### 1. `_id` Handling
Let MongoDB use native ObjectId internally. Synthesize `_id` as the date string when mapping to the `Question` interface — zero downstream changes needed. No component ever reads `question._id`, so this is purely for type compatibility.

### 2. Fallback Strategy
`getTodayQuestionAsync()` wraps all DB calls in try/catch. On any failure (no env var, connection error, missing document), it silently falls back to existing `getTodayQuestion()` with a `console.error` for Vercel observability. The app never shows an error to users.

**Failure mode matrix:**

| Failure | Outcome | User Impact |
|---------|---------|-------------|
| `MONGODB_URI` not set | Dynamic import throws, caught, hardcoded fallback | None |
| Atlas unreachable | `mongoose.connect` times out, caught, hardcoded fallback | ~2-3s delay on first request |
| No document for today | `findOne` returns null, hardcoded fallback | None |
| Normal path | Returns DB document | None |
| Rate limit exceeded | 429 response | API route only, not page.tsx |

### 3. Rendering Strategy
`page.tsx` uses ISR (`export const revalidate = 3600`) — statically rendered, revalidated hourly. Avoids hitting MongoDB on every page load while staying fresh enough for daily questions. The first visitor after midnight UTC may see yesterday's question for up to 1 hour until ISR revalidates.

### 4. Seed Script Path Resolution
Uses relative imports (`../lib/questions`) instead of `@/` aliases since `tsx` doesn't reliably resolve tsconfig paths. Schema is redefined inline for the same reason.

### 5. Rate Limiter Scope
In-memory `Map` keyed by IP from `x-forwarded-for`. 30 req/min per IP. On Vercel serverless, each container has its own memory — the limiter resets on container recycle and isn't shared across containers. Acceptable for MVP.

---

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install mongoose && npm install --save-dev tsx
```
Adds `mongoose` to dependencies and `tsx` to devDependencies.

---

### Step 2: Create `lib/db.ts` — MongoDB Connection Singleton

Connection singleton that survives across Vercel serverless invocations by caching on the Node.js `global` object.

**Requirements:**
- Cache connection promise on `global.mongooseCache`
- `maxPoolSize: 5` (low pool for serverless)
- `bufferCommands: false` (fail fast when disconnected)
- Throw if `MONGODB_URI` not set (callers catch this)
- Clear cached promise on connection failure so next call retries
- Use `declare global { var mongooseCache }` pattern (TypeScript requires `var` for global augmentation)

---

### Step 3: Create `lib/models/Question.ts` — Mongoose Schema

**Schema fields (matching `types/index.ts` Question interface):**
- `date`: String, required, unique, `match: /^\d{4}-\d{2}-\d{2}$/`
- `questionNumber`: Number, required, unique
- `question`: String, required
- `answer`: Number, required
- `unit`: String, required
- `explanation`: String, required
- `source`: String, required
- `category`: String, required, enum: `["TIME", "SCALE", "HUMAN_BODY", "SPACE", "NATURE", "POP_CULTURE", "HISTORY", "WILD_CARD"]`
- `difficulty`: String, required, enum: `["easy", "medium", "hard"]`
- `hotRange`: Number, optional
- `warmRange`: Number, optional
- `timestamps: true` (adds `createdAt`/`updatedAt`)

**Guard against hot reload:**
```typescript
export default mongoose.models.Question || mongoose.model<QuestionDocument>("Question", QuestionSchema);
```

---

### Step 4: Modify `lib/questions.ts` — Add Async DB Fetching

**Changes:**
1. Add `export` to the `QUESTIONS` array declaration
2. Add `getTodayQuestionAsync()` function:
   - Dynamic-imports `@/lib/db` and `@/lib/models/Question` (so missing `MONGODB_URI` doesn't crash at module load)
   - Calls `connectDB()`, then `QuestionModel.findOne({ date: today }).lean()`
   - Maps Mongoose document to `Question` interface (explicit field mapping, synthesizes `_id` as `doc.date`)
   - Falls back to `getTodayQuestion()` on any error
3. Keep existing synchronous `getTodayQuestion()` unchanged as the fallback

---

### Step 5: Create `scripts/seed-questions.ts` — Seed Script

**Validation before DB operations:**
- No duplicate dates in `QUESTIONS`
- `questionNumber` values are sequential (1 through N with no gaps)
- Dates are contiguous (no day gaps between sorted dates)

**Seeding:**
- Connect to MongoDB using `MONGODB_URI` env var
- For each question: `findOneAndUpdate({ date: q.date }, { $set: q }, { upsert: true, new: true })`
- Report created vs updated counts
- Disconnect and exit

---

### Step 6: Modify `package.json` — Add Seed Script

Add to `"scripts"`:
```json
"seed": "tsx scripts/seed-questions.ts"
```

---

### Step 7: Modify `app/page.tsx` — Async Server Component with ISR

**Changes:**
- Import `getTodayQuestionAsync` instead of `getTodayQuestion`
- Add `export const revalidate = 3600`
- Make `Home()` async: `export default async function Home()`
- Await `getTodayQuestionAsync()`
- Everything else (JSX, props passed to GameBoard/Header) stays identical

---

### Step 8: Modify `app/api/question/today/route.ts` — Caching + Rate Limiting

**Rate limiter:**
- In-memory `Map<string, { count: number; resetAt: number }>`
- Key: first IP from `x-forwarded-for` header (Vercel always sets this)
- Limit: 30 requests per 60-second window
- Returns 429 JSON when exceeded

**Cache-Control:**
- Calculate seconds until midnight UTC
- Set `Cache-Control: public, max-age=<ttl>, s-maxage=<ttl>`
- `s-maxage` for Vercel CDN edge caching, `max-age` for browser
- `Math.max(1, ...)` to prevent 0 or negative TTL at midnight

**DB query:**
- Switch from `getTodayQuestion()` to `getTodayQuestionAsync()`

---

### Step 9: Create `.env.example`

```
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/way-off?retryWrites=true&w=majority

# Public site URL (used for share links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Verification Checklist

### A. Regression Test (no MongoDB)
- [ ] Remove/unset `MONGODB_URI` from `.env.local`
- [ ] `npm run dev` — app loads and works exactly as before
- [ ] Console shows `[questions] MongoDB error, using fallback:` message
- [ ] Play a full game — cookie persistence still works

### B. Seed Database
- [ ] Set `MONGODB_URI` in `.env.local`
- [ ] `npm run seed` — output: `Validation passed: 30 questions, dates 2026-02-09 to 2026-03-10`
- [ ] Output: `Done: 30 created, 0 updated`
- [ ] Run seed again — output: `Done: 0 created, 30 updated` (idempotent)
- [ ] Verify in MongoDB Compass: 30 docs, unique indexes on `date` and `questionNumber`

### C. Local with MongoDB
- [ ] `npm run dev` with `MONGODB_URI` set — shows today's question from DB
- [ ] No fallback warning in terminal
- [ ] `/api/question/today` returns JSON with `Cache-Control` header
- [ ] Hit API 31 times rapidly — 31st returns 429

### D. Build
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run start` serves production build correctly

### E. Vercel Deployment
- [ ] Push to GitHub, create Vercel project
- [ ] Add `MONGODB_URI` env var in Vercel dashboard
- [ ] Deploy — production URL loads today's question
- [ ] Verify `Cache-Control` headers on API route
- [ ] Cookie persistence works in production
- [ ] Test on mobile via social link share

---

## Files NOT Changed (Confirming No Breakage)
- `components/GameBoard.tsx` — same `Question` prop
- `components/Header.tsx` — same props
- `components/RevealScreen.tsx` — same props
- `components/ShareButton.tsx` — same props
- `hooks/usePersistedGame.ts` — same `Question` object
- `lib/cookies.ts` — unrelated to data source
- `lib/game-logic.ts` — unrelated to data source
- `lib/share.ts` — unrelated to data source
- All other components — no interface changes
