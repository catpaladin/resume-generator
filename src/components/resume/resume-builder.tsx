"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
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
}

export function ClientResumeBuilder({
  data,
  updateSection,
}: ClientResumeBuilderProps) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");

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
