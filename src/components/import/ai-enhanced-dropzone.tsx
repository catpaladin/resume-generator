import React, { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { ImportDropzone } from "./import-dropzone";
import { ImportPreviewModal } from "./import-preview-modal";
import type { ResumeData } from "@/types/resume";
import {
  ImportManager,
  type ImportResult,
  type ImportProgress,
} from "@/lib/importers/import-manager";

interface AIEnhancedDropzoneProps {
  onImportSuccess?: (data: ResumeData, result: ImportResult) => void;
  onImportError?: (error: string) => void;
  className?: string;
}

export function AIEnhancedDropzone({
  onImportSuccess,
  onImportError,
  className = "",
}: AIEnhancedDropzoneProps) {
  const { setResumeData } = useResumeStore();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null,
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<{
    parsedData: ResumeData;
    originalText: string;
    importResult: ImportResult;
  } | null>(null);

  const handleFileImport = useCallback(
    async (file: File) => {
      if (!file) return;

      setIsImporting(true);
      setImportProgress(null);

      try {
        // Stage 1: Standard DOCX import (no AI involvement)
        const importManager = new ImportManager({
          onProgress: (progress) => {
            setImportProgress(progress);
          },
        });

        const result = await importManager.importFile(file);

        if (!result.success) {
          throw new Error(result.errors?.[0]?.message || "Import failed");
        }

        // Stage 2: Show preview modal for all successful imports
        // For DOCX files, this will include an "Enhance with AI" button
        setPendingImportData({
          parsedData: result.data!,
          originalText: result.originalContent || "",
          importResult: result,
        });
        setShowPreviewModal(true);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Import failed";
        onImportError?.(errorMessage);
      } finally {
        setIsImporting(false);
        setImportProgress(null);
      }
    },
    [onImportSuccess, onImportError],
  );

  const handlePreviewAccept = useCallback(
    (data: ResumeData) => {
      if (!pendingImportData) return;

      setResumeData(data);
      onImportSuccess?.(data, pendingImportData.importResult);

      setPendingImportData(null);
      setShowPreviewModal(false);
    },
    [pendingImportData, setResumeData, onImportSuccess],
  );

  const handlePreviewReject = useCallback(() => {
    setPendingImportData(null);
    setShowPreviewModal(false);
  }, []);

  return (
    <>
      <ImportDropzone
        onFileSelect={() => {}} // We handle import directly
        onFileImport={handleFileImport}
        isImporting={isImporting}
        progress={importProgress}
        className={className}
      />

      {/* Import Preview Modal */}
      {showPreviewModal && pendingImportData && (
        <ImportPreviewModal
          isOpen={showPreviewModal}
          importResult={pendingImportData.importResult}
          onAccept={handlePreviewAccept}
          onReject={handlePreviewReject}
        />
      )}
    </>
  );
}

// Simple wrapper for backward compatibility
export function SimpleAIEnhancedDropzone({
  className = "",
}: {
  className?: string;
}) {
  return (
    <AIEnhancedDropzone
      onImportSuccess={(data) => {
        // For backward compatibility, we'll need to trigger the file select
        // This is a simplified version - in practice, you'd want to handle this differently
        console.log("Import successful:", data);
      }}
      className={className}
    />
  );
}
