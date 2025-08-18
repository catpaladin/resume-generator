import {
  createFileError,
  createParsingError,
  createValidationError,
  parseErrorToAppError,
  ErrorCollector,
  attemptWithFallback,
  withRetry,
  createSuccessFeedback,
  createErrorFeedback,
  createWarningFeedback,
  ERROR_CODES,
  type ErrorCode,
} from "../error-handling";
import type { ParseError } from "../parsers";

describe("Error Handling", () => {
  describe("createFileError", () => {
    it("should create file too large error", () => {
      const error = createFileError(
        ERROR_CODES.FILE_TOO_LARGE,
        "large.docx",
        15 * 1024 * 1024,
      );

      expect(error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
      expect(error.message).toContain("large.docx");
      expect(error.severity).toBe("medium");
      expect(error.userMessage).toContain("too large");
      expect(error.suggestion).toContain("compress");
      expect(error.recoverable).toBe(true);
      expect(error.details).toContain("15.00MB");
    });

    it("should create empty file error", () => {
      const error = createFileError(ERROR_CODES.FILE_EMPTY, "empty.json");

      expect(error.code).toBe(ERROR_CODES.FILE_EMPTY);
      expect(error.severity).toBe("high");
      expect(error.userMessage).toContain("empty");
      expect(error.suggestion).toContain("contains resume data");
    });

    it("should create unsupported file error", () => {
      const error = createFileError(ERROR_CODES.FILE_UNSUPPORTED, "resume.pdf");

      expect(error.code).toBe(ERROR_CODES.FILE_UNSUPPORTED);
      expect(error.userMessage).toContain("not supported");
      expect(error.suggestion).toContain(
        "JSON (.json) or Word document (.docx)",
      );
    });

    it("should throw for unknown error codes", () => {
      expect(() => {
        createFileError("UNKNOWN_CODE" as ErrorCode, "test.file");
      }).toThrow("Unknown file error code");
    });
  });

  describe("createParsingError", () => {
    it("should create JSON parsing error", () => {
      const error = createParsingError(
        ERROR_CODES.PARSE_JSON_ERROR,
        "JSON Parser",
        "Invalid syntax",
        0.5,
      );

      expect(error.code).toBe(ERROR_CODES.PARSE_JSON_ERROR);
      expect(error.message).toContain("JSON");
      expect(error.userMessage).toContain("invalid formatting");
      expect(error.suggestion).toContain("properly formatted");
      expect(error.details).toContain("Invalid syntax");
      expect(error.details).toContain("Confidence: 50%");
    });

    it("should create DOCX parsing error", () => {
      const error = createParsingError(
        ERROR_CODES.PARSE_DOCX_ERROR,
        "Word Parser",
      );

      expect(error.code).toBe(ERROR_CODES.PARSE_DOCX_ERROR);
      expect(error.severity).toBe("medium");
      expect(error.userMessage).toContain("Word document");
      expect(error.suggestion).toContain("simpler format");
    });

    it("should create structure error", () => {
      const error = createParsingError(
        ERROR_CODES.PARSE_STRUCTURE_ERROR,
        "DOCX Parser",
      );

      expect(error.userMessage).toContain("structure");
      expect(error.suggestion).toContain("standard resume format");
    });

    it("should create validation error", () => {
      const error = createParsingError(
        ERROR_CODES.PARSE_VALIDATION_ERROR,
        "JSON Parser",
      );

      expect(error.severity).toBe("low");
      expect(error.userMessage).toContain("needs verification");
      expect(error.suggestion).toContain("review");
    });
  });

  describe("createValidationError", () => {
    it("should create validation error with details", () => {
      const error = createValidationError(
        "email",
        "invalid-email",
        "valid email address",
        "Use format: user@domain.com",
      );

      expect(error.code).toBe(ERROR_CODES.VALIDATION_REQUIRED_FIELD);
      expect(error.message).toContain("email");
      expect(error.details).toContain("invalid-email");
      expect(error.details).toContain("valid email address");
      expect(error.severity).toBe("medium");
      expect(error.userMessage).toContain("email");
      expect(error.suggestion).toBe("Use format: user@domain.com");
      expect(error.recoverable).toBe(true);
    });

    it("should provide default suggestion when none provided", () => {
      const error = createValidationError("phone", null);

      expect(error.suggestion).toContain("valid value for phone");
    });
  });

  describe("parseErrorToAppError", () => {
    it("should convert error severity ParseError", () => {
      const parseError: ParseError = {
        field: "personal.email",
        message: "Invalid email format",
        severity: "error",
        line: 5,
        suggestion: "Use a valid email address",
      };

      const appError = parseErrorToAppError(parseError);

      expect(appError.code).toBe(ERROR_CODES.PARSE_VALIDATION_ERROR);
      expect(appError.message).toBe("Invalid email format");
      expect(appError.details).toContain("personal.email");
      expect(appError.details).toContain("Line: 5");
      expect(appError.severity).toBe("high");
      expect(appError.suggestion).toBe("Use a valid email address");
      expect(appError.recoverable).toBe(false);
    });

    it("should convert warning severity ParseError", () => {
      const parseError: ParseError = {
        field: "experience",
        message: "Some data may be incomplete",
        severity: "warning",
      };

      const appError = parseErrorToAppError(parseError);

      expect(appError.severity).toBe("low");
      expect(appError.recoverable).toBe(true);
    });
  });

  describe("ErrorCollector", () => {
    let collector: ErrorCollector;

    beforeEach(() => {
      collector = new ErrorCollector();
    });

    it("should start empty", () => {
      expect(collector.hasErrors()).toBe(false);
      expect(collector.hasWarnings()).toBe(false);
      expect(collector.getErrors()).toEqual([]);
      expect(collector.getWarnings()).toEqual([]);
    });

    it("should collect errors", () => {
      const error = createFileError(ERROR_CODES.FILE_EMPTY, "test.json");
      collector.addError(error);

      expect(collector.hasErrors()).toBe(true);
      expect(collector.getErrors()).toHaveLength(1);
      expect(collector.getErrors()[0]).toBe(error);
    });

    it("should collect parse errors", () => {
      const parseError: ParseError = {
        field: "test",
        message: "Test error",
        severity: "error",
      };

      collector.addParseError(parseError);

      expect(collector.hasErrors()).toBe(true);
      expect(collector.getErrors()[0].code).toBe(
        ERROR_CODES.PARSE_VALIDATION_ERROR,
      );
    });

    it("should collect warnings", () => {
      collector.addWarning("This is a warning");

      expect(collector.hasWarnings()).toBe(true);
      expect(collector.getWarnings()).toEqual(["This is a warning"]);
    });

    it("should filter critical errors", () => {
      const criticalError = {
        ...createFileError(ERROR_CODES.FILE_EMPTY, "test"),
        severity: "critical" as const,
      };
      const normalError = createFileError(ERROR_CODES.FILE_TOO_LARGE, "test");

      collector.addError(criticalError);
      collector.addError(normalError);

      expect(collector.getCriticalErrors()).toHaveLength(1);
      expect(collector.getCriticalErrors()[0]).toBe(criticalError);
    });

    it("should filter recoverable errors", () => {
      const recoverableError = createFileError(
        ERROR_CODES.FILE_TOO_LARGE,
        "test",
      );
      const nonRecoverableError = {
        ...createFileError(ERROR_CODES.FILE_EMPTY, "test"),
        recoverable: false,
      };

      collector.addError(recoverableError);
      collector.addError(nonRecoverableError);

      expect(collector.getRecoverableErrors()).toHaveLength(1);
      expect(collector.getRecoverableErrors()[0]).toBe(recoverableError);
    });

    it("should clear all errors and warnings", () => {
      collector.addError(createFileError(ERROR_CODES.FILE_EMPTY, "test"));
      collector.addWarning("Test warning");

      collector.clear();

      expect(collector.hasErrors()).toBe(false);
      expect(collector.hasWarnings()).toBe(false);
    });

    describe("getSummary", () => {
      it("should indicate critical errors prevent proceeding", () => {
        const criticalError = {
          ...createFileError(ERROR_CODES.FILE_EMPTY, "test"),
          severity: "critical" as const,
        };
        collector.addError(criticalError);

        const summary = collector.getSummary();

        expect(summary.canProceed).toBe(false);
        expect(summary.message).toContain("critical errors");
      });

      it("should indicate recoverable errors with warnings", () => {
        const recoverableError = createFileError(
          ERROR_CODES.FILE_TOO_LARGE,
          "test",
        );
        collector.addError(recoverableError);

        const summary = collector.getSummary();

        expect(summary.canProceed).toBe(true);
        expect(summary.message).toContain("some issues");
        expect(summary.details).toHaveLength(1);
      });

      it("should indicate warnings only", () => {
        collector.addWarning("Minor issue");

        const summary = collector.getSummary();

        expect(summary.canProceed).toBe(true);
        expect(summary.message).toContain("minor warnings");
      });

      it("should indicate success with no issues", () => {
        const summary = collector.getSummary();

        expect(summary.canProceed).toBe(true);
        expect(summary.message).toContain("successfully!");
        expect(summary.details).toEqual([]);
        expect(summary.suggestions).toEqual([]);
      });

      it("should deduplicate suggestions", () => {
        const error1 = createFileError(ERROR_CODES.FILE_TOO_LARGE, "test1");
        const error2 = createFileError(ERROR_CODES.FILE_TOO_LARGE, "test2");

        collector.addError(error1);
        collector.addError(error2);

        const summary = collector.getSummary();

        // Both errors have the same suggestion, should be deduplicated
        expect(summary.suggestions.length).toBeLessThan(2);
      });
    });
  });

  describe("feedback creation", () => {
    describe("createSuccessFeedback", () => {
      it("should create success feedback", () => {
        const feedback = createSuccessFeedback(
          "Import Complete",
          "Resume imported successfully",
          5000,
        );

        expect(feedback.type).toBe("success");
        expect(feedback.title).toBe("Import Complete");
        expect(feedback.message).toBe("Resume imported successfully");
        expect(feedback.dismissible).toBe(true);
        expect(feedback.autoClose).toBe(5000);
      });
    });

    describe("createErrorFeedback", () => {
      it("should create error feedback from AppError", () => {
        const error = createFileError(ERROR_CODES.FILE_TOO_LARGE, "test.docx");
        const actions = [
          { label: "Try Again", action: jest.fn(), primary: true },
        ];

        const feedback = createErrorFeedback(error, actions);

        expect(feedback.type).toBe("error");
        expect(feedback.title).toContain(error.code);
        expect(feedback.message).toBe(error.userMessage);
        expect(feedback.details).toEqual([error.suggestion]);
        expect(feedback.actions).toBe(actions);
        expect(feedback.dismissible).toBe(true);
      });
    });

    describe("createWarningFeedback", () => {
      it("should create warning feedback", () => {
        const feedback = createWarningFeedback(
          "Parsing Warning",
          "Some data may be incomplete",
          ["Check personal information", "Verify experience dates"],
          [{ label: "Review", action: jest.fn() }],
        );

        expect(feedback.type).toBe("warning");
        expect(feedback.title).toBe("Parsing Warning");
        expect(feedback.message).toBe("Some data may be incomplete");
        expect(feedback.details).toEqual([
          "Check personal information",
          "Verify experience dates",
        ]);
        expect(feedback.actions).toHaveLength(1);
      });
    });
  });

  describe("retry utilities", () => {
    describe("withRetry", () => {
      it("should succeed on first attempt", async () => {
        const operation = jest.fn().mockResolvedValue("success");

        const result = await withRetry(operation, { maxAttempts: 3 });

        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(1);
      });

      it("should retry on failure and eventually succeed", async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error("Failure 1"))
          .mockRejectedValueOnce(new Error("Failure 2"))
          .mockResolvedValue("success");

        const result = await withRetry(operation, {
          maxAttempts: 3,
          baseDelay: 10,
        });

        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(3);
      });

      it("should throw final error after max attempts", async () => {
        const finalError = new Error("Final failure");
        const operation = jest.fn().mockRejectedValue(finalError);

        await expect(
          withRetry(operation, { maxAttempts: 2, baseDelay: 10 }),
        ).rejects.toThrow("Final failure");

        expect(operation).toHaveBeenCalledTimes(2);
      });

      it("should use exponential backoff", async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error("Failure 1"))
          .mockResolvedValue("success");

        const startTime = Date.now();
        await withRetry(operation, {
          maxAttempts: 2,
          baseDelay: 100,
          backoffFactor: 2,
        });
        const endTime = Date.now();

        // Should have waited at least the base delay
        expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
      });

      it("should respect max delay", async () => {
        const operation = jest
          .fn()
          .mockRejectedValueOnce(new Error("Failure 1"))
          .mockResolvedValue("success");

        await withRetry(operation, {
          maxAttempts: 2,
          baseDelay: 1000,
          maxDelay: 50,
          backoffFactor: 10,
        });

        // Should have completed quickly due to max delay limit
        expect(operation).toHaveBeenCalledTimes(2);
      });
    });

    describe("attemptWithFallback", () => {
      it("should return primary result on success", () => {
        const primary = jest.fn().mockReturnValue("primary success");
        const fallback = jest.fn().mockReturnValue("fallback success");

        const result = attemptWithFallback(primary, fallback);

        expect(result).toBe("primary success");
        expect(primary).toHaveBeenCalled();
        expect(fallback).not.toHaveBeenCalled();
      });

      it("should return fallback result on primary failure", () => {
        const primary = jest.fn().mockImplementation(() => {
          throw new Error("Primary failed");
        });
        const fallback = jest.fn().mockReturnValue("fallback success");

        const result = attemptWithFallback(primary, fallback);

        expect(result).toBe("fallback success");
        expect(primary).toHaveBeenCalled();
        expect(fallback).toHaveBeenCalled();
      });

      it("should use predicate to determine fallback usage", () => {
        const specificError = new Error("Specific error");
        const primary = jest.fn().mockImplementation(() => {
          throw specificError;
        });
        const fallback = jest.fn().mockReturnValue("fallback success");
        const predicate = jest.fn().mockReturnValue(false); // Don't use fallback

        expect(() => {
          attemptWithFallback(primary, fallback, predicate);
        }).toThrow("Specific error");

        expect(predicate).toHaveBeenCalledWith(specificError);
        expect(fallback).not.toHaveBeenCalled();
      });

      it("should use fallback when predicate returns true", () => {
        const primary = jest.fn().mockImplementation(() => {
          throw new Error("Network error");
        });
        const fallback = jest.fn().mockReturnValue("fallback success");
        const predicate = jest.fn().mockReturnValue(true);

        const result = attemptWithFallback(primary, fallback, predicate);

        expect(result).toBe("fallback success");
        expect(fallback).toHaveBeenCalled();
      });
    });
  });
});
