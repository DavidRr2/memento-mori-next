// 파일 경로: src/app/studio/layout.tsx

import type { ReactNode } from "react";
import Link from "next/link";
import { StudioNav } from "@/components/layout/studio-nav";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-default)]">
      <aside className="hidden min-h-screen w-[280px] flex-col gap-6 border-r border-[var(--border)] bg-[var(--bg-surface)] px-6 py-8 lg:flex">
        <Link
          href="/"
          className="text-lg font-semibold text-[var(--text-default)]"
        >
          Creator Studio
        </Link>
        <StudioNav />
        <div className="mt-auto rounded-[var(--radius-md)] bg-[color:rgba(15,23,42,0.04)] p-4 text-sm text-[var(--text-muted)]">
          Memories stay private until you lock and confirm release.
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[var(--bg-default)]">
        {children}
      </main>
    </div>
  );
}

