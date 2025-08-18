import { useState, useCallback } from "react";
import {
  ImportManager,
  type ImportResult,
  type ImportProgress,
  type ImportOptions,
} from "@/lib/importers/import-manager";
import type { ResumeData } from "@/types/resume";

interface UseImportState {
  isImporting: boolean;
  progress: ImportProgress | null;
  result: ImportResult | null;
  error: string | null;
}

interface UseImportActions {
  importFile: (file: File, options?: ImportOptions) => Promise<ImportResult>;
  reset: () => void;
  updateProgress: (progress: ImportProgress) => void;
}

interface UseImportReturn extends UseImportState, UseImportActions {}

export function useImport(defaultOptions?: ImportOptions): UseImportReturn {
  const [state, setState] = useState<UseImportState>({
    isImporting: false,
    progress: null,
    result: null,
    error: null,
  });

  const updateProgress = useCallback((progress: ImportProgress) => {
    setState((prev) => ({
      ...prev,
      progress,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isImporting: false,
      progress: null,
      result: null,
      error: null,
    });
  }, []);

  const importFile = useCallback(
    async (file: File, options?: ImportOptions): Promise<ImportResult> => {
      try {
        // Reset previous state
        setState((prev) => ({
          ...prev,
          isImporting: true,
          error: null,
          result: null,
          progress: {
            stage: "reading",
            progress: 0,
            message: "Starting import...",
          },
        }));

        // Create import manager with progress callback
        const manager = new ImportManager({
          ...defaultOptions,
          ...options,
          onProgress: updateProgress,
        });

        // Perform the import
        const result = await manager.importFile(file);

        // Update state with result
        setState((prev) => ({
          ...prev,
          isImporting: false,
          result,
          progress: result.success
            ? { stage: "complete", progress: 100, message: "Import completed!" }
            : { stage: "error", progress: 0, message: "Import failed" },
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown import error";

        setState((prev) => ({
          ...prev,
          isImporting: false,
          error: errorMessage,
          progress: {
            stage: "error",
            progress: 0,
            message: `Import failed: ${errorMessage}`,
          },
        }));

        return {
          success: false,
          errors: [
            {
              field: "import",
              message: errorMessage,
              severity: "error",
            },
          ],
        };
      }
    },
    [defaultOptions, updateProgress],
  );

  return {
    isImporting: state.isImporting,
    progress: state.progress,
    result: state.result,
    error: state.error,
    importFile,
    reset,
    updateProgress,
  };
}

// Hook specifically for file validation
export function useFileValidation() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFile = useCallback((file: File): boolean => {
    const errors: string[] = [];

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(
        `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`,
      );
    }

    // Check file type
    const supportedTypes = ImportManager.getSupportedFileTypes();
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!supportedTypes.includes(fileExtension)) {
      errors.push(
        `Unsupported file type. Supported formats: ${supportedTypes.join(", ")}`,
      );
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push("Invalid file name");
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push("File is empty");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    validateFile,
    validationErrors,
    clearValidationErrors,
    isValid: validationErrors.length === 0,
  };
}

// Hook for import preview functionality
export function useImportPreview() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ImportResult | null>(null);

  const openPreview = useCallback((result: ImportResult) => {
    setPreviewData(result);
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewData(null);
  }, []);

  const acceptImport = useCallback(
    (onAccept: (data: ResumeData) => void) => {
      if (previewData?.data) {
        onAccept(previewData.data);
        closePreview();
      }
    },
    [previewData, closePreview],
  );

  const rejectImport = useCallback(() => {
    closePreview();
  }, [closePreview]);

  return {
    isPreviewOpen,
    previewData,
    openPreview,
    closePreview,
    acceptImport,
    rejectImport,
  };
}

// Combined hook for full import workflow
export function useImportWorkflow(
  onImportSuccess?: (data: ResumeData) => void,
) {
  const import_ = useImport();
  const fileValidation = useFileValidation();
  const preview = useImportPreview();

  const handleFileImport = useCallback(
    async (file: File, options?: ImportOptions) => {
      // First validate the file
      if (!fileValidation.validateFile(file)) {
        return {
          success: false,
          errors: fileValidation.validationErrors.map((error) => ({
            field: "file",
            message: error,
            severity: "error" as const,
          })),
        };
      }

      // Import the file
      const result = await import_.importFile(file, options);

      // If successful and needs review, open preview
      if (result.success && result.needsReview && result.data) {
        preview.openPreview(result);
      } else if (result.success && result.data && onImportSuccess) {
        // Direct import without preview
        onImportSuccess(result.data);
      }

      return result;
    },
    [fileValidation, import_, preview, onImportSuccess],
  );

  const handlePreviewAccept = useCallback(
    (data: ResumeData) => {
      if (onImportSuccess) {
        onImportSuccess(data);
      }
      preview.closePreview();
    },
    [onImportSuccess, preview],
  );

  const reset = useCallback(() => {
    import_.reset();
    fileValidation.clearValidationErrors();
    preview.closePreview();
  }, [import_, fileValidation, preview]);

  return {
    // Import state
    isImporting: import_.isImporting,
    progress: import_.progress,
    result: import_.result,
    error: import_.error,

    // File validation
    validationErrors: fileValidation.validationErrors,
    isFileValid: fileValidation.isValid,

    // Preview state
    isPreviewOpen: preview.isPreviewOpen,
    previewData: preview.previewData,

    // Actions
    handleFileImport,
    handlePreviewAccept,
    handlePreviewReject: preview.rejectImport,
    reset,

    // Individual hooks for fine-grained control
    import: import_,
    fileValidation,
    preview,
  };
}

// Hook for progress display
export function useProgressDisplay(progress: ImportProgress | null) {
  const getProgressMessage = useCallback(() => {
    if (!progress) return "";
    return progress.message;
  }, [progress]);

  const getProgressPercentage = useCallback(() => {
    if (!progress) return 0;
    return progress.progress;
  }, [progress]);

  const getProgressColor = useCallback(() => {
    if (!progress) return "bg-blue-500";

    switch (progress.stage) {
      case "error":
        return "bg-red-500";
      case "complete":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  }, [progress]);

  const isComplete = progress?.stage === "complete";
  const isError = progress?.stage === "error";
  const isLoading = progress && !isComplete && !isError;

  return {
    message: getProgressMessage(),
    percentage: getProgressPercentage(),
    color: getProgressColor(),
    isComplete,
    isError,
    isLoading,
  };
}
