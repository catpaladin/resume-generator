import type { ResumeData } from "@/types/resume";

export interface ParseError {
  field: string;
  message: string;
  severity: "error" | "warning";
  line?: number;
  suggestion?: string;
}

export interface ParseResult {
  success: boolean;
  data?: ResumeData;
  errors?: ParseError[];
  warnings?: string[];
  confidence?: number; // 0-1 scale indicating parsing confidence
  originalContent?: string; // For comparison in preview
}

export interface Parser {
  parse(file: File): Promise<ParseResult>;
  canHandle(file: File): boolean;
  getSupportedExtensions(): string[];
  getName(): string;
}

export interface ParserOptions {
  enableNLP?: boolean;
  strictValidation?: boolean;
  preserveFormatting?: boolean;
}

export class ParserFactory {
  private static parsers: Parser[] = [];

  static registerParser(parser: Parser): void {
    this.parsers.push(parser);
  }

  static getParser(file: File): Parser | null {
    return this.parsers.find((parser) => parser.canHandle(file)) || null;
  }

  static getSupportedFileTypes(): string[] {
    return this.parsers.flatMap((parser) => parser.getSupportedExtensions());
  }

  static getAllParsers(): Parser[] {
    return [...this.parsers];
  }
}

export function getFileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

export const PARSING_PATTERNS = {
  email: /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g,
  phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/gi,
  website: /(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[\w]+/gi,
  dates: {
    monthYear:
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/gi,
    yearRange: /\b\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current)\b/gi,
    fullDate: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
  },
  bulletPoints: /^[\s]*[•\-\*\+]\s+(.+)/gm,
  headers: /^[A-Z][A-Z\s]{2,}$/gm,
  skills: {
    programming:
      /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|Laravel)\b/gi,
    tools:
      /\b(?:Git|Docker|Kubernetes|AWS|Azure|GCP|Jenkins|Jira|Confluence|Figma|Sketch|Photoshop|Excel|PowerPoint)\b/gi,
  },
};

export const SECTION_HEADERS = {
  personal: ["contact", "personal", "info", "information", "profile"],
  experience: [
    "experience",
    "employment",
    "work",
    "career",
    "professional",
    "history",
  ],
  education: [
    "education",
    "academic",
    "qualification",
    "degree",
    "university",
    "college",
  ],
  skills: [
    "skills",
    "technical",
    "competencies",
    "technologies",
    "expertise",
    "abilities",
  ],
  projects: ["projects", "portfolio", "work samples", "accomplishments"],
  summary: ["summary", "objective", "about", "profile", "introduction"],
  certifications: ["certifications", "certificates", "credentials", "licenses"],
  awards: ["awards", "honors", "achievements", "recognition"],
  languages: ["languages", "linguistic"],
  interests: ["interests", "hobbies", "activities", "personal interests"],
};
