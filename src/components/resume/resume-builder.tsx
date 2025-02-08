"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Download, Upload, Trash2 } from "lucide-react";
import { exportResumeData } from "@/lib/utils";
import { TabConfig } from "@/config/constants";
import {
  EducationForm,
  ExperienceForm,
  PersonalInfoForm,
  ProjectsForm,
  SkillsForm,
} from "./form";
import type { ResumeData } from "@/types/resume";
import type { TabType } from "@/types/common";

interface ClientResumeBuilderProps {
  data: ResumeData;
  updateSection: <K extends keyof ResumeData>(
    section: K,
    value: ResumeData[K],
  ) => void;
  resetData: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ClientResumeBuilder({
  data,
  updateSection,
  resetData,
  onImport,
}: ClientResumeBuilderProps) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await onImport(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <PersonalInfoForm
            data={data.personal}
            onChange={(field, value) =>
              updateSection("personal", { ...data.personal, [field]: value })
            }
          />
        );
      case "skills":
        return (
          <SkillsForm
            skills={data.skills}
            onChange={(skills) => updateSection("skills", skills)}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            experiences={data.experience}
            onChange={(experiences) => updateSection("experience", experiences)}
          />
        );
      case "education":
        return (
          <EducationForm
            education={data.education}
            onChange={(education) => updateSection("education", education)}
          />
        );
      case "projects":
        return (
          <ProjectsForm
            projects={data.projects}
            onChange={(projects) => updateSection("projects", projects)}
          />
        );
    }
  };

  return (
    <>
      <Card className="p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Resume Builder</h2>
          <div className="flex gap-2">
            <button
              onClick={() => exportResumeData(data)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm hover:bg-primary/90"
              title="Export Data"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700"
              title="Import Data"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={resetData}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700"
              title="Reset All Data"
            >
              <Trash2 size={16} />
              Reset
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </Card>

      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {TabConfig.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shrink-0
              ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }
            `}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <Card className="p-4 flex-1 overflow-y-auto">{renderTabContent()}</Card>
    </>
  );
}
