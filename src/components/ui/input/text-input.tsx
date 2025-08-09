import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, type = "text", label, error, icon, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-input bg-background/60 px-4 py-3 text-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground hover:border-ring/30 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-11",
              error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              className,
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${id}-error`}
            className="text-destructive text-sm font-medium"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

export { TextInput };
