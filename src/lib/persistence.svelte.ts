// Generic persistence handler for Svelte 5 Runes

export class PersistedState<T> {
  key: string;
  #value: T = $state() as T;

  constructor(key: string, initialValue: T) {
    this.key = key;
    this.#value = initialValue;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Handle legacy Zustand format (it wraps state in { state: ... })
          if (parsed && typeof parsed === "object" && "state" in parsed) {
            // Merge initial value with stored state to ensure new fields exist
            this.#value = { ...initialValue, ...parsed.state };
          } else {
            this.#value = { ...initialValue, ...parsed };
          }
        } catch (e) {
          console.error(`Failed to parse stored value for key "${key}"`, e);
        }
      }

      // Auto-save effect
      $effect.root(() => {
        $effect(() => {
          localStorage.setItem(this.key, JSON.stringify(this.value));
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
