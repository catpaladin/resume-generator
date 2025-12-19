import type { Parser, ParseResult } from "./index";
import { getFileExtension } from "./index";
import { normalizeResumeData } from "../validators/schemas";
import { BaseParser } from "./base-parser";

export class PdfParser extends BaseParser implements Parser {
  private pdfjs: any = null;

  private async getPdfJs() {
    if (this.pdfjs) return this.pdfjs;

    // Dynamic import to avoid SSR issues with DOMMatrix
    this.pdfjs = await import("pdfjs-dist");

    // Set worker source
    if (
      typeof window !== "undefined" &&
      !this.pdfjs.GlobalWorkerOptions.workerSrc
    ) {
      // For Vite/Astro, we can use the ?url suffix to get the worker path
      // or use the legacy approach of setting it to the CDN.
      // However, the CDN might fail due to version mismatch or network issues.
      // The most reliable way in Vite is to use the worker constructor.
      try {
        // @ts-ignore
        const Worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
        this.pdfjs.GlobalWorkerOptions.workerSrc = Worker.default;
      } catch (e) {
        // Fallback to a known working CDN version if local fails
        this.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${this.pdfjs.version}/build/pdf.worker.min.mjs`;
      }
    }

    return this.pdfjs;
  }

  getName(): string {
    return "PDF Parser";
  }

  getSupportedExtensions(): string[] {
    return ["pdf"];
  }

  canHandle(file: File): boolean {
    const extension = getFileExtension(file);
    return this.getSupportedExtensions().includes(extension);
  }

  async parse(file: File): Promise<ParseResult> {
    try {
      const pdfjs = await this.getPdfJs();
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let lastY = -1;
        let pageText = "";

        for (const item of textContent.items as any[]) {
          // item.transform[5] is the y-coordinate
          if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += "\n";
          }
          pageText += item.str + " ";
          lastY = item.transform[5];
        }

        fullText += pageText + "\n";
      }

      if (!fullText.trim()) {
        return {
          success: false,
          errors: [
            {
              field: "content",
              message: "PDF appears to be empty or unreadable",
              severity: "error",
              suggestion: "Please check that the PDF contains selectable text",
            },
          ],
        };
      }

      // Parse sections from the text
      const sections = this.identifySections(fullText);

      // Extract structured data
      const extractedData = await this.extractResumeData(fullText, sections);

      // Validate and normalize the data
      const normalizedData = normalizeResumeData(extractedData);

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(
        sections,
        extractedData,
      );

      // Collect any parsing warnings
      const warnings = this.generateWarnings(extractedData, sections);

      return {
        success: true,
        data: normalizedData,
        confidence,
        warnings,
        originalContent: fullText,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        errors: [
          {
            field: "parsing",
            message: `Failed to parse PDF document: ${errorMessage}`,
            severity: "error",
            suggestion:
              "Please ensure the document is a valid PDF file with selectable text",
          },
        ],
      };
    }
  }

  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }
}
