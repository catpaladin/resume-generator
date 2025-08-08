"use client";

import { ResumeBuilderContainer } from "@/components/resume/resume-builder-container";
import { ResumePreviewContainer } from "@/components/resume/resume-preview-container";
import { SectionsNav } from "@/components/resume/sections-nav";
import { Printer } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";

export default function HomePage() {
  const resumeData = useResumeStore((state) => state.resumeData);
  const setResumeData = useResumeStore((state) => state.setResumeData);

  return (
    <div className="container grid items-start gap-8 pb-10 pt-6 md:grid-cols-2">
      <div className="flex flex-col space-y-6">
        <ResumeBuilderContainer data={resumeData} onUpdate={setResumeData} />
      </div>

      <div className="hidden md:block">
        <SectionsNav />
        <div className="sticky top-24">
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
