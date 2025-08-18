import type { ParseError } from "./parsers";

// Error types for different scenarios
export interface AppError {
  code: string;
  message: string;
  details?: string;
  severity: "low" | "medium" | "high" | "critical";
  userMessage: string;
  suggestion?: string;
  recoverable: boolean;
}

// Error codes
export const ERROR_CODES = {
  // File-related errors
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  FILE_EMPTY: "FILE_EMPTY",
  FILE_CORRUPTED: "FILE_CORRUPTED",
  FILE_UNSUPPORTED: "FILE_UNSUPPORTED",
  FILE_READ_ERROR: "FILE_READ_ERROR",

  // Parsing errors
  PARSE_JSON_ERROR: "PARSE_JSON_ERROR",
  PARSE_DOCX_ERROR: "PARSE_DOCX_ERROR",
  PARSE_STRUCTURE_ERROR: "PARSE_STRUCTURE_ERROR",
  PARSE_VALIDATION_ERROR: "PARSE_VALIDATION_ERROR",

  // Data validation errors
  VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
  VALIDATION_INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",
  VALIDATION_DATA_TYPE: "VALIDATION_DATA_TYPE",

  // Import/export errors
  IMPORT_FAILED: "IMPORT_FAILED",
  EXPORT_FAILED: "EXPORT_FAILED",
  STORAGE_ERROR: "STORAGE_ERROR",

  // Network/system errors
  NETWORK_ERROR: "NETWORK_ERROR",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Error factory functions
export function createFileError(
  code: ErrorCode,
  fileName: string,
  fileSize?: number,
  details?: string,
): AppError {
  const baseErrors: Record<string, Omit<AppError, "code">> = {
    [ERROR_CODES.FILE_TOO_LARGE]: {
      message: `File "${fileName}" exceeds size limit`,
      severity: "medium",
      userMessage: `The file "${fileName}" is too large. Please use a file smaller than 10MB.`,
      suggestion:
        "Try compressing your document or saving it in a different format.",
      recoverable: true,
    },
    [ERROR_CODES.FILE_EMPTY]: {
      message: `File "${fileName}" is empty`,
      severity: "high",
      userMessage: `The file "${fileName}" appears to be empty.`,
      suggestion:
        "Please check that your file contains resume data and try again.",
      recoverable: true,
    },
    [ERROR_CODES.FILE_UNSUPPORTED]: {
      message: `File type not supported for "${fileName}"`,
      severity: "medium",
      userMessage: `The file format of "${fileName}" is not supported.`,
      suggestion: "Please use a JSON (.json) or Word document (.docx) file.",
      recoverable: true,
    },
    [ERROR_CODES.FILE_CORRUPTED]: {
      message: `File "${fileName}" appears to be corrupted`,
      severity: "high",
      userMessage: `The file "${fileName}" cannot be read properly.`,
      suggestion: "Please try re-saving the file or use a different copy.",
      recoverable: true,
    },
    [ERROR_CODES.FILE_READ_ERROR]: {
      message: `Failed to read file "${fileName}"`,
      severity: "high",
      userMessage: `There was a problem reading the file "${fileName}".`,
      suggestion: "Please check file permissions and try again.",
      recoverable: true,
    },
  };

  const baseError = baseErrors[code];
  if (!baseError) {
    throw new Error(`Unknown file error code: ${code}`);
  }

  return {
    code,
    details:
      details ||
      (fileSize
        ? `File size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`
        : undefined),
    ...baseError,
  };
}

export function createParsingError(
  code: ErrorCode,
  parserName: string,
  details?: string,
  confidence?: number,
): AppError {
  const baseErrors: Record<string, Omit<AppError, "code">> = {
    [ERROR_CODES.PARSE_JSON_ERROR]: {
      message: "Failed to parse JSON data",
      severity: "high",
      userMessage: "The JSON file contains invalid formatting.",
      suggestion:
        "Please check that your JSON file is properly formatted and try again.",
      recoverable: true,
    },
    [ERROR_CODES.PARSE_DOCX_ERROR]: {
      message: "Failed to parse Word document",
      severity: "medium",
      userMessage:
        "There was a problem extracting data from your Word document.",
      suggestion:
        "The document may have an unusual format. Try converting it to a simpler format first.",
      recoverable: true,
    },
    [ERROR_CODES.PARSE_STRUCTURE_ERROR]: {
      message: "Document structure not recognized",
      severity: "medium",
      userMessage:
        "The document structure doesn't match expected resume formats.",
      suggestion:
        "Please ensure your document follows a standard resume format with clear sections.",
      recoverable: true,
    },
    [ERROR_CODES.PARSE_VALIDATION_ERROR]: {
      message: "Parsed data failed validation",
      severity: "low",
      userMessage: "Some information was extracted but needs verification.",
      suggestion:
        "Please review the imported data and make any necessary corrections.",
      recoverable: true,
    },
  };

  const baseError = baseErrors[code];
  if (!baseError) {
    throw new Error(`Unknown parsing error code: ${code}`);
  }

  return {
    code,
    details: details
      ? `${details}${confidence ? `, Confidence: ${Math.round(confidence * 100)}%` : ""}`
      : `Parser: ${parserName}${confidence ? `, Confidence: ${Math.round(confidence * 100)}%` : ""}`,
    ...baseError,
  };
}

export function createValidationError(
  field: string,
  value: unknown,
  expectedType?: string,
  suggestion?: string,
): AppError {
  return {
    code: ERROR_CODES.VALIDATION_REQUIRED_FIELD,
    message: `Validation failed for field: ${field}`,
    details: `Field: ${field}, Value: ${JSON.stringify(value)}${expectedType ? `, Expected: ${expectedType}` : ""}`,
    severity: "medium",
    userMessage: `The field "${field}" contains invalid or missing information.`,
    suggestion: suggestion || `Please provide a valid value for ${field}.`,
    recoverable: true,
  };
}

// Convert ParseError to AppError
export function parseErrorToAppError(parseError: ParseError): AppError {
  const severity = parseError.severity === "error" ? "high" : "low";

  return {
    code: ERROR_CODES.PARSE_VALIDATION_ERROR,
    message: parseError.message,
    details: `Field: ${parseError.field}${parseError.line ? `, Line: ${parseError.line}` : ""}`,
    severity,
    userMessage: parseError.message,
    suggestion: parseError.suggestion,
    recoverable: severity !== "high",
  };
}

// Error aggregation and reporting
export class ErrorCollector {
  private errors: AppError[] = [];
  private warnings: string[] = [];

  addError(error: AppError): void {
    this.errors.push(error);
  }

  addParseError(parseError: ParseError): void {
    this.addError(parseErrorToAppError(parseError));
  }

  addWarning(warning: string): void {
    this.warnings.push(warning);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  getWarnings(): string[] {
    return [...this.warnings];
  }

  getCriticalErrors(): AppError[] {
    return this.errors.filter((e) => e.severity === "critical");
  }

  getRecoverableErrors(): AppError[] {
    return this.errors.filter((e) => e.recoverable);
  }

  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  // Generate user-friendly summary
  getSummary(): {
    canProceed: boolean;
    message: string;
    details: string[];
    suggestions: string[];
  } {
    const criticalErrors = this.getCriticalErrors();
    const recoverableErrors = this.getRecoverableErrors();

    const canProceed = criticalErrors.length === 0;

    let message: string;
    if (criticalErrors.length > 0) {
      message = "Import cannot continue due to critical errors.";
    } else if (recoverableErrors.length > 0) {
      message = "Import completed with some issues that need attention.";
    } else if (this.warnings.length > 0) {
      message = "Import completed successfully with minor warnings.";
    } else {
      message = "Import completed successfully!";
    }

    const details = [
      ...this.errors.map((e) => e.userMessage),
      ...this.warnings,
    ];

    const suggestions = this.errors
      .map((e) => e.suggestion)
      .filter(Boolean) as string[];

    return {
      canProceed,
      message,
      details,
      suggestions: [...new Set(suggestions)], // Remove duplicates
    };
  }
}

// User feedback utilities
export interface UserFeedback {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  details?: string[];
  actions?: {
    label: string;
    action: () => void;
    primary?: boolean;
  }[];
  dismissible?: boolean;
  autoClose?: number; // milliseconds
}

export function createSuccessFeedback(
  title: string,
  message: string,
  autoClose = 3000,
): UserFeedback {
  return {
    type: "success",
    title,
    message,
    dismissible: true,
    autoClose,
  };
}

export function createErrorFeedback(
  error: AppError,
  actions?: UserFeedback["actions"],
): UserFeedback {
  return {
    type: "error",
    title: `Error: ${error.code}`,
    message: error.userMessage,
    details: error.suggestion ? [error.suggestion] : undefined,
    actions,
    dismissible: true,
  };
}

export function createWarningFeedback(
  title: string,
  message: string,
  details?: string[],
  actions?: UserFeedback["actions"],
): UserFeedback {
  return {
    type: "warning",
    title,
    message,
    details,
    actions,
    dismissible: true,
  };
}

// Retry utilities
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = config;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Graceful degradation utilities
export function attemptWithFallback<T>(
  primary: () => T,
  fallback: () => T,
  predicate?: (error: Error) => boolean,
): T {
  try {
    return primary();
  } catch (error) {
    const shouldUseFallback =
      !predicate ||
      predicate(error instanceof Error ? error : new Error(String(error)));

    if (shouldUseFallback) {
      console.warn("Primary operation failed, using fallback:", error);
      return fallback();
    }

    throw error;
  }
}

// Development utilities
export function logError(
  error: AppError,
  context?: Record<string, unknown>,
): void {
  const logLevel =
    error.severity === "critical"
      ? "error"
      : error.severity === "high"
        ? "error"
        : error.severity === "medium"
          ? "warn"
          : "info";

  console[logLevel]("Application Error:", {
    code: error.code,
    message: error.message,
    details: error.details,
    userMessage: error.userMessage,
    suggestion: error.suggestion,
    recoverable: error.recoverable,
    context,
  });
}
