import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

export interface EnhancedSelectProps {
  value?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const EnhancedSelect = React.forwardRef<
  HTMLDivElement,
  EnhancedSelectProps
>(
  (
    {
      value,
      placeholder = "Select an option",
      options,
      onChange,
      className,
      disabled = false,
    },
    _ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(value || "");

    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
      setIsOpen(false);
    }, isOpen);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const selectedOption = options.find(
      (option) => option.value === selectedValue,
    );
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    return (
      <div ref={dropdownRef} className={`relative ${className || ""}`}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background/60 px-3 py-2 text-sm backdrop-blur-sm transition-all hover:border-ring/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            !selectedValue ? "text-muted-foreground" : ""
          }`}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-input bg-background shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              >
                <span>{option.label}</span>
                {selectedValue === option.value && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

EnhancedSelect.displayName = "EnhancedSelect";
