import React, { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button/button";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  File,
  X,
} from "lucide-react";
import { ImportManager } from "@/lib/importers/import-manager";
import { useProgressDisplay } from "@/hooks/use-import";
import type { ImportProgress } from "@/lib/importers/import-manager";

interface ImportDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileImport?: (file: File) => Promise<void>;
  isImporting?: boolean;
  progress?: ImportProgress | null;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  disabled?: boolean;
  showProgress?: boolean;
  showPreview?: boolean;
  className?: string;
}

export function ImportDropzone({
  onFileSelect,
  onFileImport,
  isImporting = false,
  progress = null,
  acceptedFileTypes = ImportManager.getSupportedFileTypes(),
  maxFileSize = 10,
  disabled = false,
  showProgress = true,
  showPreview = true,
  className = "",
}: ImportDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const progressDisplay = useProgressDisplay(progress);

  const validateFile = useCallback(
    (file: File): string[] => {
      const errors: string[] = [];

      const maxSizeBytes = maxFileSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        errors.push(
          `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds ${maxFileSize}MB limit`,
        );
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!acceptedFileTypes.includes(fileExtension)) {
        errors.push(
          `Unsupported file type. Supported formats: ${acceptedFileTypes.join(", ")}`,
        );
      }

      if (file.size === 0) {
        errors.push("File is empty");
      }

      return errors;
    },
    [acceptedFileTypes, maxFileSize],
  );

  const handleFileAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const errors = validateFile(file);
      setValidationErrors(errors);

      if (errors.length > 0) {
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);

      if (onFileImport) {
        try {
          await onFileImport(file);
        } catch (error) {
          console.error("Import failed:", error);
        }
      }
    },
    [validateFile, onFileSelect, onFileImport],
  );

  const handleFileRejected = useCallback(
    (rejectedFiles: FileRejection[]) => {
      const errors: string[] = [];

      rejectedFiles.forEach((rejection) => {
        if (rejection.errors) {
          rejection.errors.forEach((error) => {
            if (error.code === "file-too-large") {
              errors.push(`File too large (max ${maxFileSize}MB)`);
            } else if (error.code === "file-invalid-type") {
              errors.push(
                `Invalid file type. Supported: ${acceptedFileTypes.join(", ")}`,
              );
            } else {
              errors.push(error.message);
            }
          });
        }
      });

      setValidationErrors(errors);
    },
    [acceptedFileTypes, maxFileSize],
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationErrors([]);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDropAccepted: handleFileAccepted,
    onDropRejected: handleFileRejected,
    accept: {
      "application/json": [".json"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: maxFileSize * 1024 * 1024,
    multiple: false,
    disabled: disabled || isImporting,
  });

  const getDropzoneStyle = () => {
    let baseStyle =
      "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ";

    if (disabled || isImporting) {
      baseStyle += "bg-gray-50 border-gray-200 cursor-not-allowed ";
    } else if (isDragReject || validationErrors.length > 0) {
      baseStyle += "border-red-300 bg-red-50 ";
    } else if (isDragAccept) {
      baseStyle += "border-green-300 bg-green-50 ";
    } else if (isDragActive) {
      baseStyle += "border-blue-300 bg-blue-50 ";
    } else {
      baseStyle +=
        "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 ";
    }

    return baseStyle;
  };

  const getIconComponent = () => {
    if (isImporting) {
      return <Loader2 className="animate-spin text-blue-500" size={32} />;
    }
    if (validationErrors.length > 0) {
      return <AlertCircle className="text-red-500" size={32} />;
    }
    if (selectedFile) {
      return <CheckCircle className="text-green-500" size={32} />;
    }
    if (isDragAccept) {
      return <CheckCircle className="text-green-500" size={32} />;
    }
    if (isDragReject) {
      return <AlertCircle className="text-red-500" size={32} />;
    }
    return <Upload className="text-gray-400" size={32} />;
  };

  const getMainMessage = () => {
    if (isImporting) {
      return "Importing...";
    }
    if (validationErrors.length > 0) {
      return "File validation failed";
    }
    if (selectedFile) {
      return "File ready to import";
    }
    if (isDragActive) {
      if (isDragReject) {
        return "Unsupported file type";
      }
      return "Drop your file here";
    }
    return "Drag & drop your resume, or click to browse";
  };

  const getSubMessage = () => {
    if (isImporting) {
      return progressDisplay.message;
    }
    if (validationErrors.length > 0) {
      return validationErrors[0];
    }
    if (selectedFile) {
      return `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`;
    }
    return `Supports ${acceptedFileTypes.map((type) => type.toUpperCase()).join(", ")} files up to ${maxFileSize}MB`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div {...getRootProps()} className={getDropzoneStyle()}>
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="flex justify-center">{getIconComponent()}</div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              {getMainMessage()}
            </p>
            <p className="mt-1 text-sm text-gray-500">{getSubMessage()}</p>
          </div>

          {!selectedFile && !isImporting && (
            <Button
              variant="default"
              size="sm"
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <File size={16} className="mr-2" />
              Choose File
            </Button>
          )}
        </div>
      </div>

      {showProgress && progress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{progressDisplay.message}</span>
            <span className="text-gray-500">{progressDisplay.percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${progressDisplay.color}`}
              style={{ width: `${progressDisplay.percentage}%` }}
            />
          </div>
        </div>
      )}

      {showPreview && selectedFile && !isImporting && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="text-blue-500" size={24} />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB •{" "}
                  {selectedFile.type || "Unknown type"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((error, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 p-3"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 flex-shrink-0 text-red-500"
              />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-xs text-gray-500">
        <details className="inline">
          <summary className="cursor-pointer hover:text-gray-700">
            What file formats are supported?
          </summary>
          <div className="mx-auto mt-2 max-w-md rounded-lg bg-gray-50 p-3 text-left">
            <ul className="space-y-1">
              <li>
                <strong>JSON (.json):</strong> Resume data in JSON format -
                highest accuracy
              </li>
              <li>
                <strong>Word (.docx):</strong> Microsoft Word documents -
                AI-powered parsing
              </li>
            </ul>
            <p className="mt-2 text-xs">Maximum file size: {maxFileSize}MB</p>
          </div>
        </details>
      </div>
    </div>
  );
}

export function SimpleImportDropzone({
  onFileSelect,
  className = "",
}: {
  onFileSelect: (file: File) => void;
  className?: string;
}) {
  return (
    <ImportDropzone
      onFileSelect={onFileSelect}
      showProgress={false}
      showPreview={false}
      className={className}
    />
  );
}

export function ImportDropzoneWithHandler({
  onImportSuccess,
  onImportError,
  className = "",
}: {
  onImportSuccess: (file: File) => void;
  onImportError: (error: string) => void;
  className?: string;
}) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const handleFileImport = useCallback(
    async (file: File) => {
      setIsImporting(true);
      try {
        onImportSuccess(file);
      } catch (error) {
        onImportError(error instanceof Error ? error.message : "Import failed");
      } finally {
        setIsImporting(false);
        setProgress(null);
      }
    },
    [onImportSuccess, onImportError],
  );

  return (
    <ImportDropzone
      onFileSelect={() => {}}
      onFileImport={handleFileImport}
      isImporting={isImporting}
      progress={progress}
      className={className}
    />
  );
}
