import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  showIcon?: boolean;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, error, showIcon = true, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-foreground text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          {showIcon && (
            <CalendarIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          )}
          <input
            id={id}
            type="date"
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              showIcon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive",
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

DateInput.displayName = "DateInput";

export { DateInput };
