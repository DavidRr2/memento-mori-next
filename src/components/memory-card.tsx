 "use client";

// 파일 경로: src/components/memory-card.tsx

import { HTMLAttributes, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MemoryType = "photo" | "video" | "text";
type MemoryCardSize = "s" | "m" | "l";
type MemoryCardState = "default" | "hover" | "selected" | "locked";

export interface MemoryCardProps extends HTMLAttributes<HTMLDivElement> {
  memoryType?: MemoryType;
  size?: MemoryCardSize;
  state?: MemoryCardState;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  durationLabel?: string;
  locked?: boolean;
  sensitive?: boolean;
  footer?: ReactNode;
}

const sizeMap: Record<MemoryCardSize, string> = {
  s: "w-[224px] min-h-[268px]",
  m: "w-[288px] min-h-[344px]",
  l: "w-[320px] min-h-[400px]",
};

const typeCopy: Record<MemoryType, string> = {
  photo: "Photo",
  video: "Video",
  text: "Letter",
};

export function MemoryCard({
  memoryType = "photo",
  size = "m",
  state = "default",
  title,
  subtitle,
  thumbnailUrl,
  durationLabel,
  locked,
  sensitive,
  footer,
  className,
  children,
  ...props
}: MemoryCardProps) {
  const visualState =
    locked && state !== "selected" ? "locked" : (state as MemoryCardState);
  return (
    <div
      data-state={visualState}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-surface)] shadow-[var(--elev-1)] transition-transform duration-200",
        "ring-0 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.12)]",
        visualState === "selected" &&
          "ring-2 ring-[color:rgba(37,99,235,0.35)] shadow-[var(--elev-2)]",
        visualState === "locked" && "opacity-80",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      <div className="relative flex-1 bg-[color:rgba(30,41,59,0.12)]">
        {thumbnailUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-muted)]">
            {typeCopy[memoryType]}
          </div>
        )}
        <div className="absolute left-4 top-4">
          <Badge size="sm" type="info">
            {typeCopy[memoryType]}
          </Badge>
        </div>
        {(locked || sensitive) && (
          <div className="absolute right-4 top-4 flex gap-2 text-[var(--text-muted)]">
            {locked && <LockIcon />}
            {sensitive && <ShieldIcon />}
          </div>
        )}
        {children}
      </div>
      <div className="grid gap-1.5 border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
        <p className="truncate text-sm font-semibold text-[var(--text-default)]">
          {title}
        </p>
        {subtitle && (
          <p className="line-clamp-2 text-sm text-[var(--text-muted)]">
            {subtitle}
          </p>
        )}
        {durationLabel && (
          <p className="text-xs text-[var(--text-muted)]">{durationLabel}</p>
        )}
        {footer}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="10.5" r=".8" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <path
        d="M8 1.5 3 3.5v4c0 3.2 2.1 6.1 5 7 2.9-.9 5-3.8 5-7v-4L8 1.5Z"
        strokeLinejoin="round"
      />
      <path d="m6.2 7.9 1.5 1.6 2.5-3" strokeLinecap="round" />
    </svg>
  );
}
