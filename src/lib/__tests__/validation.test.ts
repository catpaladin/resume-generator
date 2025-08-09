import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validateSectionLengths,
  validateRequiredFields,
  validateBulletPoints,
  validateProjectDescriptions,
  validateResumeData,
  hasValidationErrors,
  getFieldError,
} from "../validation";
import { initialResumeData } from "@/config/constants";
import type { ResumeData } from "@/types/resume";

describe("Validation Utilities", () => {
  describe("isValidEmail", () => {
    it("should return true for valid email formats", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
      expect(isValidEmail("simple@test.org")).toBe(true);
    });

    it("should return false for invalid email formats", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test.example.com")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("should return true for valid phone formats", () => {
      expect(isValidPhone("1234567890")).toBe(true);
      expect(isValidPhone("(123) 456-7890")).toBe(true);
      expect(isValidPhone("123-456-7890")).toBe(true);
      expect(isValidPhone("+1-123-456-7890")).toBe(true);
      expect(isValidPhone("123 456 7890")).toBe(true);
    });

    it("should return false for invalid phone formats", () => {
      expect(isValidPhone("123")).toBe(false);
      expect(isValidPhone("abc")).toBe(false);
      expect(isValidPhone("123-45")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("should return true for valid URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://test.org")).toBe(true);
      expect(isValidUrl("https://www.linkedin.com/in/username")).toBe(true);
    });

    it("should return false for invalid URLs", () => {
      expect(isValidUrl("invalid-url")).toBe(false);
      expect(isValidUrl("http://")).toBe(false);
      expect(isValidUrl("https://")).toBe(false);
      expect(isValidUrl("www.example.com")).toBe(false);
    });
  });

  describe("validateSectionLengths", () => {
    it("should return no errors for valid section lengths", () => {
      const validData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
          summary: "A brief summary",
        },
        skills: Array(5).fill({ id: "1", name: "JavaScript" }),
        experience: Array(3).fill({
          id: "1",
          company: "Company",
          position: "Developer",
          location: "Location",
          startDate: "2020",
          endDate: "2022",
          bulletPoints: [{ id: "1", text: "Did something" }],
        }),
        education: Array(2).fill({
          id: "1",
          school: "University",
          degree: "Bachelor's",
          graduationYear: "2020",
        }),
        projects: Array(3).fill({
          id: "1",
          name: "Project",
          link: "https://example.com",
          description: "A brief description",
        }),
      };

      const errors = validateSectionLengths(validData);
      expect(errors).toHaveLength(0);
    });

    it("should return errors when sections exceed maximum items", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
        },
        skills: Array(15).fill({ id: "1", name: "JavaScript" }),
        experience: Array(10).fill({
          id: "1",
          company: "Company",
          position: "Developer",
          location: "Location",
          startDate: "2020",
          endDate: "2022",
          bulletPoints: [{ id: "1", text: "Did something" }],
        }),
      };

      const errors = validateSectionLengths(invalidData);
      expect(errors).toHaveLength(2);
      expect(errors[0].field).toBe("skills");
      expect(errors[1].field).toBe("experience");
    });

    it("should return errors when fields exceed maximum length", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "A".repeat(150), // Exceeds NAME_MAX_LENGTH
          summary: "B".repeat(600), // Exceeds SUMMARY_MAX_LENGTH
        },
      };

      const errors = validateSectionLengths(invalidData);
      expect(errors).toHaveLength(2);
      expect(errors[0].field).toBe("fullName");
      expect(errors[1].field).toBe("summary");
    });
  });

  describe("validateRequiredFields", () => {
    it("should return error when fullName is empty", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "",
        },
      };

      const errors = validateRequiredFields(invalidData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("fullName");
    });

    it("should return error when email is invalid", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
          email: "invalid-email",
        },
      };

      const errors = validateRequiredFields(invalidData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("email");
    });

    it("should return error when phone is invalid", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
          phone: "123",
        },
      };

      const errors = validateRequiredFields(invalidData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("phone");
    });

    it("should return error when LinkedIn URL is invalid", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
          linkedin: "invalid-url",
        },
      };

      const errors = validateRequiredFields(invalidData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("linkedin");
    });
  });

  describe("validateBulletPoints", () => {
    it("should return no errors for valid bullet points", () => {
      const validData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
        },
        experience: [
          {
            id: "1",
            company: "Company",
            position: "Developer",
            location: "Location",
            startDate: "2020",
            endDate: "2022",
            bulletPoints: Array(3).fill({ id: "1", text: "Did something" }),
          },
        ],
      };

      const errors = validateBulletPoints(validData);
      expect(errors).toHaveLength(0);
    });

    it("should return errors when bullet points exceed maximum length", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
        },
        experience: [
          {
            id: "1",
            company: "Company",
            position: "Developer",
            location: "Location",
            startDate: "2020",
            endDate: "2022",
            bulletPoints: [
              { id: "1", text: "A".repeat(300) }, // Exceeds BULLET_POINT_MAX_LENGTH
            ],
          },
        ],
      };

      const errors = validateBulletPoints(invalidData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("experience[0].bulletPoints[0]");
    });
  });

  describe("validateProjectDescriptions", () => {
    it("should return no errors for valid project descriptions", () => {
      const validData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
        },
        projects: [
          {
            id: "1",
            name: "Project",
            link: "https://example.com",
            description: "A brief description",
          },
        ],
      };

      const errors = validateProjectDescriptions(validData);
      expect(errors).toHaveLength(0);
    });

    it("should return errors when project descriptions exceed maximum length", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
        },
        projects: [
          {
            id: "1",
            name: "Project",
            link: "https://example.com",
            description: "A".repeat(400), // Exceeds PROJECT_DESCRIPTION_MAX_LENGTH
          },
        ],
      };

      const errors = validateProjectDescriptions(invalidData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("projects[0].description");
    });

    it("should return errors when project links are invalid URLs", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
        },
        projects: [
          {
            id: "1",
            name: "Project",
            link: "invalid-url",
            description: "A brief description",
          },
        ],
      };

      const errors = validateProjectDescriptions(invalidData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("projects[0].link");
    });
  });

  describe("validateResumeData", () => {
    it("should combine all validation errors", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "",
          email: "invalid-email",
        },
        skills: Array(15).fill({ id: "1", name: "JavaScript" }),
        experience: [
          {
            id: "1",
            company: "Company",
            position: "Developer",
            location: "Location",
            startDate: "2020",
            endDate: "2022",
            bulletPoints: [
              { id: "1", text: "A".repeat(300) }, // Exceeds BULLET_POINT_MAX_LENGTH
            ],
          },
        ],
        projects: [
          {
            id: "1",
            name: "Project",
            link: "invalid-url",
            description: "A".repeat(400), // Exceeds PROJECT_DESCRIPTION_MAX_LENGTH
          },
        ],
      };

      const errors = validateResumeData(invalidData);
      expect(errors).toHaveLength(6);
    });
  });

  describe("hasValidationErrors", () => {
    it("should return true when there are validation errors", () => {
      const invalidData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "",
        },
      };

      expect(hasValidationErrors(invalidData)).toBe(true);
    });

    it("should return false when there are no validation errors", () => {
      const validData: ResumeData = {
        ...initialResumeData,
        personal: {
          ...initialResumeData.personal,
          fullName: "John Doe",
        },
      };

      expect(hasValidationErrors(validData)).toBe(false);
    });
  });

  describe("getFieldError", () => {
    it("should return the error message for a specific field", () => {
      const errors = [
        { field: "fullName", message: "This field is required" },
        { field: "email", message: "Please enter a valid email address" },
      ];

      expect(getFieldError(errors, "fullName")).toBe("This field is required");
      expect(getFieldError(errors, "email")).toBe(
        "Please enter a valid email address",
      );
    });

    it("should return undefined when no error exists for a field", () => {
      const errors = [{ field: "fullName", message: "This field is required" }];

      expect(getFieldError(errors, "email")).toBeUndefined();
    });
  });
});
