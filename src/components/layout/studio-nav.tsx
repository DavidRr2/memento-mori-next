"use client";

// 파일 경로: src/components/layout/studio-nav.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [{ href: "/studio/library", label: "Library" }];

export function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[color:rgba(51,65,85,0.12)] text-[var(--primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-default)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
