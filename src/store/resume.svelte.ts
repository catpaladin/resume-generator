/**
 * Svelte 5 Store for Resume Data
 * Replaces src/store/resumeStore.ts
 */
import { PersistedState } from "../lib/persistence.svelte";
import { getInitialResumeData } from "../config/constants";
import type {
  ResumeData,
  AIEnhancementSettings,
  ValidationIssue,
} from "../types/resume";
import { validateResumeData } from "../lib/validators/schemas";

// Replicate constants
const DEFAULT_AI_SETTINGS: AIEnhancementSettings = {
  provider: "gemini",
  model: "gemini-1.5-flash",
  apiKey: "",
  temperature: 0.7,
  improveWriting: true,
  fixGrammar: true,
  optimizeKeywords: true,
  customInstructions: "",
};

interface UIState {
  isUploading: boolean;
  isGenerating: boolean;
  activeSection: string;
  viewMode: "editor" | "preview";
  showPreview: boolean;
  sidebarOpen: boolean;
  validationErrors: ValidationIssue[];
  showJsonImport: boolean;
  showHistory: boolean;
  showSettings: boolean;
}

class ResumeStore {
  // Persisted state
  #store = new PersistedState<{
    resumeData: ResumeData;
    aiSettings: AIEnhancementSettings;
  }>("resume-data", {
    resumeData: getInitialResumeData(),
    aiSettings: DEFAULT_AI_SETTINGS,
  });

  // Local UI state (not persisted)
  #uiState = $state<UIState>({
    isUploading: false,
    isGenerating: false,
    activeSection: "personal",
    viewMode: "editor",
    showPreview: false,
    sidebarOpen: true,
    validationErrors: [],
    showJsonImport: false,
    showHistory: false,
    showSettings: false,
  });

  // Getters
  get resumeData() {
    return this.#store.value.resumeData;
  }
  get aiSettings() {
    return this.#store.value.aiSettings;
  }
  get uiState() {
    return this.#uiState;
  }

  // Actions
  setResumeData(data: ResumeData) {
    this.#store.value.resumeData = data;
  }

  updateSection(section: keyof ResumeData, data: any) {
    this.#store.value.resumeData = {
      ...this.#store.value.resumeData,
      [section]: data,
    };
  }

  updateAISettings(settings: Partial<AIEnhancementSettings>) {
    this.#store.value.aiSettings = {
      ...this.#store.value.aiSettings,
      ...settings,
    };
  }

  setUIState(state: Partial<UIState>) {
    this.#uiState = { ...this.#uiState, ...state };
  }

  resetResumeData() {
    if (
      typeof window !== "undefined" &&
      !confirm(
        "Are you sure you want to reset all data? This cannot be undone.",
      )
    ) {
      return;
    }
    this.#store.value.resumeData = getInitialResumeData();
    this.#uiState.validationErrors = [];
  }

  importResumeData(data: unknown) {
    const result = validateResumeData(data);
    if (result.success && result.data) {
      this.#store.value.resumeData = result.data;
      if (typeof window !== "undefined") {
        alert("Resume data imported successfully!");
      }
    } else {
      console.error("Invalid resume data:", result.errors);
      if (typeof window !== "undefined") {
        alert(
          "Failed to import resume data. Please check the file format or console for errors.",
        );
      }
    }
  }

  // Array manipulation helpers
  addArrayItem<T>(section: keyof ResumeData, item: T) {
    const current = this.#store.value.resumeData[section];
    if (Array.isArray(current)) {
      this.updateSection(section, [...current, item]);
    }
  }

  removeArrayItem(section: keyof ResumeData, index: number) {
    const current = this.#store.value.resumeData[section];
    if (Array.isArray(current)) {
      this.updateSection(
        section,
        current.filter((_, i) => i !== index),
      );
    }
  }

  updateArrayItem<T>(
    section: keyof ResumeData,
    index: number,
    updates: Partial<T>,
  ) {
    const current = this.#store.value.resumeData[section];
    if (Array.isArray(current)) {
      const newArray = [...current];
      newArray[index] = { ...newArray[index], ...updates };
      this.updateSection(section, newArray);
    }
  }

  moveArrayItem(section: keyof ResumeData, fromIndex: number, toIndex: number) {
    const current = this.#store.value.resumeData[section] as any[];
    if (!Array.isArray(current)) return;

    const newArray = [...current];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);

    this.updateSection(section, newArray);
  }
}

export const resumeStore = new ResumeStore();
