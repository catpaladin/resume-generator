"use client";

import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ResumeData } from '@/types/resume';
import {
  HeaderSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  ProjectsSection
} from './preview';

interface ClientResumePreviewProps {
  data: ResumeData;
}

export function ClientResumePreview({ data }: ClientResumePreviewProps) {
  const { theme, setTheme } = useTheme();

  const handlePrint = async () => {
    const currentTheme = theme;
    setTheme('light');
    await new Promise(resolve => setTimeout(resolve, 100));
    window.print();
    setTimeout(() => {
      setTheme(currentTheme);
    }, 100);
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-bold text-foreground">Resume Preview</h2>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Download size={18} />
          Export PDF
        </button>
      </div>

      <div className="space-y-6" id="resume-preview">
        <HeaderSection data={data.personal} />

        {data.skills.some(skill => skill.name) && (
          <SkillsSection skills={data.skills} />
        )}

        {data.experience.some(exp => exp.company || exp.position) && (
          <ExperienceSection experiences={data.experience} />
        )}

        {data.education.some(edu => edu.school || edu.degree) && (
          <EducationSection education={data.education} />
        )}

        {data.projects.some(proj => proj.name || proj.description) && (
          <ProjectsSection projects={data.projects} />
        )}
      </div>

      <style jsx global>{`
        @media print {
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }

          @page {
            size: letter;
            margin: 0.5in;
          }

          /* Hide everything except resume */
          body > * {
            display: none !important;
          }

          /* Show only resume content */
          #resume-preview {
            display: block !important;
            position: relative !important;
            padding: 0 !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Ensure proper color printing */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Remove Card styles for print */
          [class*="Card"] {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: none !important;
          }
        }
      `}</style>
    </Card>
  );
}
