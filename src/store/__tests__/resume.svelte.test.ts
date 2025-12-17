// Mock console methods
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import { resumeStore } from "../resume.svelte";
import { initialResumeData } from "@/config/constants";
import type { ResumeData } from "@/types/resume";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

// Mock window.confirm and alert
const mockConfirm = vi.fn();
const mockAlert = vi.fn();

describe("Resume Store (Svelte)", () => {
  beforeAll(() => {
    // Setup window mocks
    vi.stubGlobal("localStorage", mockLocalStorage);
    vi.stubGlobal("confirm", mockConfirm);
    vi.stubGlobal("alert", mockAlert);
    vi.stubGlobal("window", {
      confirm: mockConfirm,
      alert: mockAlert,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mockLocalStorage.clear();
    mockConfirm.mockReset();
    mockAlert.mockReset();
    mockConfirm.mockReturnValue(true); // Default to confirm "yes"

    // Reset store state manually or via public API if possible.
    // Since we can't easily access the private store state, we rely on setResumeData
    // to reset the main data, and we might need to assume other fields are clean or irrelevant for basic tests.
    // Ideally we would have a 'resetForTest' method or similar.
    // For now, let's use the public resetResumeData with confirmed=true

    // We need to ensure we are in a clean state.
    // Force a reset by bypassing the confirmation check if we could, but we can just mock confirm.
    resumeStore.resetResumeData();
  });

  describe("setResumeData", () => {
    it("should update resume data", () => {
      const newData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
          email: "john@example.com",
        },
      };

      resumeStore.setResumeData(newData);

      expect(resumeStore.resumeData.personal.fullName).toBe("John Doe");
      expect(resumeStore.resumeData.personal.email).toBe("john@example.com");
    });
  });

  describe("resetResumeData", () => {
    it("should reset resume data to initial state when confirmed", () => {
      // First modify the data
      const modifiedData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "Jane Smith",
        },
      };

      resumeStore.setResumeData(modifiedData);
      expect(resumeStore.resumeData.personal.fullName).toBe("Jane Smith");

      // Then reset it
      mockConfirm.mockReturnValueOnce(true);
      resumeStore.resetResumeData();

      expect(resumeStore.resumeData.personal.fullName).toBe(
        initialResumeData.personal.fullName,
      );
      expect(resumeStore.resumeData.skills).toEqual(initialResumeData.skills);
    });

    it("should not reset if user cancels confirmation", () => {
      // Modify data
      const modifiedData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "Jane Smith",
        },
      };
      resumeStore.setResumeData(modifiedData);

      // Cancel reset
      mockConfirm.mockReturnValueOnce(false);
      resumeStore.resetResumeData();

      expect(resumeStore.resumeData.personal.fullName).toBe("Jane Smith");
    });
  });

  describe("importResumeData", () => {
    it("should import valid resume data", () => {
      const importedData: ResumeData = {
        personal: {
          fullName: "Imported Name",
          email: "imported@example.com",
          location: "New York, NY",
          phone: "123-456-7890",
          linkedin: "linkedin.com/in/imported",
          summary: "Experienced developer",
        },
        skills: [
          { id: "1", name: "JavaScript", category: "Programming" },
          { id: "2", name: "TypeScript", category: "Programming" },
        ],
        experience: [],
        education: [],
        projects: [],
      };

      resumeStore.importResumeData(importedData);

      expect(resumeStore.resumeData.personal.fullName).toBe("Imported Name");
      expect(resumeStore.resumeData.personal.email).toBe(
        "imported@example.com",
      );
      expect(resumeStore.resumeData.skills).toHaveLength(2);
      expect(mockAlert).toHaveBeenCalledWith(
        "Resume data imported successfully!",
      );
    });

    it("should reject invalid resume data", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidData = {
        personal: { fullName: "Invalid Data" },
        // Missing required arrays
      };

      resumeStore.importResumeData(invalidData);

      // State should remain unchanged (assuming it was initial)
      // Note: we reset in beforeEach so it is initial
      expect(resumeStore.resumeData.personal.fullName).toBe(
        initialResumeData.personal.fullName,
      );
      expect(mockAlert).toHaveBeenCalledWith(
        "Failed to import resume data. Please check the file format or console for errors.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("persistence", () => {
    it("should persist data to localStorage", async () => {
      // Need to wrap in a way that allows effect to run.
      // In Vitest with happy-dom, effects should run if we are careful.
      // However, svelte effects run asynchronously (microtasks).

      const testData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "Persistent Name",
        },
      };

      resumeStore.setResumeData(testData);

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const storedData = localStorage.getItem("resume-data");
      expect(storedData).not.toBeNull();
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // We implemented direct storage of state object (no 'state' wrapper unless read from legacy)
        // Wait, in ResumeStore we used PersistedState which does:
        // localStorage.setItem(this.key, JSON.stringify(this.value));
        // And ResumeStore used key "resume-data" and value type ResumeStateData.

        // So parsed should be ResumeStateData
        expect(parsed.resumeData.personal.fullName).toBe("Persistent Name");
      }
    });

    // Testing hydration is harder because the store is a singleton instantiated at module load.
    // We can't easily re-instantiate it with new localStorage values unless we export the class.
    // For now, we skip hydration test or accept that we tested the logic in PersistedState if we tested that separately.
    // But we didn't write tests for PersistedState separately.
  });
});
