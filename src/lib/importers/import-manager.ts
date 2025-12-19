import type { ResumeData } from "@/types/resume";
import type { ParseResult } from "../parsers";
import { ParserFactory, validateFileSize } from "../parsers";
import { JsonParser } from "../parsers/json-parser";
import { DocxParser } from "../parsers/docx-parser";
import { PdfParser } from "../parsers/pdf-parser";
import {
  validateResumeData,
  type ValidationResult,
} from "../validators/schemas";

// Register all available parsers
ParserFactory.registerParser(new JsonParser());
ParserFactory.registerParser(new DocxParser());
ParserFactory.registerParser(new PdfParser());

export interface ImportProgress {
  stage: "reading" | "parsing" | "validating" | "complete" | "error";
  progress: number; // 0-100
  message: string;
}

export interface ImportOptions {
  strictValidation?: boolean;
  maxFileSizeMB?: number;
  enablePreview?: boolean;
  onProgress?: (progress: ImportProgress) => void;
}

export interface ImportResult {
  success: boolean;
  data?: ResumeData;
  errors?: Array<{
    field: string;
    message: string;
    severity: "error" | "warning";
    suggestion?: string;
  }>;
  warnings?: string[];
  confidence?: number;
  originalContent?: string;
  parserUsed?: string;
  needsReview?: boolean;
  aiEnhancementAvailable?: boolean;
}

export class ImportManager {
  private options: Required<ImportOptions>;

  constructor(options: ImportOptions = {}) {
    this.options = {
      strictValidation: false,
      maxFileSizeMB: 10,
      enablePreview: true,
      onProgress: () => {},
      ...options,
    };
  }

  async importFile(file: File): Promise<ImportResult> {
    try {
      // Stage 1: File validation
      this.reportProgress("reading", 10, "Validating file...");

      const fileValidation = this.validateFile(file);
      if (!fileValidation.success) {
        return {
          success: false,
          errors: fileValidation.errors,
        };
      }

      // Stage 2: Find appropriate parser
      this.reportProgress("reading", 20, "Detecting file format...");

      const parser = ParserFactory.getParser(file);
      if (!parser) {
        return {
          success: false,
          errors: [
            {
              field: "file",
              message: `Unsupported file format. Supported formats: ${ParserFactory.getSupportedFileTypes().join(", ")}`,
              severity: "error",
              suggestion:
                "Please convert your file to a supported format (JSON, DOCX, or PDF)",
            },
          ],
        };
      }

      // Stage 3: Parse the file
      this.reportProgress("parsing", 40, `Parsing ${parser.getName()}...`);

      const parseResult = await parser.parse(file);

      if (!parseResult.success) {
        return {
          success: false,
          errors:
            parseResult.errors?.map((err) => ({
              field: err.field,
              message: err.message,
              severity: err.severity,
              suggestion: err.suggestion,
            })) || [],
          parserUsed: parser.getName(),
        };
      }

      // Stage 4: Validate parsed data
      this.reportProgress("validating", 70, "Validating resume data...");

      const validationResult = validateResumeData(parseResult.data);

      // Determine if review is needed
      const needsReview = this.determineReviewNeed(
        parseResult,
        validationResult,
      );

      if (!validationResult.success && this.options.strictValidation) {
        return {
          success: false,
          errors: validationResult.errors.map((err) => ({
            field: err.path,
            message: err.message,
            severity: "error" as const,
          })),
          data: parseResult.data,
          confidence: parseResult.confidence,
          parserUsed: parser.getName(),
          needsReview: true,
        };
      }

      // Stage 5: Complete
      this.reportProgress("complete", 100, "Import completed successfully!");

      return {
        success: true,
        data: validationResult.data || parseResult.data,
        errors: validationResult.errors.map((err) => ({
          field: err.path,
          message: err.message,
          severity: "warning" as const,
        })),
        warnings: parseResult.warnings,
        confidence: parseResult.confidence,
        originalContent: parseResult.originalContent,
        parserUsed: parser.getName(),
        needsReview,
        aiEnhancementAvailable:
          (parser.getName() === "Word Document Parser" ||
            parser.getName() === "PDF Parser") &&
          !!parseResult.originalContent,
      };
    } catch (error) {
      this.reportProgress("error", 0, "Import failed");

      return {
        success: false,
        errors: [
          {
            field: "import",
            message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            severity: "error",
          },
        ],
      };
    }
  }

  private validateFile(file: File): {
    success: boolean;
    errors?: ImportResult["errors"];
  } {
    const errors: NonNullable<ImportResult["errors"]> = [];

    // Check file size
    if (!validateFileSize(file, this.options.maxFileSizeMB)) {
      errors.push({
        field: "file",
        message: `File size exceeds ${this.options.maxFileSizeMB}MB limit`,
        severity: "error",
        suggestion: "Please use a smaller file or compress your document",
      });
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push({
        field: "file",
        message: "File is empty",
        severity: "error",
      });
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push({
        field: "file",
        message: "Invalid file name",
        severity: "error",
      });
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private determineReviewNeed(
    parseResult: ParseResult,
    validationResult: ValidationResult,
  ): boolean {
    // Review needed if:
    // 1. Confidence is low
    if ((parseResult.confidence || 0) < 0.7) return true;

    // 2. Validation errors exist
    if (!validationResult.success) return true;

    // 3. Important fields are missing
    const data = parseResult.data;
    if (!data?.personal?.email || !data?.personal?.fullName) return true;

    // 4. Warnings exist
    if (parseResult.warnings && parseResult.warnings.length > 0) return true;

    return false;
  }

  private reportProgress(
    stage: ImportProgress["stage"],
    progress: number,
    message: string,
  ): void {
    this.options.onProgress({
      stage,
      progress,
      message,
    });
  }

  // Static method to get supported file types
  static getSupportedFileTypes(): string[] {
    return ParserFactory.getSupportedFileTypes();
  }

  // Static method to check if a file is supported
  static isFileSupported(file: File): boolean {
    return ParserFactory.getParser(file) !== null;
  }

  // Method to update options
  updateOptions(newOptions: Partial<ImportOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}

// Export a default instance for simple usage
export const defaultImportManager = new ImportManager();

// Helper function for simple imports
export async function importResumeFile(
  file: File,
  options?: ImportOptions,
): Promise<ImportResult> {
  const manager = new ImportManager(options);
  return manager.importFile(file);
}
