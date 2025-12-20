import { vi } from "vitest";
import "@testing-library/jest-dom";

// Map jest to vi for compatibility
const jestCompat = {
  fn: vi.fn,
  mock: vi.mock,
  spyOn: vi.spyOn,
  useFakeTimers: vi.useFakeTimers,
  useRealTimers: vi.useRealTimers,
  advanceTimersByTime: vi.advanceTimersByTime,
  requireActual: vi.importActual,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

(globalThis as any).jest = jestCompat;

// Mock lucide-svelte to prevent import errors in logic files importing constants
vi.mock("lucide-svelte", () => {
  return {
    User: "User",
    Lightbulb: "Lightbulb",
    Briefcase: "Briefcase",
    GraduationCap: "GraduationCap",
    Code: "Code",
  };
});

// Mock react for hooks usage in logic files (if any)
vi.mock("react", () => ({
  useState: (init: any) => [init, vi.fn()],
  useEffect: vi.fn(),
  useCallback: (fn: any) => fn,
  useMemo: (fn: any) => fn(),
  useRef: (val: any) => ({ current: val }),
}));
