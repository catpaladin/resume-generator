import type { Parser, ParseResult } from "./index";
import { getFileExtension } from "./index";
import { normalizeResumeData } from "../validators/schemas";
import { BaseParser } from "./base-parser";

export class PdfParser extends BaseParser implements Parser {
  private pdfjs: any = null;

  private async getPdfJs() {
    if (this.pdfjs) return this.pdfjs;

    console.log("Loading PDF.js...");
    try {
      // Try to import the main module
      // In Vite/Astro, sometimes the bare import fails, so we try the specific ESM build
      try {
        this.pdfjs = await import("pdfjs-dist");
        console.log("Imported pdfjs-dist successfully");
      } catch (e) {
        try {
          // @ts-ignore
          this.pdfjs = await import("pdfjs-dist/build/pdf.mjs");
          console.log("Imported pdfjs-dist/build/pdf.mjs successfully");
        } catch (e2) {
          console.warn(
            "Failed to import modern pdfjs-dist, trying legacy build",
            e2,
          );
          // @ts-ignore
          this.pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
          console.log("Imported pdfjs-dist/legacy/build/pdf.mjs successfully");
        }
      }

      // Set worker source
      if (
        typeof window !== "undefined" &&
        !this.pdfjs.GlobalWorkerOptions.workerSrc
      ) {
        try {
          // Try to get the worker URL via Vite's ?url suffix
          // @ts-ignore
          const Worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
          this.pdfjs.GlobalWorkerOptions.workerSrc = Worker.default || Worker;
        } catch (e) {
          console.warn("Failed to load local worker, falling back to CDN", e);
          // Fallback to CDN with a specific version that matches the package
          const version = this.pdfjs.version || "5.4.449";
          this.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
        }
      }
    } catch (error) {
      console.error("Critical error loading PDF.js:", error);
      throw error;
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
