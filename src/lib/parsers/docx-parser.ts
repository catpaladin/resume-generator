import mammoth from "mammoth";
import type {
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Project,
  BulletPoint,
} from "@/types/resume";
import {
  Parser,
  ParseResult,
  getFileExtension,
  PARSING_PATTERNS,
  SECTION_HEADERS,
} from "./index";
import { generateId, normalizeResumeData } from "../validators/schemas";

interface ParsedSection {
  title: string;
  content: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export class DocxParser implements Parser {
  // Simple browser-compatible text processing
  private stem(word: string): string {
    // Simple stemming - remove common suffixes
    return word
      .toLowerCase()
      .replace(/ing$/, "")
      .replace(/ed$/, "")
      .replace(/s$/, "")
      .replace(/er$/, "")
      .replace(/ly$/, "");
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  getName(): string {
    return "Word Document Parser";
  }

  getSupportedExtensions(): string[] {
    return ["docx"];
  }

  canHandle(file: File): boolean {
    const extension = getFileExtension(file);
    return this.getSupportedExtensions().includes(extension);
  }

  async parse(file: File): Promise<ParseResult> {
    try {
      // Validate file before processing
      const validationResult = await this.validateDocxFile(file);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: [
            {
              field: "file",
              message: validationResult.error || "Invalid DOCX file",
              severity: "error",
              suggestion: validationResult.suggestion,
            },
          ],
        };
      }

      // Convert docx to HTML and plain text
      const arrayBuffer = await this.fileToArrayBuffer(file);

      // Try to extract text with better error handling
      let result: { value: string; messages: unknown[] };
      let htmlResult: { value: string; messages: unknown[] };

      try {
        result = await mammoth.extractRawText({ arrayBuffer });
        htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      } catch (mammothError) {
        // If mammoth fails, try to provide more specific error information
        const errorMessage =
          mammothError instanceof Error
            ? mammothError.message
            : "Unknown parsing error";

        if (
          errorMessage.includes("zip") ||
          errorMessage.includes("central directory")
        ) {
          return {
            success: false,
            errors: [
              {
                field: "file",
                message:
                  "The DOCX file appears to be corrupted or not a valid Word document",
                severity: "error",
                suggestion:
                  "Try opening the file in Microsoft Word and saving it again, or export it as a new DOCX file",
              },
            ],
          };
        }

        throw mammothError; // Re-throw if it's a different error
      }

      if (!result.value.trim()) {
        return {
          success: false,
          errors: [
            {
              field: "content",
              message: "Document appears to be empty or unreadable",
              severity: "error",
              suggestion:
                "Please check that the document contains text content",
            },
          ],
        };
      }

      const plainText = result.value;
      const htmlContent = htmlResult.value;

      // Parse sections from the text
      const sections = this.identifySections(plainText);

      // Extract structured data
      const extractedData = await this.extractResumeData(
        plainText,
        htmlContent,
        sections,
      );

      // Validate and normalize the data
      const normalizedData = normalizeResumeData(extractedData);

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(
        sections,
        extractedData,
      );

      // Collect any parsing warnings
      const warnings = this.generateWarnings(extractedData, sections);

      return {
        success: true,
        data: normalizedData,
        confidence,
        warnings,
        originalContent: plainText,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        errors: [
          {
            field: "parsing",
            message: `Failed to parse Word document: ${errorMessage}`,
            severity: "error",
            suggestion:
              "Please ensure the document is a valid .docx file created by Microsoft Word or a compatible application",
          },
        ],
      };
    }
  }

  private async validateDocxFile(file: File): Promise<{
    isValid: boolean;
    error?: string;
    suggestion?: string;
  }> {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return {
        isValid: false,
        error: "File does not have a .docx extension",
        suggestion:
          "Please ensure you're uploading a Microsoft Word document (.docx)",
      };
    }

    // Check file size (basic validation)
    if (file.size === 0) {
      return {
        isValid: false,
        error: "File appears to be empty",
        suggestion: "Please check that the file contains content",
      };
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return {
        isValid: false,
        error: "File is too large",
        suggestion: "Please use a smaller DOCX file (under 50MB)",
      };
    }

    // Try to read the first few bytes to check if it looks like a ZIP file (DOCX format)
    try {
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));

      // DOCX files are ZIP archives, so they should start with ZIP signature
      // ZIP signature: 0x50 0x4B ("PK")
      if (
        uint8Array.length >= 2 &&
        uint8Array[0] === 0x50 &&
        uint8Array[1] === 0x4b
      ) {
        return { isValid: true };
      }

      return {
        isValid: false,
        error: "File does not appear to be a valid DOCX format",
        suggestion:
          "Please ensure the file is a genuine Microsoft Word document (.docx)",
      };
    } catch {
      return {
        isValid: false,
        error: "Unable to read file",
        suggestion: "Please try uploading the file again",
      };
    }
  }

  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }

  private identifySections(text: string): ParsedSection[] {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const sections: ParsedSection[] = [];

    let currentSection: ParsedSection | null = null;
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const sectionType = this.detectSectionHeader(line);

      if (sectionType) {
        // Save previous section if exists
        if (currentSection) {
          currentSection.content = currentContent.join("\n");
          currentSection.endIndex = i - 1;
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: sectionType,
          content: "",
          confidence: this.calculateSectionConfidence(line, sectionType),
          startIndex: i,
          endIndex: i,
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      } else {
        // Content before any section header - likely personal info
        if (!sections.some((s) => s.title === "personal")) {
          if (!currentSection) {
            currentSection = {
              title: "personal",
              content: "",
              confidence: 0.8,
              startIndex: 0,
              endIndex: i,
            };
            currentContent = [];
          }
          currentContent.push(line);
        }
      }
    }

    // Don't forget the last section
    if (currentSection) {
      currentSection.content = currentContent.join("\n");
      currentSection.endIndex = lines.length - 1;
      sections.push(currentSection);
    }

    return sections;
  }

  private detectSectionHeader(line: string): string | null {
    const cleanLine = line.toLowerCase().replace(/[^\w\s]/g, "");
    const words = this.tokenize(cleanLine);

    // Check each section type
    for (const [sectionType, keywords] of Object.entries(SECTION_HEADERS)) {
      for (const keyword of keywords) {
        if (words.some((word) => this.stem(word) === this.stem(keyword))) {
          // Additional checks for confidence
          if (
            line.length < 50 && // Section headers are usually short
            (line.toUpperCase() === line || // All caps
              words.length <= 3)
          ) {
            // Short phrase
            return sectionType;
          }
        }
      }
    }

    return null;
  }

  private calculateSectionConfidence(
    line: string,
    sectionType: string,
  ): number {
    let confidence = 0.5;

    // Boost confidence for exact matches
    const keywords =
      SECTION_HEADERS[sectionType as keyof typeof SECTION_HEADERS] || [];
    if (keywords.some((keyword) => line.toLowerCase().includes(keyword))) {
      confidence += 0.3;
    }

    // Boost for formatting indicators
    if (line.toUpperCase() === line) confidence += 0.1;
    if (line.length < 30) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private async extractResumeData(
    plainText: string,
    htmlContent: string,
    sections: ParsedSection[],
  ): Promise<{
    personal?: PersonalInfo;
    experience?: Experience[];
    education?: Education[];
    skills?: Skill[];
    projects?: Project[];
  }> {
    const data: {
      personal?: PersonalInfo;
      experience?: Experience[];
      education?: Education[];
      skills?: Skill[];
      projects?: Project[];
    } = {};

    for (const section of sections) {
      switch (section.title) {
        case "personal":
          data.personal = this.extractPersonalInfo(section.content);
          break;
        case "experience":
          data.experience = this.extractExperience(section.content);
          break;
        case "education":
          data.education = this.extractEducation(section.content);
          break;
        case "skills":
          data.skills = this.extractSkills(section.content);
          break;
        case "projects":
          data.projects = this.extractProjects(section.content);
          break;
      }
    }

    // If no personal section was found, try to extract from the beginning
    if (!data.personal) {
      const firstLines = plainText.split("\n").slice(0, 10).join("\n");
      data.personal = this.extractPersonalInfo(firstLines);
    }

    return data;
  }

  private extractPersonalInfo(content: string): PersonalInfo {
    const personal: PersonalInfo = {
      fullName: "",
      location: "",
      email: "",
      phone: "",
      linkedin: "",
      summary: "",
    };

    // Extract email
    const emailMatch = content.match(PARSING_PATTERNS.email);
    if (emailMatch) {
      personal.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = content.match(PARSING_PATTERNS.phone);
    if (phoneMatch) {
      personal.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinMatch = content.match(PARSING_PATTERNS.linkedin);
    if (linkedinMatch) {
      personal.linkedin = linkedinMatch[0];
    } else {
      personal.linkedin = "";
    }

    // Extract name (usually the first non-empty line)
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length > 0) {
      // Skip lines that look like section headers or contain special patterns
      const nameCandidate = lines.find(
        (line) =>
          !line.match(PARSING_PATTERNS.email) &&
          !line.match(PARSING_PATTERNS.phone) &&
          !line.match(PARSING_PATTERNS.linkedin) &&
          line.length > 2 &&
          line.length < 50 &&
          !this.detectSectionHeader(line),
      );
      if (nameCandidate) {
        personal.fullName = nameCandidate;
      }
    }

    // Extract location (often follows name or appears with phone/email)
    const locationPatterns = [
      /(?:^|\n)\s*([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:,\s*\d{5})?)\s*(?:\n|$)/m,
      /(?:Location|Address):\s*([^\n]+)/i,
    ];
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) {
        personal.location = match[1].trim();
        break;
      }
    }

    // Extract summary (look for paragraphs after personal info)
    const summaryPatterns = [
      /(?:Summary|Objective|Profile|About):\s*([^]*?)(?:\n\n|\n[A-Z])/i,
      /(?:^|\n)([A-Z][^]*?)(?:\n\n|\n[A-Z]{2,})/m,
    ];
    for (const pattern of summaryPatterns) {
      const match = content.match(pattern);
      if (match && match[1].length > 50 && match[1].length < 500) {
        personal.summary = match[1].trim();
        break;
      }
    }

    // Ensure summary is always a string
    if (!personal.summary) {
      personal.summary = "";
    }

    return personal;
  }

  private extractExperience(content: string): Experience[] {
    const experiences: Experience[] = [];

    // Split by potential job entries (look for date patterns)
    const jobBlocks = this.splitByDatePatterns(content);

    for (const block of jobBlocks) {
      const experience = this.parseExperienceBlock(block);
      if (experience && (experience.company || experience.position)) {
        experiences.push(experience);
      }
    }

    return experiences;
  }

  private splitByDatePatterns(content: string): string[] {
    const lines = content.split("\n");
    const blocks: string[] = [];
    let currentBlock: string[] = [];

    for (const line of lines) {
      const hasDate =
        PARSING_PATTERNS.dates.monthYear.test(line) ||
        PARSING_PATTERNS.dates.yearRange.test(line);

      if (hasDate && currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join("\n"));
    }

    return blocks.filter((block) => block.trim().length > 0);
  }

  private parseExperienceBlock(block: string): Experience | null {
    const experience: Experience = {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      bulletPoints: [],
    };

    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Extract dates
    const dateMatch =
      block.match(PARSING_PATTERNS.dates.yearRange) ||
      block.match(PARSING_PATTERNS.dates.monthYear);
    if (dateMatch) {
      const dateParts = dateMatch[0].split(/[-–—]/);
      experience.startDate = dateParts[0]?.trim() || "";
      experience.endDate = dateParts[1]?.trim() || "";
      if (
        experience.endDate?.toLowerCase().includes("present") ||
        experience.endDate?.toLowerCase().includes("current")
      ) {
        experience.isCurrent = true;
      }
    }

    // Try to identify company and position
    const nonDateLines = lines.filter(
      (line) =>
        !PARSING_PATTERNS.dates.yearRange.test(line) &&
        !PARSING_PATTERNS.dates.monthYear.test(line),
    );

    const jobInfoLines = [];
    for (const line of nonDateLines) {
      if (jobInfoLines.length >= 2) break;

      if (this.looksLikeBulletPoint(line)) {
        break;
      }

      if (this.looksLikeJobTitle(line)) {
        jobInfoLines.push(line);
      } else if (jobInfoLines.length === 0) {
        jobInfoLines.push(line);
      } else {
        break;
      }
    }

    if (jobInfoLines.length >= 2) {
      const firstLine = jobInfoLines[0];
      const secondLine = jobInfoLines[1];

      if (firstLine.includes(" at ")) {
        const parts = firstLine.split(" at ");
        experience.position = parts[0].trim();
        experience.company = parts[1].trim();
      } else if (firstLine.includes(" - ")) {
        const parts = firstLine.split(" - ");
        experience.company = parts[0].trim();
        experience.position = parts[1].trim();
      } else {
        if (this.looksMoreLikePosition(firstLine)) {
          experience.position = firstLine;
          experience.company = secondLine;
        } else {
          experience.company = firstLine;
          experience.position = secondLine;
        }
      }
    } else if (jobInfoLines.length === 1) {
      const line = jobInfoLines[0];
      if (this.looksMoreLikePosition(line)) {
        experience.position = line;
      } else {
        experience.company = line;
      }
    }

    const bulletPoints = this.extractBulletPointsFromBlock(block);
    experience.bulletPoints = bulletPoints;

    const locationMatch = block.match(/([A-Z][a-z]+,\s*[A-Z]{2})/);
    if (locationMatch) {
      experience.location = locationMatch[1];
    }

    return experience;
  }

  private extractBulletPointsFromBlock(block: string): BulletPoint[] {
    const bulletPoints: BulletPoint[] = [];
    const lines = block.split("\n").map((line) => line.trim());

    for (const line of lines) {
      if (
        !line ||
        PARSING_PATTERNS.dates.yearRange.test(line) ||
        PARSING_PATTERNS.dates.monthYear.test(line)
      ) {
        continue;
      }

      const bulletPatterns = [
        /^[\s]*[•·▪▫◦‣⁃▸▹▶▷◆◇■□▲△►▻⟩〉]\s+(.+)$/,
        /^[\s]*[-*+]\s+(.+)$/,
        /^[\s]*\d+[\.\)]\s+(.+)$/,
        /^[\s]*[a-zA-Z][\.\)]\s+(.+)$/,
      ];

      let bulletText = null;
      for (const pattern of bulletPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          bulletText = match[1].trim();
          break;
        }
      }

      if (bulletText && bulletText.length > 10) {
        bulletPoints.push({
          id: generateId(),
          text: bulletText,
        });
        continue;
      }

      if (!this.looksLikeJobTitle(line) && this.looksLikeAchievement(line)) {
        bulletPoints.push({
          id: generateId(),
          text: line,
        });
      }
    }

    return bulletPoints;
  }

  private looksLikeJobTitle(line: string): boolean {
    const jobTitleIndicators = [
      /\b(?:at|@)\b/i,
      /\b(?:-|–|—)\b/,
      /^\w+(?:\s+\w+){0,3}$/,
      /\b(?:engineer|developer|manager|analyst|specialist|coordinator|director|lead|senior|junior|intern)\b/i,
      /\b(?:inc|llc|corp|company|ltd|technologies|solutions|systems|group)\b/i,
    ];

    const commonTitles = [
      /^(?:senior|junior|lead|principal|staff)\s+/i,
      /\b(?:software|web|frontend|backend|full.?stack|data|product|project)\s+(?:engineer|developer|manager)/i,
      /\b(?:marketing|sales|business|operations|human resources|hr)\s+(?:manager|specialist|coordinator)/i,
    ];

    return (
      (line.length < 60 &&
        (jobTitleIndicators.some((pattern) => pattern.test(line)) ||
          commonTitles.some((pattern) => pattern.test(line)))) ||
      (line.length < 30 &&
        !/\b(?:achieved|developed|managed|led|created|implemented|improved)\b/i.test(
          line,
        ))
    );
  }

  private looksLikeBulletPoint(line: string): boolean {
    const bulletMarkers = /^[\s]*[•·▪▫◦‣⁃▸▹▶▷◆◇■□▲△►▻⟩〉]\s+/;
    const numberedList = /^[\s]*\d+[\.\)]\s+/;
    const letteredList = /^[\s]*[a-zA-Z][\.\)]\s+/;
    const dashBullet = /^[\s]*[-*+]\s+/;

    return (
      bulletMarkers.test(line) ||
      numberedList.test(line) ||
      letteredList.test(line) ||
      dashBullet.test(line)
    );
  }

  private looksMoreLikePosition(line: string): boolean {
    const positionIndicators = [
      /\b(?:engineer|developer|manager|analyst|specialist|coordinator|director|lead|senior|junior|intern|consultant|architect|designer|administrator)\b/i,
      /^(?:senior|junior|lead|principal|staff|associate|assistant)\s+/i,
      /\b(?:software|web|frontend|backend|full.?stack|data|product|project|marketing|sales|business|operations)\s+(?:engineer|developer|manager)/i,
    ];

    const companyIndicators = [
      /\b(?:inc|llc|corp|company|ltd|technologies|solutions|systems|group|enterprises|consulting|services)\b/i,
      /\b(?:university|college|school|institute|hospital|clinic|bank|financial|insurance)\b/i,
    ];

    const hasPositionIndicators = positionIndicators.some((pattern) =>
      pattern.test(line),
    );
    const hasCompanyIndicators = companyIndicators.some((pattern) =>
      pattern.test(line),
    );

    if (hasPositionIndicators && !hasCompanyIndicators) return true;
    if (hasCompanyIndicators) return false;
    return line.length < 40;
  }

  private looksLikeAchievement(line: string): boolean {
    const achievementIndicators = [
      /\b(?:achieved|accomplished|improved|increased|decreased|reduced|developed|created|built|designed|implemented|managed|led|coordinated|optimized|streamlined)\b/i,
      /\b(?:responsible for|worked on|collaborated|contributed|delivered|executed|maintained|supported)\b/i,
      /\b\d+%\b/,
      /\$[\d,]+/,
      /\b\d+[kKmM]?\+?\b/,
    ];

    return (
      line.length > 15 &&
      line.length < 200 &&
      achievementIndicators.some((pattern) => pattern.test(line))
    );
  }

  private extractEducation(content: string): Education[] {
    const educationEntries: Education[] = [];

    // Split by lines and look for degree patterns
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentEntry: Education | null = null;

    for (const line of lines) {
      // Look for degree indicators
      const degreePatterns = [
        /\b(?:Bachelor|Master|PhD|B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|MBA|PhD)\b/i,
        /\b(?:Associate|Certificate|Diploma)\b/i,
      ];

      const hasDegreeLike = degreePatterns.some((pattern) =>
        pattern.test(line),
      );
      const hasYear = /\b\d{4}\b/.test(line);

      if (hasDegreeLike || hasYear) {
        if (currentEntry) {
          educationEntries.push(currentEntry);
        }

        currentEntry = {
          id: generateId(),
          school: "",
          degree: "",
          graduationYear: "",
        };

        // Extract year
        const yearMatch = line.match(/\b(\d{4})\b/);
        if (yearMatch) {
          currentEntry.graduationYear = yearMatch[1];
        }

        // Extract degree and school
        if (hasDegreeLike) {
          // Try to parse "Degree in Subject from School" patterns
          const patterns = [
            /^(.+?)\s+(?:from|at)\s+(.+)$/i,
            /^(.+?),\s+(.+)$/,
            /^(.+)$/,
          ];

          for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
              if (match[2]) {
                currentEntry.degree = match[1].trim();
                currentEntry.school = match[2].trim();
              } else {
                currentEntry.degree = match[1].trim();
              }
              break;
            }
          }
        } else {
          // Line with year but no degree - might be school name
          currentEntry.school = line.replace(/\b\d{4}\b/, "").trim();
        }
      } else if (currentEntry && !currentEntry.school) {
        // Might be continuation - school name
        currentEntry.school = line;
      }
    }

    if (currentEntry) {
      educationEntries.push(currentEntry);
    }

    return educationEntries.filter(
      (entry) => entry.degree || entry.school,
    ) as Education[];
  }

  private extractSkills(content: string): Skill[] {
    const skills: Skill[] = [];

    // Split by common delimiters
    const skillTexts = content
      .split(/[,;|\n•\-\*]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const skillText of skillTexts) {
      // Skip very long text (probably not a skill)
      if (skillText.length > 50) continue;

      // Check if it looks like a skill
      if (this.looksLikeSkill(skillText)) {
        skills.push({
          id: generateId(),
          name: skillText,
          category: this.categorizeSkill(skillText),
        });
      }
    }

    return skills;
  }

  private looksLikeSkill(text: string): boolean {
    // Skip common non-skill phrases
    const excludePatterns = [
      /\b(?:years?|experience|proficient|familiar|knowledge)\b/i,
      /^(?:and|or|the|a|an)\b/i,
      /\d+\s*years?/i,
    ];

    if (excludePatterns.some((pattern) => pattern.test(text))) {
      return false;
    }

    // Check for known skill patterns
    const skillPatterns = [
      PARSING_PATTERNS.skills.programming,
      PARSING_PATTERNS.skills.tools,
      /\b(?:HTML|CSS|SQL|XML|JSON|REST|API|Git|Linux|Windows|macOS)\b/i,
    ];

    return (
      skillPatterns.some((pattern) => pattern.test(text)) ||
      (text.length >= 2 && text.length <= 30 && !/\s{2,}/.test(text))
    );
  }

  private categorizeSkill(skill: string): string {
    if (PARSING_PATTERNS.skills.programming.test(skill)) {
      return "Programming";
    }
    if (PARSING_PATTERNS.skills.tools.test(skill)) {
      return "Tools";
    }
    if (/\b(?:HTML|CSS|SQL|XML|JSON|REST|API)\b/i.test(skill)) {
      return "Technical";
    }
    return "General";
  }

  private extractProjects(content: string): Project[] {
    const projects: Project[] = [];

    // Split by potential project entries
    const projectBlocks = content
      .split(/\n\s*\n/)
      .filter((block) => block.trim().length > 0);

    for (const block of projectBlocks) {
      const project = this.parseProjectBlock(block);
      if (project && project.name) {
        projects.push(project);
      }
    }

    return projects.filter((p) => p !== null) as Project[];
  }

  private parseProjectBlock(block: string): Project | null {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return null;

    const project: Project = {
      id: generateId(),
      name: "",
      description: "",
      link: "",
    };

    // First line is usually the project name
    project.name = lines[0];

    // Look for URLs
    const urlMatch = block.match(PARSING_PATTERNS.website);
    if (urlMatch) {
      project.link = urlMatch[0];
    }

    // Rest is description
    const descriptionLines = lines
      .slice(1)
      .filter((line) => !PARSING_PATTERNS.website.test(line));
    project.description = descriptionLines.join(" ");

    return project;
  }

  private calculateOverallConfidence(
    sections: ParsedSection[],
    extractedData: Record<string, unknown>,
  ): number {
    let totalConfidence = 0;
    let sectionCount = 0;

    // Weight sections by importance
    const sectionWeights = {
      personal: 0.3,
      experience: 0.3,
      education: 0.2,
      skills: 0.1,
      projects: 0.1,
    };

    for (const section of sections) {
      const weight =
        sectionWeights[section.title as keyof typeof sectionWeights] || 0.1;
      totalConfidence += section.confidence * weight;
      sectionCount += weight;
    }

    // Boost confidence if we found key data
    const personal = extractedData.personal as PersonalInfo | undefined;
    const experience = extractedData.experience as Experience[] | undefined;
    const education = extractedData.education as Education[] | undefined;

    if (personal?.email) totalConfidence += 0.1;
    if (personal?.phone) totalConfidence += 0.05;
    if (experience && experience.length > 0) totalConfidence += 0.1;
    if (education && education.length > 0) totalConfidence += 0.05;

    return Math.min(totalConfidence / Math.max(sectionCount, 1), 1.0);
  }

  private generateWarnings(
    extractedData: Record<string, unknown>,
    sections: ParsedSection[],
  ): string[] {
    const warnings: string[] = [];

    const personal = extractedData.personal as PersonalInfo | undefined;
    const experience = extractedData.experience as Experience[] | undefined;

    // Check for missing critical information
    if (!personal?.email) {
      warnings.push(
        "Email address not found - please verify contact information",
      );
    }

    if (!personal?.fullName) {
      warnings.push(
        "Full name not detected - please check personal information",
      );
    }

    if (!experience || experience.length === 0) {
      warnings.push(
        "No work experience found - please review experience section",
      );
    }

    // Check for low confidence sections
    const lowConfidenceSections = sections.filter((s) => s.confidence < 0.6);
    if (lowConfidenceSections.length > 0) {
      warnings.push(
        `Some sections may need manual review: ${lowConfidenceSections.map((s) => s.title).join(", ")}`,
      );
    }

    return warnings;
  }
}
