"use client";

import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import type { ResumeData } from "@/types/resume";

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
        addSection("SKILLS");
        const skillText = data.skills
          .filter((skill) => skill.name)
          .map((skill) => skill.name)
          .join(" • ");
        addBodyText(skillText);
        currentY += 6;
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
    <Card className="p-6 bg-card">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-bold text-foreground">Resume Preview</h2>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          {isExporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div
        ref={previewRef}
        className="space-y-6 print:space-y-4 print:p-0"
        id="resume-preview"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary uppercase mb-2">
            {data.personal?.fullName || ""}
          </h1>
          <p className="text-muted-foreground text-sm">
            {[
              data.personal.location,
              data.personal.email,
              data.personal.phone,
              data.personal.linkedin,
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>

        {/* Professional Summary */}
        {data.personal.summary && (
          <section>
            <h2 className="text-base font-bold mb-2 text-primary uppercase border-b border-border pb-1">
              Professional Summary
            </h2>
            <p className="text-muted-foreground text-sm">
              {data.personal.summary}
            </p>
          </section>
        )}

        {/* Skills */}
        {data.skills?.some((skill) => skill.name) && (
          <section>
            <h2 className="text-base font-bold mb-2 text-primary uppercase border-b border-border pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(
                (skill, index) =>
                  skill.name && (
                    <span
                      key={index}
                      className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-sm"
                    >
                      {skill.name}
                    </span>
                  ),
              )}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {data.experience?.some((exp) => exp.company || exp.position) && (
          <section>
            <h2 className="text-base font-bold mb-2 text-primary uppercase border-b border-border pb-1">
              Professional Experience
            </h2>
            {data.experience.map(
              (exp, index) =>
                exp.company && (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <h3 className="font-semibold text-foreground text-base">
                          {exp.company}
                        </h3>
                        <div className="flex gap-2 items-baseline">
                          <p className="font-medium text-muted-foreground text-sm">
                            {exp.position}
                          </p>
                          {exp.location && (
                            <span className="text-subtle text-sm">
                              | {exp.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-subtle text-sm shrink-0">
                        {[exp.startDate, exp.endDate || "Present"]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    </div>
                    <ul className="list-disc ml-4 mt-1.5 space-y-1">
                      {exp.bulletPoints?.map(
                        (bullet, bulletIndex) =>
                          bullet.text && (
                            <li
                              key={bulletIndex}
                              className="text-muted-foreground text-sm"
                            >
                              {bullet.text}
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                ),
            )}
          </section>
        )}

        {/* Education */}
        {data.education?.some((edu) => edu.school || edu.degree) && (
          <section>
            <h2 className="text-base font-bold mb-2 text-primary uppercase border-b border-border pb-1">
              Education
            </h2>
            {data.education.map(
              (edu, index) =>
                edu.school && (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-foreground text-base">
                        {edu.school}
                      </h3>
                      <span className="text-subtle text-sm">
                        {edu.graduationYear}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {edu.degree}
                    </p>
                  </div>
                ),
            )}
          </section>
        )}

        {/* Projects */}
        {data.projects?.some(
          (project) => project.name || project.description,
        ) && (
          <section>
            <h2 className="text-base font-bold mb-2 text-primary uppercase border-b border-border pb-1">
              Projects
            </h2>
            {data.projects.map(
              (project, index) =>
                project.name && (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-foreground text-base">
                        {project.name}
                      </h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate ml-4"
                          style={{ maxWidth: "50%" }}
                        >
                          {project.link}
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                ),
            )}
          </section>
        )}
      </div>
    </Card>
  );
}
