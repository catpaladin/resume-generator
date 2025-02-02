// Types for Resume Generator
export interface Education {
  school: string;
  degree: string;
  graduationYear: string;
}

export interface BulletPoint {
  text: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  bulletPoints: BulletPoint[];
}

export interface Project {
  name: string;
  link: string;
  description: string;
}

export interface ResumeData {
  fullName: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}
