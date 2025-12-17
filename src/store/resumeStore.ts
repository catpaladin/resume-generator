/**
 * @deprecated This store is being replaced by src/store/resume.svelte.ts
 * Please use the Svelte 5 Runes store for new development.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ResumeData, AISettings } from "@/types/resume";
import type { AIEnhancementResult, AISuggestion } from "@/types/ai-enhancement";
import { initialResumeData } from "@/config/constants";
import { usageTracker } from "@/lib/ai/usage-tracker";
import { enhancementHistory } from "@/lib/ai/enhancement-history";

const STORAGE_KEY = "resume-data";

// Helper to apply an AI suggestion to resume data
function applyAISuggestion(
  data: ResumeData,
  suggestion: AISuggestion,
): ResumeData {
  // For now, return the suggested value directly in the enhanced data
  // This is a placeholder implementation - proper field path parsing would be more complex
  console.log(
    "Applying AI suggestion:",
    suggestion.field,
    suggestion.suggestedValue,
  );

  // Return original data for now - in a full implementation, you'd parse the field path
  // and apply the specific change to that field
  return data;
}

// Helper to check if data is valid ResumeData
function isValidResumeData(data: unknown): data is ResumeData {
  return (
    data !== null &&
    typeof data === "object" &&
    "personal" in data &&
    "skills" in data &&
    "experience" in data &&
    "education" in data &&
    "projects" in data &&
    Array.isArray((data as ResumeData).skills) &&
    Array.isArray((data as ResumeData).experience) &&
    Array.isArray((data as ResumeData).education) &&
    Array.isArray((data as ResumeData).projects)
  );
}

interface ResumeState {
  resumeData: ResumeData;
  aiSettings: AISettings | null;
  aiEnhancementResult: AIEnhancementResult | null;
  isAIEnhancing: boolean;
  setResumeData: (newData: ResumeData) => void;
  setAISettings: (settings: AISettings | null) => void;
  setAIEnhancement: (result: AIEnhancementResult | null) => void;
  setAIEnhancing: (enhancing: boolean) => void;
  acceptAISuggestion: (suggestionId: string) => void;
  rejectAISuggestion: (suggestionId: string) => void;
  acceptAllAISuggestions: () => void;
  rejectAllAISuggestions: () => void;
  resetResumeData: () => void;
  importResumeData: (importedData: unknown) => void; // Takes unknown first for validation
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumeData: initialResumeData, // Default initial state
      aiSettings: null,
      aiEnhancementResult: null,
      isAIEnhancing: false,
      setResumeData: (newData) => set({ resumeData: newData }),
      setAISettings: (settings) => set({ aiSettings: settings }),
      setAIEnhancement: (result) => set({ aiEnhancementResult: result }),
      setAIEnhancing: (enhancing) => set({ isAIEnhancing: enhancing }),

      acceptAISuggestion: (suggestionId) => {
        const state = get();
        if (!state.aiEnhancementResult) return;

        const suggestion = state.aiEnhancementResult.suggestions.find(
          (s) => s.id === suggestionId,
        );
        if (!suggestion) return;

        // Apply the suggestion to the resume data
        const updatedData = applyAISuggestion(state.resumeData, suggestion);

        // Mark suggestion as accepted
        const updatedSuggestions = state.aiEnhancementResult.suggestions.map(
          (s) => (s.id === suggestionId ? { ...s, accepted: true } : s),
        );

        // Record action in enhancement history
        const currentHistoryEntry = enhancementHistory.getHistory({}, 1)[0];
        if (currentHistoryEntry) {
          enhancementHistory.recordSuggestionAction(
            currentHistoryEntry.id,
            suggestionId,
            "accepted",
          );
        }

        set({
          resumeData: updatedData,
          aiEnhancementResult: {
            ...state.aiEnhancementResult,
            suggestions: updatedSuggestions,
          },
        });
      },

      rejectAISuggestion: (suggestionId) => {
        const state = get();
        if (!state.aiEnhancementResult) return;

        const updatedSuggestions = state.aiEnhancementResult.suggestions.map(
          (s) => (s.id === suggestionId ? { ...s, accepted: false } : s),
        );

        // Record action in enhancement history
        const currentHistoryEntry = enhancementHistory.getHistory({}, 1)[0];
        if (currentHistoryEntry) {
          enhancementHistory.recordSuggestionAction(
            currentHistoryEntry.id,
            suggestionId,
            "rejected",
          );
        }

        set({
          aiEnhancementResult: {
            ...state.aiEnhancementResult,
            suggestions: updatedSuggestions,
          },
        });
      },

      acceptAllAISuggestions: () => {
        const state = get();
        if (!state.aiEnhancementResult) return;

        // Use the enhanced data directly
        set({
          resumeData: state.aiEnhancementResult.enhancedData,
          aiEnhancementResult: {
            ...state.aiEnhancementResult,
            suggestions: state.aiEnhancementResult.suggestions.map((s) => ({
              ...s,
              accepted: true,
            })),
          },
        });
      },

      rejectAllAISuggestions: () => {
        const state = get();
        if (!state.aiEnhancementResult) return;

        // Use the original data
        set({
          resumeData: state.aiEnhancementResult.originalData,
          aiEnhancementResult: {
            ...state.aiEnhancementResult,
            suggestions: state.aiEnhancementResult.suggestions.map((s) => ({
              ...s,
              accepted: false,
            })),
          },
        });
      },

      resetResumeData: () => {
        if (
          window.confirm(
            "Are you sure you want to reset all data? This cannot be undone.",
          )
        ) {
          set({
            resumeData: initialResumeData,
            aiEnhancementResult: null,
          });
          // persist middleware handles saving to localStorage
        }
      },

      importResumeData: (importedData) => {
        try {
          if (!isValidResumeData(importedData)) {
            throw new Error("Invalid resume data format");
          }
          set({
            resumeData: importedData,
            aiEnhancementResult: null, // Clear AI enhancement when importing new data
          });
          // persist middleware handles saving to localStorage
          alert("Resume data imported successfully!");
        } catch (error) {
          console.error("Failed to import resume data:", error);
          alert(
            "Failed to import resume data. Please check the file format or console for errors.",
          );
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Custom hydration logic to validate data from localStorage
      onRehydrateStorage: () => {
        console.log("Hydrating store from localStorage...");
        return (rehydratedState, error) => {
          if (error) {
            console.error("Failed to hydrate store:", error);
          } else if (rehydratedState) {
            if (isValidResumeData(rehydratedState.resumeData)) {
              console.log("Hydration successful with valid data.");
              // No need to explicitly call set() here, middleware handles it
            } else {
              console.warn(
                "Invalid data found in localStorage, resetting to initial.",
              );
              rehydratedState.resumeData = initialResumeData; // Reset if data is invalid
            }
          }
        };
      },
    },
  ),
);
