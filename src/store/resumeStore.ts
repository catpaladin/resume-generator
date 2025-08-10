import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ResumeData, AISettings } from "@/types/resume";
import { initialResumeData } from "@/config/constants";

const STORAGE_KEY = "resume-data";

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
  setResumeData: (newData: ResumeData) => void;
  setAISettings: (settings: AISettings | null) => void;
  resetResumeData: () => void;
  importResumeData: (importedData: unknown) => void; // Takes unknown first for validation
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resumeData: initialResumeData, // Default initial state
      aiSettings: null,
      setResumeData: (newData) => set({ resumeData: newData }),
      setAISettings: (settings) => set({ aiSettings: settings }),
      resetResumeData: () => {
        if (
          window.confirm(
            "Are you sure you want to reset all data? This cannot be undone.",
          )
        ) {
          set({ resumeData: initialResumeData });
          // persist middleware handles saving to localStorage
        }
      },
      importResumeData: (importedData) => {
        try {
          if (!isValidResumeData(importedData)) {
            throw new Error("Invalid resume data format");
          }
          set({ resumeData: importedData });
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
