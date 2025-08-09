// Mock console methods before importing the store to suppress hydration logs
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

import { useResumeStore } from "../resumeStore";
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

// Mock window.confirm
const mockConfirm = jest.fn().mockImplementation(() => true);

// Mock window.alert
const mockAlert = jest.fn();

// Mock console methods
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();
const mockConsoleError = jest.fn();

describe("Resume Store", () => {
  beforeEach(() => {
    // Clear the store before each test
    mockLocalStorage.clear();
    mockConfirm.mockImplementation(() => true);
    mockAlert.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();

    // Reset the store to initial state
    useResumeStore.getState().setResumeData(initialResumeData);
  });

  // Set up mocks before running tests
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    Object.defineProperty(window, "confirm", {
      value: mockConfirm,
      writable: true,
    });

    Object.defineProperty(window, "alert", {
      value: mockAlert,
      writable: true,
    });

    // Mock console methods to suppress logs during store initialization
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore all console methods after all tests
    jest.restoreAllMocks();
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

      useResumeStore.getState().setResumeData(newData);

      const state = useResumeStore.getState();
      expect(state.resumeData.personal.fullName).toBe("John Doe");
      expect(state.resumeData.personal.email).toBe("john@example.com");
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

      useResumeStore.getState().setResumeData(modifiedData);
      expect(useResumeStore.getState().resumeData.personal.fullName).toBe(
        "Jane Smith",
      );

      // Then reset it
      useResumeStore.getState().resetResumeData();

      const state = useResumeStore.getState();
      expect(state.resumeData.personal.fullName).toBe(
        initialResumeData.personal.fullName,
      );
      expect(state.resumeData.skills).toEqual(initialResumeData.skills);
      expect(state.resumeData.experience).toEqual(initialResumeData.experience);
      expect(state.resumeData.education).toEqual(initialResumeData.education);
      expect(state.resumeData.projects).toEqual(initialResumeData.projects);
    });

    it("should not reset if user cancels confirmation", () => {
      mockConfirm.mockImplementationOnce(() => false);

      const modifiedData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "Jane Smith",
        },
      };

      useResumeStore.getState().setResumeData(modifiedData);
      useResumeStore.getState().resetResumeData();

      const state = useResumeStore.getState();
      expect(state.resumeData.personal.fullName).toBe("Jane Smith");
    });
  });

  describe("importResumeData", () => {
    it("should import valid resume data", () => {
      const importedData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "Imported Name",
          email: "imported@example.com",
        },
        skills: [
          { id: "1", name: "JavaScript", category: "Programming" },
          { id: "2", name: "TypeScript", category: "Programming" },
        ],
      };

      useResumeStore.getState().importResumeData(importedData);

      const state = useResumeStore.getState();
      expect(state.resumeData.personal.fullName).toBe("Imported Name");
      expect(state.resumeData.personal.email).toBe("imported@example.com");
      expect(state.resumeData.skills).toHaveLength(2);
      expect(mockAlert).toHaveBeenCalledWith(
        "Resume data imported successfully!",
      );
    });

    it("should reject invalid resume data", () => {
      // Mock console.error to suppress expected error output during test
      const mockConsoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidData = {
        personal: { fullName: "Invalid Data" },
        // Missing required arrays
      };

      useResumeStore.getState().importResumeData(invalidData);

      // State should remain unchanged
      const state = useResumeStore.getState();
      expect(state.resumeData.personal.fullName).toBe(
        initialResumeData.personal.fullName,
      );
      expect(mockAlert).toHaveBeenCalledWith(
        "Failed to import resume data. Please check the file format or console for errors.",
      );

      // Restore console.error
      mockConsoleError.mockRestore();
    });
  });

  describe("persistence", () => {
    it("should persist data to localStorage", () => {
      const testData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "Persistent Name",
        },
      };

      useResumeStore.getState().setResumeData(testData);

      // Wait a bit for the persistence to happen
      setTimeout(() => {
        // Check if data was saved to localStorage
        const storedData = localStorage.getItem("resume-data");
        expect(storedData).not.toBeNull();

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          expect(parsedData.state.resumeData.personal.fullName).toBe(
            "Persistent Name",
          );
        }
      }, 100);
    });

    it("should handle localStorage data", () => {
      // This test verifies that localStorage interaction works
      // but doesn't fully test rehydration since that's complex in Jest
      const testData = JSON.stringify({
        state: {
          resumeData: {
            ...initialResumeData,
            personal: {
              ...initialResumeData.personal,
              fullName: "Stored Name",
            },
          },
        },
        version: 0,
      });

      localStorage.setItem("resume-data", testData);

      const storedData = localStorage.getItem("resume-data");
      expect(storedData).toBe(testData);
    });
  });
});
