import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { PdfParser } from "../pdf-parser";
import * as pdfjs from "pdfjs-dist";

vi.mock("pdfjs-dist", () => {
  return {
    getDocument: vi.fn(),
    GlobalWorkerOptions: {
      workerSrc: "",
    },
    version: "5.4.449",
  };
});

describe("PdfParser", () => {
  let parser: PdfParser;

  beforeEach(() => {
    parser = new PdfParser();
    vi.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should have correct name", () => {
      expect(parser.getName()).toBe("PDF Parser");
    });

    it("should support pdf extensions", () => {
      expect(parser.getSupportedExtensions()).toEqual(["pdf"]);
    });

    it("should handle PDF files", () => {
      const file = new File([""], "test.pdf", { type: "application/pdf" });
      expect(parser.canHandle(file)).toBe(true);
    });

    it("should not handle non-PDF files", () => {
      const file = new File([""], "test.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      expect(parser.canHandle(file)).toBe(false);
    });
  });

  describe("parsing successful documents", () => {
    it("should parse a simple PDF resume", async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: "John Doe", transform: [0, 0, 0, 0, 0, 100] },
            { str: "john@example.com", transform: [0, 0, 0, 0, 0, 90] },
            { str: "EXPERIENCE", transform: [0, 0, 0, 0, 0, 80] },
            {
              str: "Software Engineer at Tech Corp",
              transform: [0, 0, 0, 0, 0, 70],
            },
            { str: "2020 - Present", transform: [0, 0, 0, 0, 0, 60] },
          ],
        }),
      };

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      };

      (pdfjs.getDocument as Mock).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      });

      const file = new File(["dummy content"], "resume.pdf", {
        type: "application/pdf",
      });
      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.personal.fullName).toBe("John Doe");
      expect(result.data?.personal.email).toBe("john@example.com");
      expect(result.data?.experience.length).toBeGreaterThan(0);
      expect(result.data?.experience[0].company).toBe("Tech Corp");
    });

    it("should handle multiple pages", async () => {
      const mockPage1 = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: "John Doe", transform: [0, 0, 0, 0, 0, 100] },
            { str: "Page 1 Content", transform: [0, 0, 0, 0, 0, 90] },
          ],
        }),
      };
      const mockPage2 = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: "Page 2 Content", transform: [0, 0, 0, 0, 0, 100] },
            { str: "SKILLS", transform: [0, 0, 0, 0, 0, 90] },
            { str: "JavaScript", transform: [0, 0, 0, 0, 0, 80] },
          ],
        }),
      };

      const mockPdf = {
        numPages: 2,
        getPage: vi.fn().mockImplementation((pageNo) => {
          if (pageNo === 1) return Promise.resolve(mockPage1);
          if (pageNo === 2) return Promise.resolve(mockPage2);
          return Promise.reject(new Error("Invalid page"));
        }),
      };

      (pdfjs.getDocument as Mock).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      });

      const file = new File(["dummy content"], "resume.pdf", {
        type: "application/pdf",
      });
      const result = await parser.parse(file);

      expect(result.success).toBe(true);
      expect(result.data?.personal.fullName).toBe("John Doe");
      expect(result.data?.skills.some((s) => s.name === "JavaScript")).toBe(
        true,
      );
    });
  });

  describe("error handling", () => {
    it("should handle empty PDF content", async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [],
        }),
      };

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      };

      (pdfjs.getDocument as Mock).mockReturnValue({
        promise: Promise.resolve(mockPdf),
      });

      const file = new File(["dummy content"], "empty.pdf", {
        type: "application/pdf",
      });
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].field).toBe("content");
    });

    it("should handle PDF loading errors", async () => {
      (pdfjs.getDocument as Mock).mockImplementation(() => ({
        promise: Promise.reject(new Error("Invalid PDF structure")),
      }));

      const file = new File(["invalid content"], "invalid.pdf", {
        type: "application/pdf",
      });
      const result = await parser.parse(file);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].field).toBe("parsing");
      expect(result.errors?.[0].message).toContain("Invalid PDF structure");
    });
  });
});
