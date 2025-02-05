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
  bulletPoints: BulletPoint[];
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

export interface ResumeSection {
  id: string;
  title: string;
  component: React.ComponentType<any>;
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
  format: 'json' | 'pdf';
  fileName?: string;
}
