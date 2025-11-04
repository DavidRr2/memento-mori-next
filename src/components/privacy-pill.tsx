 "use client";

// 파일 경로: src/components/privacy-pill.tsx

import { cn } from "@/lib/utils";

type PrivacyLevel = "Only Me" | "Selected Heirs" | "All Heirs" | "Never Publish";

interface PrivacyPillProps {
  level: PrivacyLevel;
  onClick?: () => void;
  active?: boolean;
}

const levelCopy: Record<PrivacyLevel, string> = {
  "Only Me": "Only Me",
  "Selected Heirs": "Selected Heirs",
  "All Heirs": "All Heirs",
  "Never Publish": "Never Publish",
};

export function PrivacyPill({ level, onClick, active }: PrivacyPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-[var(--accent)] bg-[color:rgba(37,99,235,0.12)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
      )}
    >
      <span className="text-xs">🔒</span>
      {levelCopy[level]}
    </button>
  );
}

