"use client";

import React, { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import type { ResumeData } from "@/types/resume";
import { SkillsSection } from "./preview/skills-section";

interface ClientResumePreviewProps {
  data: ResumeData;
}

// Tailwind-inspired color palette with improved contrast
const COLOR_PALETTE = {
  primary: "#000000", // black
  secondary: "#374151", // gray-700
  muted: "#4b5563", // gray-600
  subtle: "#9ca3af", // gray-400
  border: "#e5e7eb", // gray-200
};

export function ClientResumePreview({ data }: ClientResumePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;

    try {
      setIsExporting(true);

      // Create new document with A4 dimensions
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Page management
      const checkForNewPage = (additionalHeight: number = 0) => {
        if (currentY + additionalHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      const addSection = (title: string) => {
        checkForNewPage(10);
        currentY += 6;

        doc.setFontSize(12);
        doc.setTextColor(COLOR_PALETTE.primary);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin, currentY);

        // Add subtle divider line
        currentY += 2;
        doc.setDrawColor(COLOR_PALETTE.border);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);

        currentY += 6;
      };

      const addSubheading = (text: string, details?: string) => {
        checkForNewPage(8);

        doc.setFontSize(11);
        doc.setTextColor(COLOR_PALETTE.secondary);
        doc.setFont("helvetica", "bold");
        doc.text(text, margin, currentY);

        if (details) {
          doc.setFontSize(10);
          doc.setTextColor(COLOR_PALETTE.subtle);
          doc.setFont("helvetica", "normal");
          doc.text(
            details,
            pageWidth - margin - doc.getTextWidth(details),
            currentY,
          );
        }
        currentY += 6;
      };

      const addBodyText = (text: string, indent: number = 0) => {
        if (!text) return;

        doc.setFontSize(10);
        doc.setTextColor(COLOR_PALETTE.muted);
        doc.setFont("helvetica", "normal");

        const splitText = doc.splitTextToSize(
          text,
          pageWidth - margin * 2 - indent,
        );

        // Check if we need a new page
        checkForNewPage(splitText.length * 5);

        doc.text(splitText, margin + indent, currentY);
        currentY += splitText.length * 5;
      };

      const addBulletPoint = (text: string) => {
        if (!text) return;

        const bulletIndent = 6;
        const maxWidth = pageWidth - margin * 2 - bulletIndent;
        const splitText = doc.splitTextToSize(text, maxWidth);

        // Check if we need a new page
        checkForNewPage(splitText.length * 5);

        doc.setFontSize(10);
        doc.setTextColor(COLOR_PALETTE.muted);
        doc.text("•", margin + 2, currentY);
        doc.text(splitText, margin + bulletIndent, currentY);

        currentY += splitText.length * 5;
      };

      // Header (Personal Info)
      const { personal } = data;
      doc.setFontSize(16);
      doc.setTextColor(COLOR_PALETTE.primary);
      doc.setFont("helvetica", "bold");
      doc.text(personal.fullName.toUpperCase(), pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 10;

      // Contact Info
      doc.setFontSize(10);
      doc.setTextColor(COLOR_PALETTE.subtle);
      doc.setFont("helvetica", "normal");
      const contactInfo = [
        personal.location,
        personal.email,
        personal.phone,
        personal.linkedin,
      ]
        .filter(Boolean)
        .join(" | ");
      doc.text(contactInfo, pageWidth / 2, currentY, { align: "center" });
      currentY += 10;

      // Professional Summary
      if (personal.summary) {
        addSection("PROFESSIONAL SUMMARY");
        addBodyText(personal.summary);
        currentY += 6;
      }

      // Skills
      if (data.skills?.length > 0 && data.skills.some((skill) => skill.name)) {
        addSection("SKILLS"); // Main "SKILLS" section title

        const groupSkillsForPdf = (skillsToGroup: typeof data.skills) => {
          const grouped: { [category: string]: string[] } = {};
          skillsToGroup.forEach((skill) => {
            if (skill.name) {
              const category = skill.category || "General Skills";
              if (!grouped[category]) {
                grouped[category] = [];
              }
              grouped[category].push(skill.name);
            }
          });
          return grouped;
        };

        const groupedSkills = groupSkillsForPdf(data.skills);
        let firstCategory = true;

        Object.entries(groupedSkills).forEach(([category, skillNames]) => {
          if (skillNames.length > 0) {
            if (!firstCategory) {
              currentY += 3; // Add a small gap between categories
            }
            firstCategory = false;

            checkForNewPage(6); // Estimate for category title height
            doc.setFontSize(11);
            doc.setTextColor(COLOR_PALETTE.secondary);
            doc.setFont("helvetica", "bold");
            doc.text(category, margin, currentY);
            currentY += 5; // Space after category title before skills list

            const skillsText = skillNames.join(", ");
            addBodyText(skillsText, 4); // Indent skill list (4mm)
            // addBodyText handles its own currentY updates and page checks
          }
        });
        currentY += 4; // Space before the next major section
      }

      // Professional Experience
      if (data.experience?.length > 0) {
        addSection("PROFESSIONAL EXPERIENCE");

        data.experience.forEach((exp) => {
          if (!exp.company) return;

          addSubheading(
            exp.company,
            `${exp.startDate || ""} - ${exp.endDate || "Present"}`,
          );

          doc.setFontSize(10);
          doc.setTextColor(COLOR_PALETTE.muted);
          doc.text(exp.position || "", margin, currentY);
          currentY += 5;

          if (exp.location) {
            doc.setTextColor(COLOR_PALETTE.subtle);
            doc.text(exp.location, margin, currentY);
            currentY += 5;
          }

          exp.bulletPoints.forEach((point) => {
            if (point.text) {
              addBulletPoint(point.text);
            }
          });

          currentY += 4;
        });
      }

      // Education
      if (data.education?.length > 0) {
        addSection("EDUCATION");

        data.education.forEach((edu) => {
          if (!edu.school) return;

          addSubheading(edu.school, edu.graduationYear || "");

          if (edu.degree) {
            doc.setFontSize(10);
            doc.setTextColor(COLOR_PALETTE.muted);
            doc.text(edu.degree, margin, currentY);
            currentY += 6;
          }
        });
      }

      // Projects
      if (data.projects?.length > 0) {
        addSection("PROJECTS");

        data.projects.forEach((proj) => {
          if (!proj.name) return;

          addSubheading(proj.name, proj.link || "");

          if (proj.description) {
            addBodyText(proj.description);
          }

          currentY += 4;
        });
      }

      // Save PDF with sanitized filename
      const sanitizedName = personal.fullName
        ? personal.fullName
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .toLowerCase()
        : "resume";

      doc.save(`${sanitizedName}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="bg-card p-6">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h2 className="text-foreground text-xl font-bold">Resume Preview</h2>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          {isExporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div
        ref={previewRef}
        id="resume-preview"
        className="border-border mx-auto w-[816px] max-w-full space-y-6 rounded-lg border bg-white p-8 text-black shadow-sm sm:p-10 print:w-full print:space-y-4 print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        <div
          className="scroll-mt-24 text-center print:break-inside-avoid"
          id="section-header"
        >
          <h1 className="text-primary mb-2 text-2xl font-bold uppercase">
            {isMounted ? data.personal?.fullName || "" : ""}
          </h1>
          <p className="text-foreground/80 text-sm">
            {isMounted
              ? [
                  // Conditionally render contact info
                  data.personal.location,
                  data.personal.email,
                  data.personal.phone,
                  data.personal.linkedin,
                ]
                  .filter(Boolean)
                  .join(" | ")
              : ""}
          </p>
        </div>

        {/* Professional Summary */}
        {isMounted && data.personal.summary && (
          <section
            id="section-summary"
            className="scroll-mt-24 print:break-inside-avoid"
          >
            <h2 className="border-border text-primary mb-2 border-b pb-1 text-base font-bold uppercase">
              Professional Summary
            </h2>
            <p className="text-foreground/80 text-sm">
              {data.personal.summary}
            </p>
          </section>
        )}

        {/* Skills */}
        {data.skills?.some((skill) => skill.name) && (
          <section
            id="section-skills"
            className="scroll-mt-24 print:break-inside-avoid"
          >
            <SkillsSection skills={data.skills} />
          </section>
        )}

        {/* Professional Experience */}
        {isMounted &&
          data.experience?.some((exp) => exp.company || exp.position) && (
            <section
              id="section-experience"
              className="scroll-mt-24 print:break-inside-avoid"
            >
              <h2 className="border-border text-primary mb-2 border-b pb-1 text-base font-bold uppercase">
                Professional Experience
              </h2>
              {data.experience.map(
                (exp, index) =>
                  exp.company && (
                    // Use <details> for each experience
                    <details
                      key={index}
                      className="group border-border/50 mb-2 border-b pb-2 last:border-b-0 print:break-inside-avoid"
                    >
                      {/* Use <summary> for the clickable header */}
                      <summary className="hover:bg-muted/50 flex cursor-pointer list-none items-start justify-between rounded-md p-2 group-open:mb-1">
                        <div className="mr-2 flex-grow text-left">
                          <h3 className="text-foreground text-base font-semibold">
                            {exp.company}
                          </h3>
                          <div className="flex flex-col items-start sm:flex-row sm:items-baseline sm:gap-1">
                            <p className="text-muted-foreground text-sm font-medium">
                              {exp.position}
                            </p>
                            {exp.location && (
                              <span className="text-subtle text-xs sm:text-sm sm:before:mx-1 sm:before:content-['|']">
                                {exp.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-subtle ml-auto shrink-0 text-right text-sm">
                          {[exp.startDate, exp.endDate || "Present"]
                            .filter(Boolean)
                            .join(" - ")}
                        </span>
                        {/* Optional: Add a chevron icon that rotates */}
                        <span className="ml-2 transition-transform duration-200 group-open:rotate-90">
                          ▶
                        </span>
                      </summary>
                      {/* The content inside <details> but outside <summary> is collapsible */}
                      <div className="px-2 pt-1 pb-3">
                        <ul className="mt-1 ml-4 list-disc space-y-1">
                          {exp.bulletPoints?.map(
                            (bullet, bulletIndex) =>
                              bullet.text && (
                                <li
                                  key={bulletIndex}
                                  className="text-foreground/80 text-sm"
                                >
                                  {bullet.text}
                                </li>
                              ),
                          )}
                        </ul>
                      </div>
                    </details>
                  ),
              )}
            </section>
          )}

        {/* Education */}
        {isMounted &&
          data.education?.some((edu) => edu.school || edu.degree) && (
            <section
              id="section-education"
              className="scroll-mt-24 print:break-inside-avoid"
            >
              <h2 className="border-border text-primary mb-2 border-b pb-1 text-base font-bold uppercase">
                Education
              </h2>
              {data.education.map(
                (edu, index) =>
                  edu.school && (
                    <div key={index} className="mb-2">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-foreground text-base font-semibold">
                          {edu.school}
                        </h3>
                        <span className="text-subtle text-sm">
                          {edu.graduationYear}
                        </span>
                      </div>
                      <p className="text-foreground/80 text-sm">{edu.degree}</p>
                    </div>
                  ),
              )}
            </section>
          )}

        {/* Projects */}
        {isMounted &&
          data.projects?.some(
            (project) => project.name || project.description,
          ) && (
            <section
              id="section-projects"
              className="scroll-mt-24 print:break-inside-avoid"
            >
              <h2 className="border-border text-primary mb-2 border-b pb-1 text-base font-bold uppercase">
                Projects
              </h2>
              {data.projects.map(
                (project, index) =>
                  project.name && (
                    <div key={index} className="mb-2">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-foreground text-base font-semibold">
                          {project.name}
                        </h3>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary ml-4 truncate text-sm hover:underline"
                            style={{ maxWidth: "50%" }}
                          >
                            {project.link}
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-foreground/80 mt-1 text-sm">
                          {project.description}
                        </p>
                      )}
                    </div>
                  ),
              )}
            </section>
          )}
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
