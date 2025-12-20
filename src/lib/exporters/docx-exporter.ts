import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  SectionType,
  AlignmentType,
} from "docx";
import type { ResumeData } from "@/types/resume";

export interface DocxExportOptions {
  fileName?: string;
  includeProjects?: boolean;
  includeSummary?: boolean;
}

/**
 * ATS-friendly DOCX exporter
 * Follows best practices for Applicant Tracking Systems:
 * - Standard fonts (Times New Roman, Arial)
 * - Clear heading hierarchy
 * - No tables, images, or complex formatting
 * - Standard margins
 * - Simple bullet points
 */
export class DocxExporter {
  private readonly defaultFileName = "resume.docx";

  /**
   * Export resume data to DOCX format
   */
  async export(
    data: ResumeData,
    options: DocxExportOptions = {},
  ): Promise<Blob> {
    const doc = this.createDocument(data, options);
    const blob = await Packer.toBlob(doc);
    return blob;
  }

  /**
   * Create a downloadable DOCX file
   */
  async exportToFile(
    data: ResumeData,
    options: DocxExportOptions = {},
  ): Promise<void> {
    const blob = await this.export(data, options);
    const fileName = options.fileName || this.defaultFileName;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Create the Word document structure
   */
  private createDocument(
    data: ResumeData,
    options: DocxExportOptions,
  ): Document {
    const sections = this.createSections(data, options);

    return new Document({
      sections,
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Arial",
              size: 24, // 12pt
              bold: true,
            },
            paragraph: {
              spacing: { after: 120 }, // 6pt after
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Arial",
              size: 22, // 11pt
              bold: true,
            },
            paragraph: {
              spacing: { before: 240, after: 120 }, // 12pt before, 6pt after
            },
          },
          {
            id: "Normal",
            name: "Normal",
            quickFormat: true,
            run: {
              font: "Arial",
              size: 20, // 10pt
            },
            paragraph: {
              spacing: { after: 60 }, // 3pt after
            },
          },
        ],
      },
    });
  }

  /**
   * Create document sections
   */
  private createSections(data: ResumeData, options: DocxExportOptions): any[] {
    const sections: any[] = [];

    // Main section with all content
    const mainSection = {
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        ...this.createHeader(data.personal),
        ...this.createContactInfo(data.personal),
        ...this.createSummary(data.personal, options),
        ...this.createExperienceSection(data.experience),
        ...this.createEducationSection(data.education),
        ...this.createSkillsSection(data.skills),
        ...this.createProjectsSection(data.projects, options),
      ],
    };

    sections.push(mainSection);
    return sections;
  }

  /**
   * Create header with name
   */
  private createHeader(personal: ResumeData["personal"]): Paragraph[] {
    return [
      new Paragraph({
        text: personal.fullName,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 240 }, // 12pt after
      }),
    ];
  }

  /**
   * Create contact information
   */
  private createContactInfo(personal: ResumeData["personal"]): Paragraph[] {
    const contactParts: string[] = [];

    if (personal.email) contactParts.push(personal.email);
    if (personal.phone) contactParts.push(personal.phone);
    if (personal.location) contactParts.push(personal.location);
    if (personal.linkedin) contactParts.push(personal.linkedin);

    if (contactParts.length === 0) return [];

    return [
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(" | "),
            size: 18, // 9pt
            color: "333333",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 }, // 12pt after
      }),
    ];
  }

  /**
   * Create professional summary
   */
  private createSummary(
    personal: ResumeData["personal"],
    options: DocxExportOptions,
  ): Paragraph[] {
    if (!options.includeSummary || !personal.summary) return [];

    return [
      new Paragraph({
        text: "PROFESSIONAL SUMMARY",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: personal.summary,
        spacing: { after: 240 },
      }),
    ];
  }

  /**
   * Create experience section
   */
  private createExperienceSection(
    experience: ResumeData["experience"],
  ): Paragraph[] {
    if (!experience || experience.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "PROFESSIONAL EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    experience.forEach((exp) => {
      // Job title and company
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 22, // 11pt
            }),
            new TextRun({
              text: ` | ${exp.company}`,
              size: 22,
            }),
          ],
          spacing: { before: 120, after: 60 },
        }),
      );

      // Dates and location
      const dateRange = exp.isCurrent
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`;

      paragraphs.push(
        new Paragraph({
          text: `${dateRange} | ${exp.location}`,
          spacing: { after: 120 },
          style: "Normal",
        }),
      );

      // Bullet points
      if (exp.bulletPoints && exp.bulletPoints.length > 0) {
        exp.bulletPoints.forEach((bullet) => {
          paragraphs.push(
            new Paragraph({
              text: bullet.text,
              bullet: {
                level: 0,
              },
              spacing: { after: 60 },
            }),
          );
        });
      }

      // Job description if no bullet points
      if (
        (!exp.bulletPoints || exp.bulletPoints.length === 0) &&
        exp.jobDescription
      ) {
        paragraphs.push(
          new Paragraph({
            text: exp.jobDescription,
            spacing: { after: 120 },
          }),
        );
      }
    });

    return paragraphs;
  }

  /**
   * Create education section
   */
  private createEducationSection(
    education: ResumeData["education"],
  ): Paragraph[] {
    if (!education || education.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "EDUCATION",
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    education.forEach((edu) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: `, ${edu.school}`,
              size: 22,
            }),
          ],
          spacing: { before: 120, after: 60 },
        }),
      );

      paragraphs.push(
        new Paragraph({
          text: edu.graduationYear,
          spacing: { after: 120 },
        }),
      );
    });

    return paragraphs;
  }

  /**
   * Create skills section
   */
  private createSkillsSection(skills: ResumeData["skills"]): Paragraph[] {
    if (!skills || skills.length === 0) return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "SKILLS",
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    // Group skills by category if categories exist
    const skillsByCategory = this.groupSkillsByCategory(skills);

    Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
      if (category !== "Uncategorized") {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: category,
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 120, after: 60 },
          }),
        );
      }

      const skillsText = categorySkills.map((s) => s.name).join(", ");
      paragraphs.push(
        new Paragraph({
          text: skillsText,
          spacing: { after: 120 },
        }),
      );
    });

    return paragraphs;
  }

  /**
   * Create projects section
   */
  private createProjectsSection(
    projects: ResumeData["projects"],
    options: DocxExportOptions,
  ): Paragraph[] {
    if (!options.includeProjects || !projects || projects.length === 0)
      return [];

    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "PROJECTS",
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    projects.forEach((project) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: project.url ? ` | ${project.url}` : "",
              size: 22,
              color: "0066CC",
            }),
          ],
          spacing: { before: 120, after: 60 },
        }),
      );

      paragraphs.push(
        new Paragraph({
          text: project.description,
          spacing: { after: 120 },
        }),
      );
    });

    return paragraphs;
  }

  /**
   * Group skills by category
   */
  private groupSkillsByCategory(
    skills: ResumeData["skills"],
  ): Record<string, ResumeData["skills"]> {
    const grouped: Record<string, ResumeData["skills"]> = {};

    skills.forEach((skill) => {
      const category = skill.category || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });

    return grouped;
  }
}

// Singleton instance
export const docxExporter = new DocxExporter();

// Convenience function
export async function exportToDocx(
  data: ResumeData,
  options: DocxExportOptions = {},
): Promise<void> {
  return docxExporter.exportToFile(data, options);
}
