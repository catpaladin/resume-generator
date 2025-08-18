import type { ResumeData } from "@/types/resume";
import { Parser, ParseResult, ParseError, getFileExtension } from "./index";

export class JsonParser implements Parser {
  getName(): string {
    return "JSON Parser";
  }

  getSupportedExtensions(): string[] {
    return ["json"];
  }

  canHandle(file: File): boolean {
    const extension = getFileExtension(file);
    return this.getSupportedExtensions().includes(extension);
  }

  async parse(file: File): Promise<ParseResult> {
    try {
      const text = await this.readFileAsText(file);

      if (!text.trim()) {
        return {
          success: false,
          errors: [
            {
              field: "file",
              message: "File is empty",
              severity: "error",
            },
          ],
        };
      }

      let parsedData: unknown;
      try {
        parsedData = JSON.parse(text);
      } catch (parseError) {
        return {
          success: false,
          errors: [
            {
              field: "json",
              message: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
              severity: "error",
              suggestion: "Please ensure the file contains valid JSON data",
            },
          ],
        };
      }

      const validationResult = this.validateResumeData(parsedData);

      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors,
          data: parsedData as ResumeData,
          confidence: 0.3,
        };
      }

      return {
        success: true,
        data: parsedData as ResumeData,
        confidence: 1.0,
        originalContent: text,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "file",
            message: `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
            severity: "error",
          },
        ],
      };
    }
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  private validateResumeData(data: unknown): {
    isValid: boolean;
    errors: ParseError[];
  } {
    const errors: ParseError[] = [];

    if (!data || typeof data !== "object") {
      errors.push({
        field: "root",
        message: "Data must be an object",
        severity: "error",
      });
      return { isValid: false, errors };
    }

    const resumeData = data as Record<string, unknown>;

    const requiredFields = [
      "personal",
      "skills",
      "experience",
      "education",
      "projects",
    ];
    for (const field of requiredFields) {
      if (!(field in resumeData)) {
        errors.push({
          field,
          message: `Missing required field: ${field}`,
          severity: "error",
          suggestion: `Add a ${field} property to your JSON data`,
        });
      }
    }

    if (resumeData.personal) {
      const personalErrors = this.validatePersonalInfo(resumeData.personal);
      errors.push(...personalErrors);
    }

    const arrayFields = ["skills", "experience", "education", "projects"];
    for (const field of arrayFields) {
      if (resumeData[field] && !Array.isArray(resumeData[field])) {
        errors.push({
          field,
          message: `${field} must be an array`,
          severity: "error",
        });
      }
    }

    if (Array.isArray(resumeData.experience)) {
      resumeData.experience.forEach((exp: unknown, index: number) => {
        const expErrors = this.validateExperience(exp, index);
        errors.push(...expErrors);
      });
    }

    if (Array.isArray(resumeData.education)) {
      resumeData.education.forEach((edu: unknown, index: number) => {
        const eduErrors = this.validateEducation(edu, index);
        errors.push(...eduErrors);
      });
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
    };
  }

  private validatePersonalInfo(personal: unknown): ParseError[] {
    const errors: ParseError[] = [];

    if (!personal || typeof personal !== "object") {
      errors.push({
        field: "personal",
        message: "Personal info must be an object",
        severity: "error",
      });
      return errors;
    }

    const personalData = personal as Record<string, unknown>;
    const requiredPersonalFields = ["fullName", "email"];

    for (const field of requiredPersonalFields) {
      if (!personalData[field] || typeof personalData[field] !== "string") {
        errors.push({
          field: `personal.${field}`,
          message: `Missing or invalid ${field}`,
          severity: "error",
        });
      }
    }

    if (personalData.email && typeof personalData.email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalData.email)) {
        errors.push({
          field: "personal.email",
          message: "Invalid email format",
          severity: "error",
          suggestion: "Please provide a valid email address",
        });
      }
    }

    return errors;
  }

  private validateExperience(exp: unknown, index: number): ParseError[] {
    const errors: ParseError[] = [];

    if (!exp || typeof exp !== "object") {
      errors.push({
        field: `experience[${index}]`,
        message: "Experience entry must be an object",
        severity: "error",
      });
      return errors;
    }

    const expData = exp as Record<string, unknown>;
    const requiredFields = ["company", "position"];

    for (const field of requiredFields) {
      if (!expData[field] || typeof expData[field] !== "string") {
        errors.push({
          field: `experience[${index}].${field}`,
          message: `Missing or invalid ${field}`,
          severity: "error",
        });
      }
    }

    if (expData.bulletPoints && !Array.isArray(expData.bulletPoints)) {
      errors.push({
        field: `experience[${index}].bulletPoints`,
        message: "Bullet points must be an array",
        severity: "error",
      });
    }

    return errors;
  }

  private validateEducation(edu: unknown, index: number): ParseError[] {
    const errors: ParseError[] = [];

    if (!edu || typeof edu !== "object") {
      errors.push({
        field: `education[${index}]`,
        message: "Education entry must be an object",
        severity: "error",
      });
      return errors;
    }

    const eduData = edu as Record<string, unknown>;
    const requiredFields = ["school", "degree"];

    for (const field of requiredFields) {
      if (!eduData[field] || typeof eduData[field] !== "string") {
        errors.push({
          field: `education[${index}].${field}`,
          message: `Missing or invalid ${field}`,
          severity: "error",
        });
      }
    }

    return errors;
  }
}
