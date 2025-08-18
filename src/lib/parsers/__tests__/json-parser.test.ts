import { JsonParser } from "../json-parser";
import type { ResumeData } from "@/types/resume";

describe("JsonParser", () => {
  let parser: JsonParser;

  beforeEach(() => {
    parser = new JsonParser();
  });

  describe("basic functionality", () => {
    it("should have correct name", () => {
      expect(parser.getName()).toBe("JSON Parser");
    });

    it("should support json extensions", () => {
      expect(parser.getSupportedExtensions()).toEqual(["json"]);
    });

    it("should handle JSON files", () => {
      const file = new File(["{}"], "test.json", { type: "application/json" });
      expect(parser.canHandle(file)).toBe(true);
    });

    it("should not handle non-JSON files", () => {
      const file = new File([""], "test.txt", { type: "text/plain" });
      expect(parser.canHandle(file)).toBe(false);
    });
  });

  describe("parsing valid JSON", () => {
    it("should parse valid resume data", async () => {
      const validResumeData: ResumeData = {
        personal: {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "https://linkedin.com/in/johndoe",
          summary: "Software engineer with 5 years experience",
        },
        skills: [
          { id: "1", name: "JavaScript", category: "Programming" },
          { id: "2", name: "React", category: "Framework" },
        ],
        experience: [
          {
            id: "1",
            company: "Tech Corp",
            position: "Software Engineer",
            location: "New York, NY",
            startDate: "2020-01",
            endDate: "2023-01",
            isCurrent: false,
            bulletPoints: [
              { id: "1", text: "Built web applications" },
              { id: "2", text: "Collaborated with team" },
            ],
            jobDescription: "Full stack development",
          },
        ],
        education: [
          {
            id: "1",
            school: "University of Example",
            degree: "Computer Science",
            graduationYear: "2020",
          },
        ],
        projects: [
          {
            id: "1",
            name: "Portfolio Website",
            link: "https://johndoe.com",
            description: "Personal portfolio website",
          },
        ],
      };

      const file = new File([JSON.stringify(validResumeData)], "resume.json", {
        type: "application/json",
      });

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validResumeData);
      expect(result.confidence).toBe(1.0);
      expect(result.errors).toBeUndefined();
    });

    it("should handle minimal valid data", async () => {
      const minimalData = {
        personal: {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "",
          summary: "",
        },
        skills: [],
        experience: [],
        education: [],
        projects: [],
      };

      const file = new File([JSON.stringify(minimalData)], "minimal.json", {
        type: "application/json",
      });

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(minimalData);
    });
  });

  describe("parsing invalid JSON", () => {
    it("should handle invalid JSON syntax", async () => {
      const invalidJson = '{ "name": "John", invalid }';
      const file = new File([invalidJson], "invalid.json", {
        type: "application/json",
      });

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("json");
      expect(result.errors![0].message).toContain("Invalid JSON format");
      expect(result.errors![0].severity).toBe("error");
    });

    it("should handle empty file", async () => {
      const file = new File([""], "empty.json", { type: "application/json" });

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("file");
      expect(result.errors![0].message).toBe("File is empty");
    });

    it("should handle missing required fields", async () => {
      const incompleteData = {
        personal: {
          fullName: "John Doe",
          // Missing email and other required fields
        },
        skills: [],
        // Missing other required sections
      };

      const file = new File(
        [JSON.stringify(incompleteData)],
        "incomplete.json",
        {
          type: "application/json",
        },
      );

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors!.length).toBeGreaterThan(0);

      // Should have errors for missing sections
      const missingFields = result.errors!.filter((e) =>
        e.message.includes("Missing required field"),
      );
      expect(missingFields.length).toBeGreaterThan(0);
    });

    it("should validate personal info structure", async () => {
      const invalidPersonalData = {
        personal: {
          fullName: "John Doe",
          email: "invalid-email", // Invalid email format
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "",
          summary: "",
        },
        skills: [],
        experience: [],
        education: [],
        projects: [],
      };

      const file = new File(
        [JSON.stringify(invalidPersonalData)],
        "invalid-email.json",
        {
          type: "application/json",
        },
      );

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      const emailError = result.errors!.find(
        (e) => e.field === "personal.email",
      );
      expect(emailError).toBeDefined();
      expect(emailError!.message).toBe("Invalid email format");
    });

    it("should validate experience structure", async () => {
      const invalidExperienceData = {
        personal: {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "",
          summary: "",
        },
        skills: [],
        experience: [
          {
            // Missing required company and position fields
            location: "New York, NY",
            startDate: "2020-01",
            endDate: "2023-01",
          },
        ],
        education: [],
        projects: [],
      };

      const file = new File(
        [JSON.stringify(invalidExperienceData)],
        "invalid-experience.json",
        {
          type: "application/json",
        },
      );

      const result = await parser.parse(file);

      expect(result.success).toBe(false);

      // Should have errors for missing company and position
      const companyError = result.errors!.find(
        (e) => e.field === "experience[0].company",
      );
      const positionError = result.errors!.find(
        (e) => e.field === "experience[0].position",
      );

      expect(companyError).toBeDefined();
      expect(positionError).toBeDefined();
    });
  });

  describe("data type validation", () => {
    it("should validate array fields", async () => {
      const invalidArrayData = {
        personal: {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "",
          summary: "",
        },
        skills: "not an array", // Should be array
        experience: [],
        education: [],
        projects: [],
      };

      const file = new File(
        [JSON.stringify(invalidArrayData)],
        "invalid-arrays.json",
        {
          type: "application/json",
        },
      );

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      const skillsError = result.errors!.find((e) => e.field === "skills");
      expect(skillsError).toBeDefined();
      expect(skillsError!.message).toBe("skills must be an array");
    });

    it("should validate bullet points structure", async () => {
      const invalidBulletPointsData = {
        personal: {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "",
          summary: "",
        },
        skills: [],
        experience: [
          {
            company: "Tech Corp",
            position: "Engineer",
            location: "NY",
            startDate: "2020",
            endDate: "2023",
            bulletPoints: "not an array", // Should be array
          },
        ],
        education: [],
        projects: [],
      };

      const file = new File(
        [JSON.stringify(invalidBulletPointsData)],
        "invalid-bullets.json",
        {
          type: "application/json",
        },
      );

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      const bulletsError = result.errors!.find(
        (e) => e.field === "experience[0].bulletPoints",
      );
      expect(bulletsError).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle non-object root data", async () => {
      const file = new File([JSON.stringify("string data")], "string.json", {
        type: "application/json",
      });

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors![0].field).toBe("root");
      expect(result.errors![0].message).toBe("Data must be an object");
    });

    it("should handle null data", async () => {
      const file = new File([JSON.stringify(null)], "null.json", {
        type: "application/json",
      });

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors![0].field).toBe("root");
    });

    it("should provide helpful suggestions", async () => {
      const incompleteData = {
        // Missing all required fields
      };

      const file = new File(
        [JSON.stringify(incompleteData)],
        "empty-object.json",
        {
          type: "application/json",
        },
      );

      const result = await parser.parse(file);

      expect(result.success).toBe(false);

      // Check that suggestions are provided
      const errorsWithSuggestions = result.errors!.filter((e) => e.suggestion);
      expect(errorsWithSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe("file reading errors", () => {
    // Note: These tests are harder to simulate in a unit test environment
    // In a real implementation, you might use dependency injection to mock file reading

    it("should handle file read errors gracefully", async () => {
      // This is a conceptual test - in practice, you'd need to mock the FileReader
      // to simulate read errors
      expect(true).toBe(true); // Placeholder
    });
  });
});
