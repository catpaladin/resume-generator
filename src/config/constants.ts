import { User, Lightbulb, Briefcase, GraduationCap, Code } from "lucide-svelte";
import type { ResumeData } from "@/types/resume";
import type { Tab } from "@/types/common";

export const STORAGE_KEYS = {
  RESUME_DATA: "resume-data",
  THEME: "theme-preference",
} as const;

export const TabConfig: Tab[] = [
  { id: "personal", icon: User, label: "Personal Info" },
  { id: "skills", icon: Lightbulb, label: "Skills" },
  { id: "experience", icon: Briefcase, label: "Experience" },
  { id: "education", icon: GraduationCap, label: "Education" },
  { id: "projects", icon: Code, label: "Projects" },
] as const;

export type TabType = (typeof TabConfig)[number]["id"];

// Safe UUID generation for SSR/Build environments
export function safeUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
}

export const getInitialResumeData = (): ResumeData => ({
  personal: {
    fullName: "",
    location: "",
    email: "",
    phone: "",
    linkedin: "",
    summary: "",
  },
  skills: [],
  experience: [
    {
      id: safeUUID(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      bulletPoints: [{ id: safeUUID(), text: "" }],
      jobDescription: "",
    },
  ],
  education: [
    {
      id: safeUUID(),
      school: "",
      degree: "",
      graduationYear: "",
    },
  ],
  projects: [
    {
      id: safeUUID(),
      name: "",
      url: "",
      description: "",
    },
  ],
});

export const initialResumeData = getInitialResumeData();

export const MAX_ITEMS = {
  SKILLS: 10,
  EXPERIENCE: 5,
  EDUCATION: 3,
  PROJECTS: 5,
  BULLET_POINTS: 5,
} as const;

export const VALIDATION = {
  NAME_MAX_LENGTH: 100,
  SUMMARY_MAX_LENGTH: 500,
  BULLET_POINT_MAX_LENGTH: 200,
  PROJECT_DESCRIPTION_MAX_LENGTH: 300,
} as const;

export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_URL: "Please enter a valid URL",
  MAX_LENGTH: (field: string, max: number) =>
    `${field} must be less than ${max} characters`,
  MAX_ITEMS: (item: string, max: number) =>
    `You can only add up to ${max} ${item}`,
} as const;
