"use client";

import { ResumeBuilderContainer } from "@/components/resume/resume-builder-container";
import { ResumePreviewContainer } from "@/components/resume/resume-preview-container";
import { initialResumeData } from "@/config/constants";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import type { ResumeData } from "@/types/resume";

const STORAGE_KEY = "resume-data";

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

export default function HomePage() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (isValidResumeData(parsed)) {
            return parsed;
          }
        } catch (error) {
          console.error("Failed to parse saved resume data:", error);
        }
      }
    }
    return initialResumeData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
  }, [resumeData]);

  const handleUpdateData = (newData: ResumeData) => {
    setResumeData(newData);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all data? This cannot be undone.",
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setResumeData(initialResumeData);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!isValidResumeData(imported)) {
        throw new Error("Invalid resume data format");
      }

      // Update state and localStorage
      setResumeData(imported);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));

      alert("Resume data imported successfully!");
    } catch (error) {
      console.error("Failed to import resume data:", error);
      alert("Failed to import resume data. Please check the file format.");
    }
  };

  return (
    <div className="container grid items-start gap-6 pb-8 pt-6 md:grid-cols-2">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground">
            Create a professional resume in minutes. Fill in your details and
            see the live preview.
          </p>
        </div>

        <ResumeBuilderContainer
          data={resumeData}
          onUpdate={handleUpdateData}
          onReset={handleReset}
          onImport={handleImport}
        />
      </div>

      <div className="hidden md:block">
        <div className="sticky top-20">
          <ResumePreviewContainer data={resumeData} />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={() => window.print()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          aria-label="Print Resume"
        >
          <Printer className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
