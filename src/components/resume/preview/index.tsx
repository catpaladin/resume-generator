import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useTheme } from "next-themes";
import type { ResumeData } from "@/types/resume";

// Import the sections that are being used in the JSX
import { HeaderSection } from "./header-section";
import { SkillsSection } from "./skills-section";
import { ExperienceSection } from "./experience-section";
import { EducationSection } from "./education-section";
import { ProjectsSection } from "./projects-section";

// Re-export the sections for use by other components
export { HeaderSection } from "./header-section";
export { ExperienceSection } from "./experience-section";
export { EducationSection } from "./education-section";
export { ProjectsSection } from "./projects-section";
export { SkillsSection } from "./skills-section";

interface ResumePreviewProps {
  data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { theme, setTheme } = useTheme();

  const handlePrint = async () => {
    const currentTheme = theme || "dark";
    setTheme("light");
    await new Promise((resolve) => setTimeout(resolve, 100));
    window.print();
    setTimeout(() => setTheme(currentTheme), 100);
  };

  return (
    <Card className="bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold">Resume Preview</h2>
        <button
          onClick={handlePrint}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
        >
          <Download size={18} />
          Export PDF
        </button>
      </div>

      <div className="space-y-6" id="resume-preview">
        <HeaderSection data={data.personal} />
        <SkillsSection skills={data.skills} />
        <ExperienceSection experiences={data.experience} />
        <EducationSection education={data.education} />
        <ProjectsSection projects={data.projects} />
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Card>
  );
}
