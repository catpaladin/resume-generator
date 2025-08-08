"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
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
      <div className="no-scrollbar mb-3 flex items-center gap-1 overflow-x-auto pb-1">
        {TabConfig.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            type="button"
            variant={activeTab === id ? "default" : "secondary"}
            size="sm"
            className="h-8 shrink-0 rounded-full px-3 text-xs md:text-sm"
            aria-pressed={activeTab === id}
            onClick={() => setActiveTab(id as TabType)}
          >
            <span className="inline-flex items-center gap-1">
              <Icon size={14} />
              <span className="truncate">{label}</span>
            </span>
          </Button>
        ))}
      </div>

      <Card className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-4 shadow-sm supports-[backdrop-filter]:bg-card/60">
        {renderTabContent()}
      </Card>
    </>
  );
}
