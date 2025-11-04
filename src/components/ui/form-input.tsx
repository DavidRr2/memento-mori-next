"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  state?: "default" | "focus" | "error" | "disabled";
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, helperText, errorText, state = "default", className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <Input
          ref={ref}
          label={label}
          helperText={helperText}
          errorText={errorText}
          state={state}
          className={cn(className)}
          {...props}
        />
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

