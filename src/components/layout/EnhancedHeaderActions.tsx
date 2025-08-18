"use client";

import { useState } from "react";
import { Download, Upload, Trash2, Plus } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { exportResumeData } from "@/lib/utils";
import { Button } from "@/components/ui/button/button";
import { ImportDropzone } from "@/components/import/import-dropzone";
import { ImportPreviewModal } from "@/components/import/import-preview-modal";
import { useImportWorkflow } from "@/hooks/use-import";
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

  return (
    <>
      {/* Main import modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
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
}

export function EnhancedHeaderActions() {
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
        {/* Export button */}
        <Button
          size="sm"
          onClick={handleExport}
          title="Export resume data as JSON"
          className="bg-green-600 hover:bg-green-700"
        >
          <Download size={14} className="mr-1" />
          Export
        </Button>

        {/* Enhanced Import button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowImportModal(true)}
          title="Import resume from file"
          className="border-blue-200 hover:bg-blue-50"
        >
          <Upload size={14} className="mr-1" />
          Import
        </Button>

        {/* Reset button */}
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

      {/* Import modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
}

// Quick import component for inline usage
export function QuickImportButton({
  onImportSuccess,
  className = "",
}: {
  onImportSuccess: (data: ResumeData) => void;
  className?: string;
}) {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = (data: ResumeData) => {
    onImportSuccess(data);
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowModal(true)}
        className={className}
      >
        <Plus size={16} className="mr-2" />
        Import Resume
      </Button>

      <ImportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onImportSuccess={handleSuccess}
      />
    </>
  );
}

// Legacy compatibility component
export function HeaderActions() {
  return <EnhancedHeaderActions />;
}
