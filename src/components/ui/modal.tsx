 "use client";

// 파일 경로: src/components/ui/modal.tsx

import { ReactNode, useEffect } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  widthClassName?: string;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  footer,
  children,
  widthClassName = "max-w-[720px]",
}: ModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay-scrim)] px-4 py-10">
      <div
        className={cn(
          "w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-surface)] shadow-[var(--elev-2)]",
          widthClassName,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-8 py-6">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-[var(--text-default)]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {description}
                </p>
              )}
            </div>
            <Button
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-8 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] bg-[color:rgba(15,23,42,0.02)] px-8 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
