import { useCallback } from "react";
import { usePersistedState } from "./use-persisted-state";
import { STORAGE_KEYS, initialResumeData } from "@/config/constants";
import type { ResumeData } from "@/types/resume";

interface UseResumeDataReturn {
  data: ResumeData;
  updateSection: <K extends keyof ResumeData>(
    section: K,
    value: ResumeData[K],
  ) => void;
  resetData: (data?: ResumeData) => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
}

export function useResumeData(): UseResumeDataReturn {
  const [data, setData] = usePersistedState<ResumeData>(
    STORAGE_KEYS.RESUME_DATA,
    initialResumeData,
  );

  const updateSection = useCallback(
    <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => {
      setData((prev) => ({
        ...prev,
        [section]: value,
      }));
    },
    [setData],
  );

  const resetData = useCallback(
    (newData: ResumeData = initialResumeData) => {
      setData(newData);
    },
    [setData],
  );

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const importedData = JSON.parse(text) as ResumeData;

        // Validate imported data structure
        const requiredKeys: (keyof ResumeData)[] = [
          "personal",
          "skills",
          "experience",
          "education",
          "projects",
        ];

        const hasAllRequiredKeys = requiredKeys.every((key) =>
          Object.prototype.hasOwnProperty.call(importedData, key),
        );

        if (!hasAllRequiredKeys) {
          throw new Error("Invalid resume data format");
        }

        setData(importedData);
      } catch (error) {
        throw new Error(
          "Failed to import resume data: " + (error as Error).message,
        );
      }
    },
    [setData],
  );

  return {
    data,
    updateSection,
    resetData,
    exportData,
    importData,
  };
}
