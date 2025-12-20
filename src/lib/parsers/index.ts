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
  email: /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/i,
  phone:
    /(?:\+?\d{1,3}[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/i,
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i,
  website: /(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[\w]+/i,
  dates: {
    monthYear:
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4}|\d{2})\b/i,
    yearRange:
      /\b(\d{4}|\d{2})\s*[-–—]\s*(?:\d{4}|\d{2}|Present|Current|Ongoing|Now|Today)\b/i,
    fullDate: /\b\d{1,4}[-./]\d{1,2}[-./]\d{1,4}\b/,
    monthYearRange:
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4}|\d{2})\s*[-–—]\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4}|\d{2})|Present|Current|Ongoing|Now|Today)\b/i,
    quarterYear: /\bQ[1-4]\s+\d{4}\b/i,
    mmYyyy: /\b\d{1,2}\/\d{2,4}\b/,
    seasons: /\b(?:Spring|Summer|Fall|Autumn|Winter)\s+(\d{4}|\d{2})\b/i,
  },
  bulletPoints: /^[\s]*[•\-\*\+▪◦·‣⁃▸▹▶▷◆◇■□▲△►▻⟩〉]\s+(.+)/m,
  headers: /^[A-Z][A-Z\s]{2,}:?$/m,
  location: {
    cityState: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+)\b/,
    cityCountry:
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/,
    remote:
      /\b(?:Remote|Virtual|Home|WFH|Work\s+from\s+home|Distributed|Telecommute|On-site\/Remote|Remote\/On-site)\b/i,
    hybrid: /\b(?:Hybrid|Flexible)\b/i,
  },
  company: {
    suffixes:
      /\b(?:Inc|LLC|Corp|Corporation|Company|Ltd|Limited|Technologies|Solutions|Systems|Group|Enterprises|Consulting|Services|Partners|Associates|Holdings|International|Global|Worldwide|Agency|Org|Organization)\.?\b/i,
    separators: /\s*[-–—|@•▪/]\s*/,
    indicators: /\b(?:at|@|with|for)\s+/i,
  },
  skills: {
    programming:
      /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|Laravel|HTML|CSS|SQL|NoSQL|MongoDB|PostgreSQL|MySQL|Redis|GraphQL|REST|API)\b/i,
    tools:
      /\b(?:Git|Docker|Kubernetes|AWS|Azure|GCP|Jenkins|Jira|Confluence|Figma|Sketch|Photoshop|Excel|PowerPoint|Slack|Teams|Zoom|Linux|Windows|macOS|VS\s*Code|IntelliJ|Eclipse)\b/i,
    frameworks:
      /\b(?:React|Vue|Angular|Svelte|Next\.js|Nuxt\.js|Gatsby|Express|Koa|Fastify|Django|Flask|Rails|Laravel|Spring|Hibernate|Tensorflow|PyTorch|Pandas|NumPy)\b/i,
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
