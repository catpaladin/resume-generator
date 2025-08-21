import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Bot,
  Settings,
  BarChart3,
  History,
  Upload,
  X,
  ChevronDown,
} from "lucide-react";
import { EnhancedAISettings } from "@/components/import/enhanced-ai-settings";
import { AIUsageMonitor } from "@/components/import/ai-usage-monitor";
import { AIHistoryViewer } from "@/components/import/ai-history-viewer";
import { AIEnhancedDropzone } from "@/components/import/ai-enhanced-dropzone";
import type { ResumeData } from "@/types/resume";

interface AINavbarControlsProps {
  onImportComplete?: (data: ResumeData) => void;
  className?: string;
}

type ModalType = "settings" | "analytics" | "history" | "import" | null;

export function AINavbarControls({
  onImportComplete,
  className = "",
}: AINavbarControlsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setShowDropdown(false);
  };

  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
    setShowDropdown(false);
  };

  const modalConfig = {
    settings: {
      title: "AI Settings",
      icon: Settings,
      component: <EnhancedAISettings />,
      width: "max-w-4xl",
    },
    analytics: {
      title: "AI Analytics",
      icon: BarChart3,
      component: <AIUsageMonitor />,
      width: "max-w-6xl",
    },
    history: {
      title: "Enhancement History",
      icon: History,
      component: <AIHistoryViewer />,
      width: "max-w-6xl",
    },
    import: {
      title: "AI Import",
      icon: Upload,
      component: <AIEnhancedDropzone onImportSuccess={onImportComplete} />,
      width: "max-w-4xl",
    },
  };

  const currentModal = activeModal ? modalConfig[activeModal] : null;

  return (
    <>
      {/* Navbar Controls */}
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        >
          <Bot size={16} />
          <span className="hidden sm:inline">AI Tools</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
        </Button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-1 p-2">
              <button
                onClick={() => openModal("import")}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Upload
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />
                <div className="text-left">
                  <div className="font-medium">AI Import</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Upload & enhance resumes
                  </div>
                </div>
              </button>

              <button
                onClick={() => openModal("settings")}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Settings
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
                <div className="text-left">
                  <div className="font-medium">AI Settings</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Configure providers & options
                  </div>
                </div>
              </button>

              <button
                onClick={() => openModal("analytics")}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <BarChart3
                  size={16}
                  className="text-purple-600 dark:text-purple-400"
                />
                <div className="text-left">
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Usage & cost tracking
                  </div>
                </div>
              </button>

              <button
                onClick={() => openModal("history")}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <History
                  size={16}
                  className="text-amber-600 dark:text-amber-400"
                />
                <div className="text-left">
                  <div className="font-medium">History</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Enhancement records
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Overlay to close dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Modal */}
      {currentModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
              className={`relative w-full ${currentModal.width} max-h-[90vh] overflow-hidden rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <currentModal.icon
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {currentModal.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </Button>
              </div>

              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
                {currentModal.component}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
