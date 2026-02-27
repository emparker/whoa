# Dev Testing Harness

## Problem
Testing the game requires manually typing URLs like `localhost:3000?date=2026-02-12` and memorizing which date maps to which question. There's no way to reset game state without manually clearing cookies in browser devtools.

## Solution
A dedicated `/dev` route and a `?q=N` query param that together provide a frictionless testing workflow — with zero impact on the production game.

## Changes

### 1. Add `?q=N` query param support
**Files:** `app/page.tsx`, `lib/questions.ts`

- `app/page.tsx` — Read `params.q` from searchParams alongside existing `params.date`. Pass it to a new lookup function.
- `lib/questions.ts` — Add `getQuestionByNumber(n: number)` that finds a question by its `questionNumber` field. Falls back to `getTodayQuestion()` if not found.
- Gated behind `NODE_ENV === "development"`, same as the existing `?date=` param.

**Example:** `localhost:3000/?q=7` loads question #7 (sneeze speed).

### 2. Add `/dev` route
**File:** `app/dev/page.tsx`

A development-only page that returns 404 in production. Contains:

- **Question list** — Table of all available questions showing: question number, date, title, answer, unit, difficulty. Each row links to `/?q=N` for one-click play.
- **Current cookie state** — Reads and displays the decoded `way-off_state` cookie so you can see guesses, streak, win/loss status at a glance.
- **Reset button** — Clears the `way-off_state` cookie and reloads the page, giving a fresh game state.

### 3. What stays untouched
- **All game components** — GameBoard, GuessInput, GuessTimer, RevealScreen, etc. No changes.
- **Cookie logic** — No changes. Reset button calls existing `clearGameState()`.
- **Production behavior** — Both `?q=` and `/dev` are gated behind `NODE_ENV === "development"`.
- **No new dependencies.**

## Testing workflow
1. `npm run dev`
2. Visit `localhost:3000/dev`
3. Browse all questions, click one to play
4. Play the game exactly as a real user would
5. To replay: go back to `/dev`, hit reset, click the same question (or a different one)

## Why not a dev toolbar?
- Overlays interfere with mobile layout testing — defeats the purpose
- Adds conditional debug UI paths into game components
- Throwaway code that serves no production purpose
- A separate route is cleaner separation of concerns
