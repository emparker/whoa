/**
 * Seed Questions — 6 Months of Launch Content (182 Questions)
 *
 * For future MongoDB migration (Phase 3b).
 * Currently questions are hardcoded in lib/questions.ts.
 *
 * CATEGORY SPREAD (182 total):
 *   TIME         26
 *   HUMAN_BODY   26
 *   SCALE        32
 *   SPACE        22
 *   NATURE       26
 *   HISTORY      22
 *   WILD_CARD    28
 *
 * SEEDING:
 *   Questions are assigned sequential dates from LAUNCH_DATE.
 *   Run: npx tsx scripts/seed-questions-6months.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const LAUNCH_DATE = new Date("2026-03-01");

async function seed() {
  if (!MONGODB_URI) {
    console.error("Set MONGODB_URI in .env.local");
    process.exit(1);
  }

  // Dynamic import to avoid compile errors when mongoose model doesn't exist yet
  const { default: QuestionModel } = await import("@/lib/models/Question");
  const { getTodayQuestion } = await import("@/lib/questions");

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Import questions from the hardcoded array and assign dates
  const { QUESTIONS } = await import("@/lib/questions");

  console.log(`\nSeeded ${QUESTIONS.length} questions`);
  console.log(`${QUESTIONS[0].date} -> ${QUESTIONS[QUESTIONS.length - 1].date}`);

  const byCategory = QUESTIONS.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\nCategory breakdown:");
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

  await mongoose.disconnect();
  console.log("\nDone!");
}

seed().catch(console.error);
