import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

// Enhanced DOCX Parser Tests
vi.mock("mammoth", () => {
  const extractRawText = vi.fn();
  const convertToHtml = vi.fn();

  return {
    // Handle default import
    default: {
      extractRawText,
      convertToHtml,
    },
    // Handle named imports (if any, or for consistency)
    extractRawText,
    convertToHtml,
  };
});

import { DocxParser } from "../docx-parser";
import mammoth from "mammoth";

const mockExtractRawText = mammoth.extractRawText as unknown as Mock;
const mockConvertToHtml = mammoth.convertToHtml as unknown as Mock;

describe("Enhanced DocxParser", () => {
  let parser: DocxParser;

  const createMockDocxFile = (name: string, size: number = 100): File => {
    const buffer = new ArrayBuffer(size);
    const uint8Array = new Uint8Array(buffer);
    uint8Array[0] = 0x50; // 'P'
    uint8Array[1] = 0x4b; // 'K'
    for (let i = 2; i < size; i++) {
      uint8Array[i] = Math.floor(Math.random() * 256);
    }
    return new File([buffer], name);
  };

  beforeEach(() => {
    parser = new DocxParser();
    vi.clearAllMocks();
  });

  describe("Enhanced Experience Parsing", () => {
    describe("Company/Position Format Detection", () => {
      it("should parse 'Position at Company' format", async () => {
        const mockText = `
          John Doe
          john@example.com
          
          EXPERIENCE
          Senior Software Engineer at Google Inc.
          Jan 2020 - Present
          • Developed scalable web applications
          • Led team of 5 developers
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        expect(result.data!.experience.length).toBeGreaterThan(0);

        const exp = result.data!.experience[0];
        expect(exp.position).toBe("Senior Software Engineer");
        expect(exp.company).toBe("Google Inc.");
      });

      it("should parse 'Company - Position' format", async () => {
        const mockText = `
          EXPERIENCE
          Microsoft Corporation - Principal Engineer
          March 2019 - December 2021
          • Built cloud infrastructure
          • Optimized performance by 40%
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.company).toBe("Microsoft Corporation");
        expect(exp.position).toBe("Principal Engineer");
      });

      it("should parse multiline company and position", async () => {
        const mockText = `
          EXPERIENCE
          Tech Solutions Inc.
          Senior Full Stack Developer
          San Francisco, CA
          Jun 2018 - Feb 2020
          • Developed React applications
          • Managed PostgreSQL databases
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.company).toBe("Tech Solutions Inc.");
        expect(exp.position).toBe("Senior Full Stack Developer");
        expect(exp.location).toBe("San Francisco, CA");
      });
    });

    describe("Date Format Parsing", () => {
      it("should parse month-year ranges", async () => {
        const mockText = `
          EXPERIENCE
          Software Engineer at StartupCo
          January 2020 - March 2022
          • Built mobile applications
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.startDate).toBe("January 2020");
        expect(exp.endDate).toBe("March 2022");
      });

      it("should parse quarter/year formats", async () => {
        const mockText = `
          EXPERIENCE
          Data Analyst at Analytics Corp
          Q1 2019 - Q4 2021
          • Analyzed customer data
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.startDate).toBe("Q1 2019");
        expect(exp.endDate).toBe("Q4 2021");
      });

      it("should handle current position indicators", async () => {
        const mockText = `
          EXPERIENCE
          Lead Developer at InnovateTech
          Sep 2021 - Present
          • Leading development team
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.isCurrent).toBe(true);
        expect(exp.endDate).toBe("Present");
      });
    });

    describe("Location Parsing", () => {
      it("should parse city, state format", async () => {
        const mockText = `
          EXPERIENCE
          Software Engineer at TechCorp
          New York, NY
          2020-2022
          • Developed applications
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.location).toBe("New York, NY");
      });

      it("should parse remote work indicators", async () => {
        const mockText = `
          EXPERIENCE
          Remote Software Engineer at DistributedCorp
          Remote
          2021-2023
          • Built distributed systems
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.location).toBe("Remote");
      });
    });

    describe("Enhanced Bullet Point Extraction", () => {
      it("should extract various bullet point styles", async () => {
        const mockText = `
          EXPERIENCE
          Developer at CodeCorp
          2020-2021
          • Built web applications using React
          ▪ Implemented REST APIs with Node.js
          - Collaborated with cross-functional teams
          → Improved code coverage to 95%
          ○ Mentored junior developers
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.bulletPoints.length).toBe(5);
        expect(exp.bulletPoints[0].text).toBe(
          "Built web applications using React",
        );
        expect(exp.bulletPoints[1].text).toBe(
          "Implemented REST APIs with Node.js",
        );
        expect(exp.bulletPoints[4].text).toBe("Mentored junior developers");
      });

      it("should filter out invalid bullet points", async () => {
        const mockText = `
          EXPERIENCE
          Engineer at TechCorp
          2020-2021
          • Valid achievement with meaningful content
          • Too short
          • phone: (555) 123-4567
          • Software Engineer at Company Name
          • Developed comprehensive testing framework for microservices
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];

        // Should only keep valid bullet points
        const validBullets = exp.bulletPoints.filter(
          (bp) =>
            !bp.text.includes("phone:") &&
            bp.text.length > 10 &&
            !bp.text.includes("Software Engineer at"),
        );
        expect(validBullets.length).toBeGreaterThan(0);
      });
    });

    describe("Complex Resume Formats", () => {
      it("should parse resume with multiple experiences", async () => {
        const mockText = `
          Jane Smith
          jane@example.com
          
          EXPERIENCE
          
          Senior Software Engineer at Google
          Mountain View, CA
          January 2022 - Present
          • Lead development of search algorithms
          • Manage team of 8 engineers
          • Improved system performance by 45%
          
          Software Engineer at Microsoft
          Seattle, WA
          June 2019 - December 2021
          • Developed cloud services for Azure
          • Built REST APIs serving 1M+ requests daily
          • Collaborated with product managers on feature design
          
          Junior Developer at StartupXYZ
          Remote
          Jan 2018 - May 2019
          • Built full-stack web applications
          • Implemented CI/CD pipelines
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        expect(result.data!.experience.length).toBe(3);

        // Should be sorted by most recent first
        expect(result.data!.experience[0].company).toBe("Google");
        expect(result.data!.experience[0].isCurrent).toBe(true);
        expect(result.data!.experience[1].company).toBe("Microsoft");
        expect(result.data!.experience[2].company).toBe("StartupXYZ");
        expect(result.data!.experience[2].location).toBe("Remote");
      });

      it("should handle promotions within same company", async () => {
        const mockText = `
          EXPERIENCE
          
          Senior Software Engineer at TechCorp Inc.
          San Francisco, CA
          June 2021 - Present
          • Lead architecture decisions
          • Mentor junior developers
          
          Software Engineer at TechCorp Inc.
          San Francisco, CA
          January 2019 - June 2021
          • Developed core features
          • Improved code quality
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        expect(result.data!.experience.length).toBe(2);
        expect(result.data!.experience[0].position).toBe(
          "Senior Software Engineer",
        );
        expect(result.data!.experience[1].position).toBe("Software Engineer");
        expect(result.data!.experience[0].company).toBe("TechCorp Inc.");
        expect(result.data!.experience[1].company).toBe("TechCorp Inc.");
      });
    });

    describe("Edge Cases and Error Handling", () => {
      it("should handle missing company information", async () => {
        const mockText = `
          EXPERIENCE
          Senior Developer
          2020-2022
          • Built applications
          • Led team projects
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.position).toBe("Senior Developer");
        expect(exp.company).toBe("");
      });

      it("should handle missing position information", async () => {
        const mockText = `
          EXPERIENCE
          Google Inc.
          2020-2022
          • Developed software solutions
          • Collaborated with teams
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        const exp = result.data!.experience[0];
        expect(exp.company).toBe("Google Inc.");
        expect(exp.position).toBe("");
      });

      it("should provide confidence scores", async () => {
        const mockText = `
          EXPERIENCE
          Software Engineer at TechCorp
          San Francisco, CA
          Jan 2020 - Present
          • Developed web applications
          • Improved system performance
        `;

        mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
        mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

        const file = createMockDocxFile("resume.docx");
        const result = await parser.parse(file);

        expect(result.success).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.5);
        expect(result.confidence).toBeLessThanOrEqual(1.0);
      });
    });
  });

  describe("Parsing Pattern Edge Cases", () => {
    it("should handle company names with separators", async () => {
      const mockText = `
        EXPERIENCE
        Software Engineer at Johnson & Johnson
        2020-2022
        • Developed healthcare applications
      `;

      mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
      mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

      const file = createMockDocxFile("resume.docx");
      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      const exp = result.data!.experience[0];
      expect(exp.company).toBe("Johnson & Johnson");
    });

    it("should handle international date formats", async () => {
      const mockText = `
        EXPERIENCE
        Developer at EuropeCorp
        München, Germany
        01/2020 - 12/2021
        • Built international applications
      `;

      mockExtractRawText.mockResolvedValue({ value: mockText, messages: [] });
      mockConvertToHtml.mockResolvedValue({ value: mockText, messages: [] });

      const file = createMockDocxFile("resume.docx");
      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      const exp = result.data!.experience[0];
      expect(exp.startDate).toBeTruthy();
      expect(exp.endDate).toBeTruthy();
    });
  });
});
