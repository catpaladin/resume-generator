import React, { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { ImportDropzone } from "./import-dropzone";
import { AIEnhancementModal } from "./ai-enhancement-modal";
import type { ResumeData } from "@/types/resume";
import type {
  AIEnhancementResult,
  AIEnhancementOptions,
} from "@/types/ai-enhancement";
import {
  AIEnhancedImportManager,
  type AIImportResult,
  type AIImportProgress,
} from "@/lib/importers/ai-enhanced-import-manager";
import { enhanceResumeWithAI } from "@/lib/ai/ai-service";

interface AIEnhancedDropzoneProps {
  onImportSuccess?: (data: ResumeData, result: AIImportResult) => void;
  onImportError?: (error: string) => void;
  className?: string;
  enableAIByDefault?: boolean;
}

export function AIEnhancedDropzone({
  onImportSuccess,
  onImportError,
  className = "",
  enableAIByDefault = true,
}: AIEnhancedDropzoneProps) {
  const { aiSettings, setResumeData } = useResumeStore();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<AIImportProgress | null>(
    null,
  );
  const [showAIModal, setShowAIModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<{
    parsedData: ResumeData;
    originalText: string;
    importResult: AIImportResult;
  } | null>(null);

  const handleFileImport = useCallback(
    async (file: File) => {
      if (!file) return;

      // Check if AI is enabled but no API key is configured
      if (enableAIByDefault && !aiSettings?.hasApiKey) {
        onImportError?.(
          "AI enhancement is enabled but no API key is configured. Please set up your AI settings first.",
        );
        return;
      }

      setIsImporting(true);
      setImportProgress(null);

      try {
        const importManager = new AIEnhancedImportManager({
          enableAI: enableAIByDefault && !!aiSettings?.hasApiKey,
          aiSettings: aiSettings || undefined,
          onAIProgress: (progress) => {
            setImportProgress(progress);
          },
        });

        const result = await importManager.importFile(file);

        if (!result.success) {
          throw new Error(result.errors?.[0]?.message || "Import failed");
        }

        // If AI was used automatically, use the enhanced data
        if (result.aiUsed && result.aiEnhancement) {
          setResumeData(result.data!);
          onImportSuccess?.(result.data!, result);
        }
        // If AI enhancement is available but wasn't used, show modal
        else if (result.aiEnhancementAvailable && aiSettings?.hasApiKey) {
          setPendingImportData({
            parsedData: result.data!,
            originalText: result.originalContent!,
            importResult: result,
          });
          setShowAIModal(true);
        }
        // Otherwise, use the data as-is
        else {
          setResumeData(result.data!);
          onImportSuccess?.(result.data!, result);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Import failed";
        onImportError?.(errorMessage);
      } finally {
        setIsImporting(false);
        setImportProgress(null);
      }
    },
    [
      aiSettings,
      enableAIByDefault,
      setResumeData,
      onImportSuccess,
      onImportError,
    ],
  );

  const handleAIEnhancement = useCallback(
    async (options: AIEnhancementOptions): Promise<AIEnhancementResult> => {
      if (!pendingImportData) {
        throw new Error("No pending import data");
      }

      return enhanceResumeWithAI(
        options,
        pendingImportData.originalText,
        pendingImportData.parsedData,
      );
    },
    [pendingImportData],
  );

  const handleAcceptEnhanced = useCallback(
    (enhancedData: ResumeData) => {
      if (!pendingImportData) return;

      setResumeData(enhancedData);
      onImportSuccess?.(enhancedData, {
        ...pendingImportData.importResult,
        data: enhancedData,
        aiUsed: true,
      });

      setPendingImportData(null);
      setShowAIModal(false);
    },
    [pendingImportData, setResumeData, onImportSuccess],
  );

  const handleRejectEnhanced = useCallback(() => {
    if (!pendingImportData) return;

    setResumeData(pendingImportData.parsedData);
    onImportSuccess?.(
      pendingImportData.parsedData,
      pendingImportData.importResult,
    );

    setPendingImportData(null);
    setShowAIModal(false);
  }, [pendingImportData, setResumeData, onImportSuccess]);

  const getProgressMessage = () => {
    if (!importProgress) return undefined;

    switch (importProgress.stage) {
      case "ai_enhancing":
        return "Enhancing with AI...";
      default:
        return importProgress.message;
    }
  };

  return (
    <>
      <ImportDropzone
        onFileSelect={() => {}} // We handle import directly
        onFileImport={handleFileImport}
        isImporting={isImporting}
        progress={
          importProgress
            ? {
                stage:
                  importProgress.stage === "ai_enhancing"
                    ? "validating"
                    : importProgress.stage,
                progress: importProgress.progress,
                message: getProgressMessage() || importProgress.message,
              }
            : null
        }
        className={className}
      />

      {/* AI Enhancement Modal */}
      {showAIModal && pendingImportData && (
        <AIEnhancementModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          parsedData={pendingImportData.parsedData}
          originalText={pendingImportData.originalText}
          onEnhance={handleAIEnhancement}
          onAccept={handleAcceptEnhanced}
          onReject={handleRejectEnhanced}
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
        console.log("Import successful with AI enhancement:", data);
      }}
      className={className}
      enableAIByDefault={false}
    />
  );
}
