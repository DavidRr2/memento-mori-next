 "use client";

// 파일 경로: src/components/pause-card.tsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface PauseCardProps {
  onResume?: () => void;
  durationSeconds?: number;
}

export function PauseCard({
  onResume,
  durationSeconds = 60,
}: PauseCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="w-full max-w-md rounded-[var(--radius-2xl)] bg-[var(--bg-surface)] p-8 text-center shadow-[var(--elev-2)]">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">
        Take a moment
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--text-default)]">
        Breathe in, breathe out
      </h2>
      <div className="relative mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full border border-[color:rgba(148,163,184,0.4)]">
        <div className="absolute inset-3 animate-pulse rounded-full border border-[color:rgba(51,65,85,0.18)]" />
        <span className="text-2xl font-semibold tabular-nums">
          {minutes}:{seconds}
        </span>
      </div>
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        Ready when you are. We will be right here.
      </p>
      <Button className="mt-6 w-full" variant="primary" onClick={onResume}>
        Resume when you’re ready
      </Button>
    </div>
  );
}

