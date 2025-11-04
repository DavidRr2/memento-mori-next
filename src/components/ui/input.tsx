 "use client";

// 파일 경로: src/components/ui/input.tsx

import {
  forwardRef,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type FieldState = "default" | "focus" | "error" | "disabled";

interface BaseFieldProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  state?: FieldState;
  requiredIndicator?: boolean;
}

const fieldStateClasses: Record<FieldState, string> = {
  default:
    "border-[var(--border)] bg-[color:rgba(15,23,42,0.02)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color:rgba(37,99,235,0.25)] focus-visible:outline-none",
  focus:
    "border-[var(--accent)] ring-2 ring-[color:rgba(37,99,235,0.25)] bg-[var(--bg-surface)]",
  error:
    "border-[var(--warn)] ring-2 ring-[color:rgba(245,158,11,0.3)] bg-[var(--bg-surface)]",
  disabled:
    "border-[var(--border)] bg-[color:rgba(148,163,184,0.12)] text-[color:rgba(102,112,133,0.7)] cursor-not-allowed placeholder:text-[color:rgba(102,112,133,0.6)]",
};

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    BaseFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      state = "default",
      requiredIndicator,
      className,
      ...props
    },
    ref,
  ) => {
    const showError = state === "error" && errorText;
    return (
      <div className="flex flex-col gap-2 text-[var(--text-default)]">
        {label && (
          <label className="text-sm font-medium text-[var(--text-muted)]">
            {label}
            {requiredIndicator && (
              <span className="text-[var(--warn)] ml-1">*</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          data-state={state}
          className={cn(
            "h-11 w-full rounded-[var(--radius-md)] px-3 text-sm transition-all duration-150 placeholder:text-[var(--text-muted)]",
            fieldStateClasses[state],
            className,
          )}
          {...props}
        />
        {showError ? (
          <p className="text-sm text-[var(--warn)]">{errorText}</p>
        ) : helperText ? (
          <p className="text-sm text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorText,
      state = "default",
      requiredIndicator,
      className,
      ...props
    },
    ref,
  ) => {
    const showError = state === "error" && errorText;
    return (
      <div className="flex flex-col gap-2 text-[var(--text-default)]">
        {label && (
          <label className="text-sm font-medium text-[var(--text-muted)]">
            {label}
            {requiredIndicator && (
              <span className="text-[var(--warn)] ml-1">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          data-state={state}
          className={cn(
            "min-h-[120px] w-full rounded-[var(--radius-md)] px-3 py-3 text-sm transition-all duration-150 resize-vertical placeholder:text-[var(--text-muted)]",
            fieldStateClasses[state],
            className,
          )}
          {...props}
        />
        {showError ? (
          <p className="text-sm text-[var(--warn)]">{errorText}</p>
        ) : helperText ? (
          <p className="text-sm text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    BaseFieldProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      errorText,
      state = "default",
      requiredIndicator,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const showError = state === "error" && errorText;
    return (
      <div className="flex flex-col gap-2 text-[var(--text-default)]">
        {label && (
          <label className="text-sm font-medium text-[var(--text-muted)]">
            {label}
            {requiredIndicator && (
              <span className="text-[var(--warn)] ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            data-state={state}
            className={cn(
              "h-11 w-full appearance-none rounded-[var(--radius-md)] px-3 pr-10 text-sm transition-all duration-150 placeholder:text-[var(--text-muted)]",
              fieldStateClasses[state],
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <svg
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {showError ? (
          <p className="text-sm text-[var(--warn)]">{errorText}</p>
        ) : helperText ? (
          <p className="text-sm text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
