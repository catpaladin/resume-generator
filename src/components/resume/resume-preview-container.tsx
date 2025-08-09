import { ClientResumePreview } from "./resume-preview";
import type { ResumeData } from "@/types/resume";

interface ResumePreviewContainerProps {
  data: ResumeData;
}

export function ResumePreviewContainer({ data }: ResumePreviewContainerProps) {
  return (
    <div className="preview-light p-4">
      <ClientResumePreview data={data} />
    </div>
  );
}
