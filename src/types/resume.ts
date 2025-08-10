import { type ReactNode } from "react";

export interface PersonalInfo {
  fullName: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
}

export interface BulletPoint {
  id: string;
  text: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  bulletPoints: BulletPoint[];
  jobDescription?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  graduationYear: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}

export interface ResumeSectionProps {
  data?: unknown;
  onChange?: (data: unknown) => void;
  className?: string;
  children?: ReactNode;
}

export interface ResumeSection {
  id: string;
  title: string;
  component: React.ComponentType<ResumeSectionProps>;
}

export type ResumeDataKey = keyof ResumeData;

export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

export interface ImportResult {
  success: boolean;
  data?: ResumeData;
  error?: string;
}

export interface ExportOptions {
  format: "json" | "pdf";
  fileName?: string;
}

export interface AISettings {
  provider: "openai" | "anthropic" | "gemini";
  model?: string;
  customModel?: string;
  jobDescription?: string;
  hasApiKey?: boolean; // Flag to indicate if API key is stored securely
  userInstructions?: string; // Additional user instructions for AI refinement
}

export interface AIEnhancementRequest {
  originalText: string;
  jobDescription?: string;
  context: {
    company: string;
    position: string;
  };
  existingBulletPoints?: string[];
}
