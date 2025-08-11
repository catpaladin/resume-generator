"use client";

import { ResumeBuilderContainer } from "@/components/resume/resume-builder-container";
import { ResumePreviewContainer } from "@/components/resume/resume-preview-container";
import { SectionsNav } from "@/components/resume/sections-nav";
import { Printer } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { useEffect, useState } from "react";

export default function HomePageContent() {
  const resumeData = useResumeStore((state) => state.resumeData);
  const setResumeData = useResumeStore((state) => state.setResumeData);

  // Render after client mounts to avoid SSR/CSR mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container grid items-start gap-8 pb-8 pt-6 md:grid-cols-2">
      <div className="flex flex-col space-y-6">
        <ResumeBuilderContainer data={resumeData} onUpdate={setResumeData} />
      </div>

      <div className="hidden md:block">
        <SectionsNav />
        <ResumePreviewContainer data={resumeData} />
      </div>

      <div className="fixed bottom-6 right-6 md:hidden print:hidden">
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
