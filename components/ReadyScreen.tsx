"use client";

import { Category } from "@/types";

interface ReadyScreenProps {
  questionNumber: number;
  category: Category;
  onReady: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  TIME: "Time",
  SCALE: "Scale",
  HUMAN_BODY: "Human Body",
  SPACE: "Space",
  NATURE: "Nature",
  POP_CULTURE: "Pop Culture",
  HISTORY: "History",
  WILD_CARD: "Wild Card",
};

export default function ReadyScreen({
  questionNumber,
  category,
  onReady,
}: ReadyScreenProps) {
  return (
    <div className="pt-16 text-center animate-fadeIn">
      <div className="text-text-muted text-sm font-medium mb-3">
        #{questionNumber}
      </div>

      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-8 bg-accent/15 text-accent border border-accent/25">
        {CATEGORY_LABELS[category] ?? category}
      </div>

      <div className="text-text-secondary text-base mb-10 leading-relaxed">
        You&apos;ll have <strong className="text-text-primary">10 seconds</strong> per guess
      </div>

      <button
        type="button"
        onClick={onReady}
        className="w-full py-4 text-lg font-semibold text-white rounded-xl transition-transform active:scale-95"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
        }}
      >
        I&apos;m Ready
      </button>
    </div>
  );
}
