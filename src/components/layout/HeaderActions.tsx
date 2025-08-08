"use client";

import { useRef } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { exportResumeData } from "@/lib/utils"; // Make sure this path is correct
import { Button } from "@/components/ui/button/button";

export function HeaderActions() {
  const resumeData = useResumeStore((state) => state.resumeData);
  const resetData = useResumeStore((state) => state.resetResumeData);
  const importData = useResumeStore((state) => state.importResumeData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        importData(imported); // Pass parsed data to store action
      } catch (error) {
        console.error("Failed to read or parse file:", error);
        alert("Failed to import resume data. Please check the file format.");
      }

      // Reset file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => exportResumeData(resumeData)}
        title="Export Data"
      >
        <Download size={14} className="mr-1" />
        Save
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        title="Import Data"
      >
        <Upload size={14} className="mr-1" />
        Import
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={resetData}
        title="Reset All Data"
      >
        <Trash2 size={14} className="mr-1" />
        Reset
      </Button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
