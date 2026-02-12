import { Guess } from "@/types";
import { formatNum } from "./game-logic";

export function generateShareText(
  questionNum: number,
  guesses: Guess[],
  solved: boolean,
  answer: number,
  unit: string,
  url: string
): string {
  const emojis = guesses
    .map((g) => (g.timedOut ? "⏰" : g.feedback.emoji))
    .join(" ");
  const result = solved ? emojis : `${emojis} ❌`;

  const lines: string[] = [
    `🎯 Whoa! #${questionNum}`,
    "",
    result,
    "",
  ];

  // Avg response time (only for non-timed-out guesses with real response times)
  const validTimes = guesses
    .filter((g) => !g.timedOut && g.responseTime > 0)
    .map((g) => g.responseTime);
  if (validTimes.length > 0) {
    const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    lines.push(`Avg response: ${(avg / 1000).toFixed(1)}s`);
  }

  // "Off by" line — use first non-timed-out guess
  const firstReal = guesses.find((g) => !g.timedOut);
  if (firstReal) {
    const firstOff = Math.abs(firstReal.value - answer);
    lines.push(`Off by ${formatNum(firstOff)} ${unit} at first 😅`);
  }

  lines.push(url);

  return lines.join("\n");
}
