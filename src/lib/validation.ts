import { MAX_ITEMS, VALIDATION, ERROR_MESSAGES } from "@/config/constants";
import type { ResumeData } from "@/types/resume";

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate resume data section lengths
 */
export function validateSectionLengths(data: ResumeData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate personal info
  if (data.personal.fullName.length > VALIDATION.NAME_MAX_LENGTH) {
    errors.push({
      field: "fullName",
      message: ERROR_MESSAGES.MAX_LENGTH("Name", VALIDATION.NAME_MAX_LENGTH),
    });
  }

  if (data.personal.summary.length > VALIDATION.SUMMARY_MAX_LENGTH) {
    errors.push({
      field: "summary",
      message: ERROR_MESSAGES.MAX_LENGTH(
        "Summary",
        VALIDATION.SUMMARY_MAX_LENGTH,
      ),
    });
  }

  // Validate section limits
  if (data.skills.length > MAX_ITEMS.SKILLS) {
    errors.push({
      field: "skills",
      message: ERROR_MESSAGES.MAX_ITEMS("skills", MAX_ITEMS.SKILLS),
    });
  }

  if (data.experience.length > MAX_ITEMS.EXPERIENCE) {
    errors.push({
      field: "experience",
      message: ERROR_MESSAGES.MAX_ITEMS("experiences", MAX_ITEMS.EXPERIENCE),
    });
  }

  if (data.education.length > MAX_ITEMS.EDUCATION) {
    errors.push({
      field: "education",
      message: ERROR_MESSAGES.MAX_ITEMS(
        "education entries",
        MAX_ITEMS.EDUCATION,
      ),
    });
  }

  if (data.projects.length > MAX_ITEMS.PROJECTS) {
    errors.push({
      field: "projects",
      message: ERROR_MESSAGES.MAX_ITEMS("projects", MAX_ITEMS.PROJECTS),
    });
  }

  return errors;
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data: ResumeData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate personal info
  if (!data.personal.fullName.trim()) {
    errors.push({
      field: "fullName",
      message: ERROR_MESSAGES.REQUIRED,
    });
  }

  if (data.personal.email) {
    if (!isValidEmail(data.personal.email)) {
      errors.push({
        field: "email",
        message: ERROR_MESSAGES.INVALID_EMAIL,
      });
    }
  }

  if (data.personal.phone) {
    if (!isValidPhone(data.personal.phone)) {
      errors.push({
        field: "phone",
        message: ERROR_MESSAGES.INVALID_PHONE,
      });
    }
  }

  if (data.personal.linkedin) {
    if (!isValidUrl(data.personal.linkedin)) {
      errors.push({
        field: "linkedin",
        message: ERROR_MESSAGES.INVALID_URL,
      });
    }
  }

  return errors;
}

/**
 * Validate bullet point lengths
 */
export function validateBulletPoints(data: ResumeData): ValidationError[] {
  const errors: ValidationError[] = [];

  data.experience.forEach((exp, index) => {
    if (exp.bulletPoints.length > MAX_ITEMS.BULLET_POINTS) {
      errors.push({
        field: `experience[${index}].bulletPoints`,
        message: ERROR_MESSAGES.MAX_ITEMS(
          "bullet points",
          MAX_ITEMS.BULLET_POINTS,
        ),
      });
    }

    exp.bulletPoints.forEach((bullet, bulletIndex) => {
      if (bullet.text.length > VALIDATION.BULLET_POINT_MAX_LENGTH) {
        errors.push({
          field: `experience[${index}].bulletPoints[${bulletIndex}]`,
          message: ERROR_MESSAGES.MAX_LENGTH(
            "Bullet point",
            VALIDATION.BULLET_POINT_MAX_LENGTH,
          ),
        });
      }
    });
  });

  return errors;
}

/**
 * Validate project descriptions
 */
export function validateProjectDescriptions(
  data: ResumeData,
): ValidationError[] {
  const errors: ValidationError[] = [];

  data.projects.forEach((project, index) => {
    if (
      project.description.length > VALIDATION.PROJECT_DESCRIPTION_MAX_LENGTH
    ) {
      errors.push({
        field: `projects[${index}].description`,
        message: ERROR_MESSAGES.MAX_LENGTH(
          "Project description",
          VALIDATION.PROJECT_DESCRIPTION_MAX_LENGTH,
        ),
      });
    }

    if (project.link && !isValidUrl(project.link)) {
      errors.push({
        field: `projects[${index}].link`,
        message: ERROR_MESSAGES.INVALID_URL,
      });
    }
  });

  return errors;
}

/**
 * Validate entire resume data
 */
export function validateResumeData(data: ResumeData): ValidationError[] {
  return [
    ...validateRequiredFields(data),
    ...validateSectionLengths(data),
    ...validateBulletPoints(data),
    ...validateProjectDescriptions(data),
  ];
}

/**
 * Check if resume data has any validation errors
 */
export function hasValidationErrors(data: ResumeData): boolean {
  return validateResumeData(data).length > 0;
}

/**
 * Get first validation error for a specific field
 */
export function getFieldError(
  errors: ValidationError[],
  field: string,
): string | undefined {
  return errors.find((error) => error.field === field)?.message;
}
