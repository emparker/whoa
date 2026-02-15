# Way Off — Your Brain vs. Reality

A daily estimation game where players guess real-world numbers with hot/cold feedback. One question per day, five guesses, spoiler-free emoji sharing.

How close is your instinct? Find out daily.

## How It Works

1. A new question drops every day at midnight UTC
2. You get **5 guesses** to estimate a real-world number
3. Each guess gets feedback: how close you are and which direction to go
4. A **10-second timer** per guess keeps the pressure on
5. Share your spoiler-free emoji result with friends

### Feedback System

| Emoji | Level | Accuracy |
|-------|-------|----------|
| ✅ | Exact | Within 2% |
| 🔥 | Hot | Within 5% |
| 🌡️ | Warm | Within 20% |
| ❄️ | Cold | Over 20% off |

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS (dark mode only)
- **State:** Cookie-based persistence (no auth required)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Dev Mode

Append `?date=YYYY-MM-DD` to test any question by date:

```
http://localhost:3000?date=2026-02-15
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/            → Pages, layouts, API routes
components/     → React components (GameBoard, RevealScreen, etc.)
hooks/          → Custom hooks (usePersistedGame)
lib/            → Game logic, cookie management, share text generation
types/          → TypeScript interfaces
docs/           → Architecture docs and roadmap
```

## License

Private — not open source.
