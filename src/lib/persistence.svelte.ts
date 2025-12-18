// Generic persistence handler for Svelte 5 Runes
import { untrack } from "svelte";

export class PersistedState<T> {
  key: string;
  #value: T = $state() as T;

  constructor(key: string, initialValue: T) {
    this.key = key;
    this.#value = initialValue;

    if (typeof window !== "undefined") {
      // Use $effect.root to ensure this persists outside component lifecycle
      $effect.root(() => {
        // 1. Load data after mount to avoid hydration mismatch
        $effect(() => {
          const stored = localStorage.getItem(this.key);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const data =
                parsed && typeof parsed === "object" && "state" in parsed
                  ? parsed.state
                  : parsed;

              // Merge with initial value to ensure new fields exist
              untrack(() => {
                this.#value = { ...initialValue, ...data };
              });
            } catch (e) {
              console.error(
                `Failed to parse stored value for key "${this.key}"`,
                e,
              );
            }
          }
        });

        // 2. Auto-save effect: Use $state.snapshot to track deep changes
        $effect(() => {
          const val = $state.snapshot(this.#value);
          untrack(() => {
            localStorage.setItem(this.key, JSON.stringify(val));
          });
        });
      });
    }
  }

  get value() {
    return this.#value;
  }

  set value(newValue: T) {
    this.#value = newValue;
  }
}
