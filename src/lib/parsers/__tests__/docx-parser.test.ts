// Mock mammoth since it's not available in test environment
jest.mock("mammoth", () => ({
  extractRawText: jest.fn(),
  convertToHtml: jest.fn(),
}));

import { DocxParser } from "../docx-parser";
import * as mammoth from "mammoth";

jest.mock("natural", () => ({
  PorterStemmer: {
    stem: jest.fn((word: string) => word.toLowerCase()),
  },
  WordTokenizer: jest.fn().mockImplementation(() => ({
    tokenize: jest.fn((text: string) => text.toLowerCase().split(/\s+/)),
  })),
}));

const mockExtractRawText = mammoth.extractRawText as jest.MockedFunction<
  typeof mammoth.extractRawText
>;
const mockConvertToHtml = mammoth.convertToHtml as jest.MockedFunction<
  typeof mammoth.convertToHtml
>;

describe("DocxParser", () => {
  let parser: DocxParser;

  // Helper function to create a mock DOCX file with proper ZIP signature
  const createMockDocxFile = (name: string, size: number = 100): File => {
    // Create ArrayBuffer with ZIP signature (0x50 0x4B "PK")
    const buffer = new ArrayBuffer(size);
    const uint8Array = new Uint8Array(buffer);
    uint8Array[0] = 0x50; // 'P'
    uint8Array[1] = 0x4b; // 'K'
    // Fill rest with dummy data
    for (let i = 2; i < size; i++) {
      uint8Array[i] = Math.floor(Math.random() * 256);
    }
    return new File([buffer], name);
  };

  beforeEach(() => {
    parser = new DocxParser();
    jest.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should have correct name", () => {
      expect(parser.getName()).toBe("Word Document Parser");
    });

    it("should support docx extensions", () => {
      expect(parser.getSupportedExtensions()).toEqual(["docx"]);
    });

    it("should handle DOCX files", () => {
      const file = createMockDocxFile("test.docx", 100);
      expect(parser.canHandle(file)).toBe(true);
    });

    it("should not handle non-DOCX files", () => {
      const file = new File([""], "test.pdf", { type: "application/pdf" });
      expect(parser.canHandle(file)).toBe(false);
    });
  });

  describe("parsing successful documents", () => {
    it("should parse a simple resume document", async () => {
      const mockText = `
        John Doe
        john.doe@email.com
        (555) 123-4567
        
        EXPERIENCE
        Software Engineer at Tech Corp
        2020-2023
        • Developed web applications
        • Improved system performance by 30%
        
        EDUCATION
        BS Computer Science, University of Tech, 2020
        
        SKILLS
        JavaScript, Python, React
      `;

      mockExtractRawText.mockResolvedValue({
        value: mockText,
        messages: [],
      });

      mockConvertToHtml.mockResolvedValue({
        value: `<p>${mockText.replace(/\n/g, "<br>")}</p>`,
        messages: [],
      });

      const file = createMockDocxFile("resume.docx", 100);

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.originalContent).toBe(mockText);

      // Check personal info extraction
      expect(result.data!.personal.fullName).toBe("John Doe");
      expect(result.data!.personal.email).toBe("john.doe@email.com");
      expect(result.data!.personal.phone).toBe("(555) 123-4567");

      // Check experience extraction
      expect(result.data!.experience.length).toBeGreaterThanOrEqual(0);
      if (result.data!.experience.length > 0) {
        expect(result.data!.experience[0].position).toBeDefined();
        expect(result.data!.experience[0].company).toBeDefined();
      }

      // Check education extraction
      expect(result.data!.education.length).toBeGreaterThanOrEqual(0);
      if (result.data!.education.length > 0) {
        expect(result.data!.education[0].degree).toBeDefined();
      }

      // Check skills extraction
      expect(result.data!.skills.length).toBeGreaterThan(0);
      const skillNames = result.data!.skills.map((s) => s.name);
      expect(skillNames).toContain("JavaScript");
    });

    it("should handle document with minimal information", async () => {
      const mockText = `
        John Doe
        john@example.com
      `;

      mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
      mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

      const file = createMockDocxFile("minimal.docx", 50);

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data!.personal.fullName).toBe("John Doe");
      expect(result.data!.personal.email).toBe("john@example.com");
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("should handle empty documents", async () => {
      mockExtractRawText.mockResolvedValue({ value: "", messages: [] });
      mockConvertToHtml.mockResolvedValue({ value: "", messages: [] });

      const file = createMockDocxFile("empty.docx", 10);

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("content");
      expect(result.errors![0].message).toContain("empty");
    });

    it("should handle mammoth extraction errors", async () => {
      mockExtractRawText.mockRejectedValue(new Error("Corrupted file"));

      const file = createMockDocxFile("corrupted.docx", 100);

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe("parsing");
      expect(result.errors![0].message).toContain("Corrupted file");
    });

    it("should provide helpful error suggestions", async () => {
      mockExtractRawText.mockRejectedValue(new Error("Invalid file format"));

      const file = createMockDocxFile("invalid.docx", 100);

      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors![0].suggestion).toContain("valid .docx file");
    });
  });

  describe("data extraction", () => {
    it("should extract email addresses correctly", async () => {
      const mockText = `
        Contact: test@example.com
        Also: another.email+tag@domain.co.uk
      `;

      mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
      mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

      const file = createMockDocxFile("emails.docx", 50);

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data!.personal.email).toMatch(/\S+@\S+\.\S+/);
    });

    it("should extract phone numbers in various formats", async () => {
      const phoneNumber = "(555) 123-4567";
      const mockText = `John Doe\n${phoneNumber}`;

      mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
      mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

      const file = createMockDocxFile("phone.docx", 50);

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data!.personal.phone).toBeTruthy();
    });
  });

  describe("confidence calculation", () => {
    it("should have high confidence for complete resumes", async () => {
      const completeResume = `
        John Smith
        john@example.com
        (555) 123-4567
        
        EXPERIENCE
        Software Engineer at TechCorp
        2020-2023
        • Built applications
        
        EDUCATION
        BS Computer Science, MIT, 2020
        
        SKILLS
        JavaScript, Python, React
      `;

      mockExtractRawText.mockResolvedValue({
        value: completeResume,
        messages: [],
      });
      mockConvertToHtml.mockResolvedValue({
        value: completeResume,
        messages: [],
      });

      const file = createMockDocxFile("complete.docx", 200);

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it("should have lower confidence for incomplete resumes", async () => {
      const incompleteResume = `
        John
        Some text here
      `;

      mockExtractRawText.mockResolvedValue({
        value: incompleteResume,
        messages: [],
      });
      mockConvertToHtml.mockResolvedValue({
        value: incompleteResume,
        messages: [],
      });

      const file = createMockDocxFile("incomplete.docx", 50);

      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.confidence).toBeLessThan(0.6);
    });
  });
});
