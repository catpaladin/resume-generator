"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, Upload, Trash2 } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { exportResumeData } from "@/lib/utils";
import { Button } from "@/components/ui/button/button";
import { ImportDropzone } from "@/components/import/import-dropzone";
import { ImportPreviewModal } from "@/components/import/import-preview-modal";
import { useImportWorkflow } from "@/hooks/use-import";
import { AINavbarControls } from "./ai-navbar-controls";
import type { ResumeData } from "@/types/resume";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: ResumeData) => void;
}

function ImportModal({ isOpen, onClose, onImportSuccess }: ImportModalProps) {
  const importWorkflow = useImportWorkflow(onImportSuccess);

  const handleFileSelect = async (file: File) => {
    await importWorkflow.handleFileImport(file);
  };

  const handlePreviewAccept = (data: ResumeData) => {
    importWorkflow.handlePreviewAccept(data);
    onClose();
  };

  const handlePreviewReject = () => {
    importWorkflow.handlePreviewReject();
  };

  const handleClose = () => {
    importWorkflow.reset();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Main import modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold">Import Resume</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={importWorkflow.isImporting}
            >
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload your resume file to automatically extract and import your
              information. Supports JSON and Word documents (.docx).
            </p>

            <ImportDropzone
              onFileSelect={handleFileSelect}
              isImporting={importWorkflow.isImporting}
              progress={importWorkflow.progress}
              disabled={importWorkflow.isImporting}
            />

            {/* Error display */}
            {importWorkflow.validationErrors.length > 0 && (
              <div className="space-y-2">
                {importWorkflow.validationErrors.map((error, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                ))}
              </div>
            )}

            {/* Import result */}
            {importWorkflow.result && !importWorkflow.result.success && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">Import Failed</h4>
                {importWorkflow.result.errors?.map((error, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <div className="font-medium">{error.field}</div>
                    <div>{error.message}</div>
                    {error.suggestion && (
                      <div className="mt-1 text-xs">💡 {error.suggestion}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={importWorkflow.isImporting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {importWorkflow.previewData && (
        <ImportPreviewModal
          isOpen={importWorkflow.isPreviewOpen}
          importResult={importWorkflow.previewData}
          onAccept={handlePreviewAccept}
          onReject={handlePreviewReject}
        />
      )}
    </>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}

export function HeaderActions() {
  const resumeData = useResumeStore((state) => state.resumeData);
  const resetData = useResumeStore((state) => state.resetResumeData);
  const setResumeData = useResumeStore((state) => state.setResumeData);

  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportSuccess = (data: ResumeData) => {
    setResumeData(data);
    setShowImportModal(false);
  };

  const handleExport = () => {
    exportResumeData(resumeData);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all data? This cannot be undone.",
      )
    ) {
      resetData();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* AI Tools */}
        <AINavbarControls onImportComplete={handleImportSuccess} />

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Traditional Actions */}
        <Button
          size="sm"
          onClick={handleExport}
          title="Export resume data as JSON"
          className="bg-green-600 hover:bg-green-700"
        >
          <Download size={14} className="mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowImportModal(true)}
          title="Import resume from file (JSON or Word)"
          className="border-gray-200 hover:bg-gray-50"
        >
          <Upload size={14} className="mr-1" />
          Import
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleReset}
          title="Reset all data"
        >
          <Trash2 size={14} className="mr-1" />
          Reset
        </Button>
      </div>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
}
