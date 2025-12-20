import { z } from "zod";

const IdSchema = z.string().min(1, "ID is required");
const EmailSchema = z.string().email("Invalid email format");
const PhoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)\.]+$/, "Invalid phone number format");
const DateSchema = z.string().min(1, "Date is required");
const YearSchema = z.string().regex(/^\d{4}$/, "Invalid year format");

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  location: z.string().min(1, "Location is required"),
  email: EmailSchema,
  phone: PhoneSchema,
  linkedin: z.string().default(""),
  summary: z.string().default(""),
});

export const BulletPointSchema = z.object({
  id: IdSchema,
  text: z.string().min(1, "Bullet point text is required"),
});

export const ExperienceSchema = z.object({
  id: IdSchema,
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().min(1, "Location is required"),
  startDate: DateSchema,
  endDate: DateSchema,
  isCurrent: z.boolean().optional(),
  bulletPoints: z.array(BulletPointSchema).default([]),
  jobDescription: z.string().optional().or(z.literal("")),
});

export const EducationSchema = z.object({
  id: IdSchema,
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  graduationYear: YearSchema,
});

export const ProjectSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, "Project name is required"),
  url: z.string().default(""),
  description: z.string().min(1, "Project description is required"),
});

export const SkillSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, "Skill name is required"),
  category: z.string().optional().or(z.literal("")),
});

export const ResumeDataSchema = z.object({
  personal: PersonalInfoSchema,
  skills: z.array(SkillSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
});

export const PartialPersonalInfoSchema = PersonalInfoSchema.partial().extend({
  fullName: z.string().optional(),
  email: z.string().optional(),
});

export const PartialExperienceSchema = ExperienceSchema.partial().extend({
  id: z.string().optional(),
  bulletPoints: z.array(BulletPointSchema.partial()).optional(),
});

export const PartialEducationSchema = EducationSchema.partial().extend({
  id: z.string().optional(),
});

export const PartialProjectSchema = ProjectSchema.partial().extend({
  id: z.string().optional(),
});

export const PartialSkillSchema = SkillSchema.partial().extend({
  id: z.string().optional(),
});

export const PartialResumeDataSchema = z.object({
  personal: PartialPersonalInfoSchema.optional(),
  skills: z.array(PartialSkillSchema).optional(),
  experience: z.array(PartialExperienceSchema).optional(),
  education: z.array(PartialEducationSchema).optional(),
  projects: z.array(PartialProjectSchema).optional(),
});

export type PersonalInfoInput = z.input<typeof PersonalInfoSchema>;
export type PersonalInfoOutput = z.output<typeof PersonalInfoSchema>;
export type ExperienceInput = z.input<typeof ExperienceSchema>;
export type ExperienceOutput = z.output<typeof ExperienceSchema>;
export type EducationInput = z.input<typeof EducationSchema>;
export type EducationOutput = z.output<typeof EducationSchema>;
export type ProjectInput = z.input<typeof ProjectSchema>;
export type ProjectOutput = z.output<typeof ProjectSchema>;
export type SkillInput = z.input<typeof SkillSchema>;
export type SkillOutput = z.output<typeof SkillSchema>;
export type ResumeDataInput = z.input<typeof ResumeDataSchema>;
export type ResumeDataOutput = z.output<typeof ResumeDataSchema>;

export interface ValidationResult {
  success: boolean;
  data?: ResumeDataOutput;
  errors: Array<{
    path: string;
    message: string;
    code: string;
  }>;
}

export function formatZodErrors(error: z.ZodError): ValidationResult["errors"] {
  return error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}

export function validateResumeData(data: unknown): ValidationResult {
  const result = ResumeDataSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
    };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

export function validatePartialResumeData(data: unknown): ValidationResult {
  const result = PartialResumeDataSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as ResumeDataOutput,
      errors: [],
    };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function normalizeResumeData(
  partialData: z.infer<typeof PartialResumeDataSchema>,
): ResumeDataOutput {
  const normalized = {
    personal: {
      fullName: partialData.personal?.fullName || "",
      location: partialData.personal?.location || "",
      email: partialData.personal?.email || "",
      phone: partialData.personal?.phone || "",
      linkedin: partialData.personal?.linkedin || "",
      summary: partialData.personal?.summary || "",
    },
    skills: (partialData.skills || []).map((skill) => ({
      id: skill.id || generateId(),
      name: skill.name || "",
      category: skill.category || "",
    })),
    experience: (partialData.experience || []).map((exp) => ({
      id: exp.id || generateId(),
      company: exp.company || "",
      position: exp.position || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      isCurrent: exp.isCurrent || false,
      bulletPoints: (exp.bulletPoints || []).map((bp) => ({
        id: bp.id || generateId(),
        text: bp.text || "",
      })),
      jobDescription: exp.jobDescription || "",
    })),
    education: (partialData.education || []).map((edu) => ({
      id: edu.id || generateId(),
      school: edu.school || "",
      degree: edu.degree || "",
      graduationYear: edu.graduationYear || "",
    })),
    projects: (partialData.projects || []).map((proj) => ({
      id: proj.id || generateId(),
      name: proj.name || "",
      url: proj.url || "",
      description: proj.description || "",
    })),
  };

  const validation = validateResumeData(normalized);
  if (validation.success && validation.data) {
    return validation.data;
  }

  return normalized as ResumeDataOutput;
}
