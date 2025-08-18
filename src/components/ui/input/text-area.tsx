import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-foreground text-sm font-medium">
            {label}
          </label>
        )}
        <textarea
          id={id}
          className={cn(
            "border-input bg-background/60 placeholder:text-muted-foreground hover:border-ring/30 focus-visible:border-primary focus-visible:ring-primary/20 flex min-h-[90px] w-full resize-none rounded-lg border px-4 py-3 text-sm backdrop-blur-sm transition-all focus-visible:shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
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

TextArea.displayName = "TextArea";

export { TextArea };
