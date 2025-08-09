import { ClientResumeBuilder } from "./resume-builder";
import type { ResumeData } from "@/types/resume";

interface ResumeBuilderContainerProps {
  data: ResumeData;
  onUpdate: (data: ResumeData) => void;
}

export function ResumeBuilderContainer({
  data,
  onUpdate,
}: ResumeBuilderContainerProps) {
  const handleUpdateSection = <K extends keyof ResumeData>(
    section: K,
    value: ResumeData[K],
  ) => {
    onUpdate({
      ...data,
      [section]: value,
    });
  };

  return (
    <div className="flex min-h-0 flex-col">
      <ClientResumeBuilder data={data} updateSection={handleUpdateSection} />
    </div>
  );
}
