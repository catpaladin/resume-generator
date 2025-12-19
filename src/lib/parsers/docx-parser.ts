import mammoth from "mammoth";
import type { Parser, ParseResult } from "./index";
import { getFileExtension } from "./index";
import { normalizeResumeData } from "../validators/schemas";
import { BaseParser } from "./base-parser";

export class DocxParser extends BaseParser implements Parser {
  getName(): string {
    return "Word Document Parser";
  }

  getSupportedExtensions(): string[] {
    return ["docx"];
  }

  canHandle(file: File): boolean {
    const extension = getFileExtension(file);
    return this.getSupportedExtensions().includes(extension);
  }

  async parse(file: File): Promise<ParseResult> {
    try {
      // Validate file before processing
      const validationResult = await this.validateDocxFile(file);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: [
            {
              field: "file",
              message: validationResult.error || "Invalid DOCX file",
              severity: "error",
              suggestion: validationResult.suggestion,
            },
          ],
        };
      }

      // Convert docx to HTML and plain text
      const arrayBuffer = await this.fileToArrayBuffer(file);

      // Try to extract text with better error handling
      let result: { value: string; messages: unknown[] };
      // let htmlResult: { value: string; messages: unknown[] }; // htmlResult is not used in BaseParser's extractResumeData

      try {
        result = await mammoth.extractRawText({ arrayBuffer });
        // htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      } catch (mammothError) {
        // If mammoth fails, try to provide more specific error information
        const errorMessage =
          mammothError instanceof Error
            ? mammothError.message
            : "Unknown parsing error";

        if (
          errorMessage.includes("zip") ||
          errorMessage.includes("central directory")
        ) {
          return {
            success: false,
            errors: [
              {
                field: "file",
                message:
                  "The DOCX file appears to be corrupted or not a valid Word document",
                severity: "error",
                suggestion:
                  "Try opening the file in Microsoft Word and saving it again, or export it as a new DOCX file",
              },
            ],
          };
        }

        throw mammothError; // Re-throw if it's a different error
      }

      if (!result.value.trim()) {
        return {
          success: false,
          errors: [
            {
              field: "content",
              message: "Document appears to be empty or unreadable",
              severity: "error",
              suggestion:
                "Please check that the document contains text content",
            },
          ],
        };
      }

      const plainText = result.value;

      // Parse sections from the text
      const sections = this.identifySections(plainText);

      // Extract structured data
      const extractedData = await this.extractResumeData(plainText, sections);

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
        originalContent: plainText,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        errors: [
          {
            field: "parsing",
            message: `Failed to parse Word document: ${errorMessage}`,
            severity: "error",
            suggestion:
              "Please ensure the document is a valid .docx file created by Microsoft Word or a compatible application",
          },
        ],
      };
    }
  }

  private async validateDocxFile(file: File): Promise<{
    isValid: boolean;
    error?: string;
    suggestion?: string;
  }> {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return {
        isValid: false,
        error: "File does not have a .docx extension",
        suggestion:
          "Please ensure you're uploading a Microsoft Word document (.docx)",
      };
    }

    // Check file size (basic validation)
    if (file.size === 0) {
      return {
        isValid: false,
        error: "File appears to be empty",
        suggestion: "Please check that the file contains content",
      };
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return {
        isValid: false,
        error: "File is too large",
        suggestion: "Please use a smaller DOCX file (under 50MB)",
      };
    }

    // Try to read the first few bytes to check if it looks like a ZIP file (DOCX format)
    try {
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));

      // DOCX files are ZIP archives, so they should start with ZIP signature
      // ZIP signature: 0x50 0x4B ("PK")
      if (
        uint8Array.length >= 2 &&
        uint8Array[0] === 0x50 &&
        uint8Array[1] === 0x4b
      ) {
        return { isValid: true };
      }

      return {
        isValid: false,
        error: "File does not appear to be a valid DOCX format",
        suggestion:
          "Please ensure the file is a genuine Microsoft Word document (.docx)",
      };
    } catch {
      return {
        isValid: false,
        error: "Unable to read file",
        suggestion: "Please try uploading the file again",
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
