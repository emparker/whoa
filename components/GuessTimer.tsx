"use client";

import { useEffect, useRef, useState } from "react";

interface GuessTimerProps {
  running: boolean;
  durationMs: number;
  onTimeout: () => void;
}

const COLOR_START = "#6366F1";
const COLOR_WARN = "#F59E0B";
const COLOR_DANGER = "#EF4444";

export default function GuessTimer({
  running,
  durationMs,
  onTimeout,
}: GuessTimerProps) {
  const [barColor, setBarColor] = useState(COLOR_START);
  const [animating, setAnimating] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear all timers
    const clearTimers = () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };

    if (!running) {
      clearTimers();
      setAnimating(false);
      setBarColor(COLOR_START);
      return;
    }

    // Double rAF to force reflow before starting CSS transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true);
      });
    });

    // Color transitions
    const warnAt = durationMs - 3000;
    const dangerAt = durationMs - 1500;

    if (warnAt > 0) {
      timeoutsRef.current.push(
        setTimeout(() => setBarColor(COLOR_WARN), warnAt)
      );
    }
    if (dangerAt > 0) {
      timeoutsRef.current.push(
        setTimeout(() => setBarColor(COLOR_DANGER), dangerAt)
      );
    }

    // Timeout callback
    timeoutsRef.current.push(setTimeout(onTimeout, durationMs));

    return clearTimers;
  }, [running, durationMs, onTimeout]);

  return (
    <div
      className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden"
      role="timer"
      aria-label={running ? "Guess timer running" : "Guess timer stopped"}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: animating ? "0%" : "100%",
          background: barColor,
          transition: animating
            ? `width ${durationMs}ms linear, background-color 300ms ease`
            : "none",
        }}
      />
    </div>
  );
}
