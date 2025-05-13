"use client";

import { useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { exportResumeData } from '@/lib/utils'; // Make sure this path is correct

export function HeaderActions() {
  const resumeData = useResumeStore((state) => state.resumeData);
  const resetData = useResumeStore((state) => state.resetResumeData);
  const importData = useResumeStore((state) => state.importResumeData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        importData(imported); // Pass parsed data to store action
      } catch (error) {
        console.error('Failed to read or parse file:', error);
        alert('Failed to import resume data. Please check the file format.');
      }

      // Reset file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => exportResumeData(resumeData)} // Use resumeData from store
        className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs hover:bg-primary/90"
        title="Export Data"
      >
        <Download size={14} />
        Save
      </button>
      <button
        onClick={() => fileInputRef.current?.click()} // Trigger hidden input
        className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md text-xs hover:bg-green-700"
        title="Import Data"
      >
        <Upload size={14} />
        Import
      </button>
      <button
        onClick={resetData} // Use resetData from store
        className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md text-xs hover:bg-red-700"
        title="Reset All Data"
      >
        <Trash2 size={14} />
        Reset
      </button>

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
