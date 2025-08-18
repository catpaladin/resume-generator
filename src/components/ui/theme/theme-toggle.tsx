"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only mounting after client-side render
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="border-muted bg-muted hover:bg-muted/90 focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-9 w-16 items-center rounded-full border-2 px-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span
        className={` ${theme === "dark" ? "translate-x-6" : "translate-x-0"} bg-background inline-block h-6 w-6 transform rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out`}
      />
      <Sun className="text-primary absolute left-1.5 h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
      <Moon className="text-primary absolute right-1.5 h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </button>
  );
}
