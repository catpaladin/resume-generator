import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/config/constants";

export function usePersistedState<T>(
  key: string,
  initialState: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state with a function to avoid unnecessary JSON parsing on every render
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialState;

    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialState;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, state]);

  return [state, setState];
}

export function clearPersistedState(key: keyof typeof STORAGE_KEYS): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

export function getPersistedState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return fallback;
  }
}
