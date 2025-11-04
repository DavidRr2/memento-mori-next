 "use client";

// 파일 경로: src/components/ui/button.tsx

import {
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonState = "default" | "hover" | "pressed" | "disabled";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-white shadow-[var(--elev-1)] hover:bg-[#263246] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(51,65,85,0.6)]",
  secondary:
    "bg-[var(--bg-surface)] text-[var(--primary)] border border-[var(--border)] hover:border-[color:rgba(51,65,85,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(51,65,85,0.35)]",
  ghost:
    "bg-transparent text-[var(--primary)] hover:bg-[color:rgba(51,65,85,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(51,65,85,0.35)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm gap-2",
  md: "h-12 px-5 text-sm gap-2.5",
  lg: "h-[56px] px-6 text-base gap-3",
};

const stateClasses: Record<ButtonState, string> = {
  default: "",
  hover: "ring-2 ring-[color:rgba(51,65,85,0.18)]",
  pressed: "translate-y-[1px] scale-[0.99]",
  disabled:
    "opacity-60 cursor-not-allowed pointer-events-none",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      state = "default",
      icon,
      trailingIcon,
      className,
      children,
      disabled,
      asChild,
      ...props
    },
    ref,
  ) => {
    const computedState = disabled ? "disabled" : state;
    const content = (
      <button
        ref={ref}
        data-variant={variant}
        data-size={size}
        data-state={computedState}
        disabled={disabled || state === "disabled"}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-all duration-150 focus-visible:ring-0",
          variantClasses[variant],
          sizeClasses[size],
          stateClasses[computedState],
          className,
        )}
        {...props}
      >
        {icon && <span className="inline-flex items-center">{icon}</span>}
        <span className="truncate">{children}</span>
        {trailingIcon && (
          <span className="inline-flex items-center">{trailingIcon}</span>
        )}
      </button>
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(
        child,
        {
          className: cn(
            child.props?.className,
            "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-all duration-150 focus-visible:ring-0",
            variantClasses[variant],
            sizeClasses[size],
            stateClasses[computedState],
            className,
          ),
          "data-variant": variant,
          "data-size": size,
          "data-state": computedState,
        } as any,
      );
    }

    return content;
  },
);

Button.displayName = "Button";
