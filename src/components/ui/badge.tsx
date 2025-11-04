// 파일 경로: src/components/ui/badge.tsx

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeType = "info" | "success" | "warn" | "neutral";
type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type?: BadgeType;
  size?: BadgeSize;
}

const badgeTypeClasses: Record<BadgeType, string> = {
  info: "bg-[color:rgba(37,99,235,0.12)] text-[var(--accent)]",
  success: "bg-[color:rgba(22,163,74,0.12)] text-[var(--success)]",
  warn: "bg-[color:rgba(245,158,11,0.12)] text-[var(--warn)]",
  neutral: "bg-[color:rgba(15,23,42,0.08)] text-[var(--text-muted)]",
};

const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: "h-[18px] px-2 text-xs",
  md: "h-[22px] px-2.5 text-sm",
};

export function Badge({
  type = "neutral",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium tracking-tight",
        badgeTypeClasses[type],
        badgeSizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

