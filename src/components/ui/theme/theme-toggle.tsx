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
      className="relative inline-flex h-9 w-16 items-center rounded-full border-2 border-muted bg-muted px-1 transition-colors hover:bg-muted/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span
        className={` ${theme === "dark" ? "translate-x-6" : "translate-x-0"} inline-block h-6 w-6 transform rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out`}
      />
      <Sun className="absolute left-1.5 h-5 w-5 rotate-0 scale-100 text-primary transition-all dark:rotate-90 dark:scale-0" />
      <Moon className="absolute right-1.5 h-5 w-5 rotate-90 scale-0 text-primary transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
