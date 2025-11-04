 "use client";

// 파일 경로: src/components/memory-player.tsx

import { ReactNode } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type MemoryPlayerMode = "photo" | "video" | "text";

export interface MemoryPlayerProps {
  open: boolean;
  mode: MemoryPlayerMode;
  title: string;
  description?: string;
  mediaUrl?: string;
  transcriptUrl?: string;
  captions?: string;
  relatedLink?: ReactNode;
  metadata?: Array<{ label: string; value: string }>;
  onClose: () => void;
  onTakeBreak?: () => void;
}

export function MemoryPlayer({
  open,
  mode,
  title,
  description,
  mediaUrl,
  transcriptUrl,
  captions,
  relatedLink,
  metadata,
  onClose,
  onTakeBreak,
}: MemoryPlayerProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      widthClassName="max-w-[960px]"
      footer={
        <div className="flex items-center gap-2">
          {onTakeBreak && (
            <Button variant="ghost" onClick={onTakeBreak}>
              Take a breather
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {mode === "photo" && (
            <div className="relative h-[360px] overflow-hidden rounded-[var(--radius-lg)] bg-[color:rgba(15,23,42,0.1)]">
              {mediaUrl ? (
                <Image
                  src={mediaUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 960px) 100vw, 640px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
                  Photo placeholder
                </div>
              )}
            </div>
          )}
          {mode === "video" && (
            <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] bg-[color:rgba(15,23,42,0.1)]">
              {mediaUrl ? (
                <video src={mediaUrl} controls className="h-full w-full" muted />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
                  Video starts muted with captions on.
                </div>
              )}
              <Badge
                type="neutral"
                size="sm"
                className="absolute left-4 top-4"
              >
                Captions ON · Muted
              </Badge>
            </div>
          )}
          {mode === "text" && (
            <article className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] p-6 shadow-[var(--elev-1)]">
              <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                <span>Reading mode</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    A-
                  </Button>
                  <Button variant="ghost" size="sm">
                    A+
                  </Button>
                  <Button variant="ghost" size="sm">
                    Read aloud
                  </Button>
                </div>
              </div>
              <p className="text-base leading-relaxed text-[var(--text-default)]">
                {captions ||
                  "A calm reading mode with increased line height and gentle pacing helps heirs process letters in their own time."}
              </p>
            </article>
          )}
          {captions && mode !== "text" && (
            <div className="rounded-[var(--radius-md)] bg-[color:rgba(15,23,42,0.05)] px-4 py-3 text-sm text-[var(--text-muted)]">
              {captions}
            </div>
          )}
          {relatedLink}
        </div>
        <aside className="space-y-4">
          <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-default)]">
              Details
            </h3>
            <div className="mt-3 space-y-3 text-sm text-[var(--text-muted)]">
              {(metadata ?? []).map((item) => (
                <div key={item.label}>
                  <p className="font-medium text-[var(--text-default)]">
                    {item.label}
                  </p>
                  <p>{item.value}</p>
                </div>
              ))}
              {transcriptUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(transcriptUrl, "_blank")}
                >
                  Download transcript
                </Button>
              )}
            </div>
          </section>
          <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-default)]">
              Emotional safety
            </h3>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Take breaks whenever you need. When you close the player we will
              remember your progress.
            </p>
            <Button
              className="mt-4 w-full"
              variant="secondary"
              onClick={onTakeBreak}
            >
              Take a breather
            </Button>
          </section>
        </aside>
      </div>
    </Modal>
  );
}
