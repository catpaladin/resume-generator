import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Edit3,
  AlertCircle,
  Info,
  Eye,
  Download,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useResumeStore } from "@/store/resumeStore";
import { parseResumeWithAI } from "@/lib/ai/ai-parsing-service";
import { getApiKey } from "@/services/secureStorage";
import type { ResumeData } from "@/types/resume";
import type { ImportResult } from "@/lib/importers/import-manager";

interface ImportPreviewModalProps {
  isOpen: boolean;
  importResult: ImportResult;
  onAccept: (data: ResumeData) => void;
  onReject: () => void;
  onEdit?: (data: ResumeData) => void;
}

export function ImportPreviewModal({
  isOpen,
  importResult,
  onAccept,
  onReject,
  onEdit,
}: ImportPreviewModalProps) {
  const { aiSettings } = useResumeStore();
  const [activeTab, setActiveTab] = useState<"preview" | "original" | "errors">(
    "preview",
  );
  const [isAIParsing, setIsAIParsing] = useState(false);
  const [aiParsedData, setAiParsedData] = useState<ResumeData | null>(null);
  const [aiParsingError, setAiParsingError] = useState<string | null>(null);

  const displayData = aiParsedData || importResult.data;
  const isUsingAIData = !!aiParsedData;

  const modalRef = useClickOutside<HTMLDivElement>(() => {
    onReject();
  }, isOpen);

  if (!isOpen || !importResult.success || !importResult.data) return null;

  const hasErrors = importResult.errors && importResult.errors.length > 0;
  const hasWarnings = importResult.warnings && importResult.warnings.length > 0;
  const needsReview = importResult.needsReview || hasErrors;
  const confidence = importResult.confidence || 0;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const handleAccept = () => {
    onAccept(displayData || importResult.data!);
  };

  const handleEdit = () => {
    if (onEdit && displayData) {
      onEdit(displayData);
    }
  };

  const handleAIParseImprove = async () => {
    if (
      !aiSettings?.hasApiKey ||
      !importResult.originalContent ||
      !importResult.data
    ) {
      setAiParsingError(
        "AI parsing not available - missing API key or original content",
      );
      return;
    }

    setIsAIParsing(true);
    setAiParsingError(null);

    try {
      const apiKey = await getApiKeyForProvider(aiSettings.provider);
      if (!apiKey) {
        throw new Error(
          `No API key found for provider: ${aiSettings.provider}`,
        );
      }

      const result = await parseResumeWithAI(
        importResult.originalContent,
        importResult.data,
        {
          provider: aiSettings.provider,
          model: aiSettings.model || aiSettings.customModel,
          apiKey,
        },
      );

      if (result.success && result.data) {
        setAiParsedData(result.data);
      } else {
        setAiParsingError(result.error || "AI parsing failed");
      }
    } catch (error) {
      setAiParsingError(
        error instanceof Error ? error.message : "AI parsing failed",
      );
    } finally {
      setIsAIParsing(false);
    }
  };

  const getApiKeyForProvider = async (provider: string): Promise<string> => {
    try {
      const apiKey = await getApiKey(provider);
      return apiKey || "";
    } catch (error) {
      console.error(`Failed to get API key for ${provider}:`, error);
      return "";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800"
      >
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Import Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Parsed using {importResult.parserUsed}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-700">
              <div
                className={`h-2 w-2 rounded-full ${confidence >= 0.8 ? "bg-green-500" : confidence >= 0.6 ? "bg-yellow-500" : "bg-red-500"}`}
              />
              <span className="text-xs font-medium">
                Confidence: {Math.round(confidence * 100)}%
                <span className={`ml-1 ${getConfidenceColor(confidence)}`}>
                  ({getConfidenceLabel(confidence)})
                </span>
              </span>
            </div>
            <IconButton
              variant="ghost"
              icon={<X size={18} />}
              onClick={onReject}
              aria-label="Close"
            />
          </div>
        </div>

        {needsReview && (
          <div className="border-b bg-amber-50 p-4 dark:bg-amber-900/20">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 text-amber-600" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Review Required
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Some information may need manual verification or correction
                  before importing.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-b bg-gray-50 dark:bg-gray-800">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("preview")}
              className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye size={16} className="mr-2 inline" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab("original")}
              className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === "original"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText size={16} className="mr-2 inline" />
              Original
            </button>
            {(hasErrors || hasWarnings) && (
              <button
                onClick={() => setActiveTab("errors")}
                className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "errors"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <AlertCircle size={16} className="mr-2 inline" />
                Issues (
                {(importResult.errors?.length || 0) +
                  (importResult.warnings?.length || 0)}
                )
              </button>
            )}
          </nav>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === "preview" && (
            <div className="p-6">
              {isUsingAIData && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Showing AI-improved parsing results
                    </span>
                  </div>
                </div>
              )}
              {aiParsingError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-600" />
                    <span className="text-sm text-red-800 dark:text-red-200">
                      {aiParsingError}
                    </span>
                  </div>
                </div>
              )}
              <ResumePreview data={displayData || importResult.data!} />
            </div>
          )}

          {activeTab === "original" && (
            <div className="p-6">
              <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-700">
                <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300">
                  {importResult.originalContent ||
                    "Original content not available"}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-4 p-6">
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-red-700 dark:text-red-400">
                    Errors ({importResult.errors.length})
                  </h4>
                  {importResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={16}
                          className="mt-0.5 text-red-500"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-red-800 dark:text-red-200">
                            {error.field}
                          </p>
                          <p className="text-red-700 dark:text-red-300">
                            {error.message}
                          </p>
                          {error.suggestion && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              💡 {error.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {importResult.warnings && importResult.warnings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-400">
                    Warnings ({importResult.warnings.length})
                  </h4>
                  {importResult.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          size={16}
                          className="mt-0.5 text-yellow-500"
                        />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {warning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                <div className="flex items-start gap-2">
                  <Info size={16} className="mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Parsing Confidence: {Math.round(confidence * 100)}%
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      {confidence >= 0.8
                        ? "High confidence - most information was successfully extracted."
                        : confidence >= 0.6
                          ? "Medium confidence - some information may need verification."
                          : "Low confidence - please review all extracted information carefully."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50 p-6 dark:bg-gray-800">
          <div className="flex gap-3">
            <Button onClick={onReject} variant="outline" className="flex-1">
              Cancel Import
            </Button>
            {onEdit && (
              <Button onClick={handleEdit} variant="outline" className="flex-1">
                <Edit3 size={16} className="mr-2" />
                Edit Before Import
              </Button>
            )}
            {importResult.aiEnhancementAvailable &&
              aiSettings?.hasApiKey &&
              !isUsingAIData && (
                <Button
                  onClick={handleAIParseImprove}
                  disabled={isAIParsing}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  {isAIParsing ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Sparkles size={16} className="mr-2" />
                  )}
                  {isAIParsing ? "Parsing with AI..." : "Parse with AI"}
                </Button>
              )}
            <Button
              onClick={handleAccept}
              className={`flex-1 ${
                needsReview
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <CheckCircle2 size={16} className="mr-2" />
              {needsReview ? "Import Anyway" : "Import Resume"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}

function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="border-b pb-2 text-lg font-semibold">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Full Name
            </label>
            <p className="text-sm font-medium">
              {data.personal.fullName || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Email
            </label>
            <p className="text-sm">{data.personal.email || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Phone
            </label>
            <p className="text-sm">{data.personal.phone || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Location
            </label>
            <p className="text-sm">
              {data.personal.location || "Not provided"}
            </p>
          </div>
          {data.personal.linkedin && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                LinkedIn
              </label>
              <p className="text-sm">{data.personal.linkedin}</p>
            </div>
          )}
          {data.personal.summary && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Summary
              </label>
              <p className="text-sm">{data.personal.summary}</p>
            </div>
          )}
        </div>
      </section>

      {data.experience.length > 0 && (
        <section className="space-y-3">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Experience ({data.experience.length})
          </h3>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div
                key={exp.id || index}
                className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-700"
              >
                <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Position
                    </label>
                    <p className="font-medium">
                      {exp.position || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Company
                    </label>
                    <p className="font-medium">
                      {exp.company || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Duration
                    </label>
                    <p className="text-sm">
                      {exp.startDate} -{" "}
                      {exp.isCurrent ? "Present" : exp.endDate}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Location
                    </label>
                    <p className="text-sm">{exp.location || "Not provided"}</p>
                  </div>
                </div>
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Responsibilities
                    </label>
                    <ul className="mt-1 space-y-1">
                      {exp.bulletPoints.map((bullet, i) => (
                        <li
                          key={bullet.id || i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="mt-1.5 text-gray-400">•</span>
                          <span>{bullet.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section className="space-y-3">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Education ({data.education.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.education.map((edu, index) => (
              <div
                key={edu.id || index}
                className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-700"
              >
                <p className="font-medium">{edu.degree || "Not provided"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {edu.school || "Not provided"}
                </p>
                <p className="text-sm text-gray-500">
                  {edu.graduationYear || "Not provided"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="space-y-3">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Skills ({data.skills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={skill.id || index}
                className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {skill.name}
                {skill.category && (
                  <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                    ({skill.category})
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="space-y-3">
          <h3 className="border-b pb-2 text-lg font-semibold">
            Projects ({data.projects.length})
          </h3>
          <div className="space-y-4">
            {data.projects.map((project, index) => (
              <div
                key={project.id || index}
                className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {project.name || "Not provided"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {project.description || "No description"}
                    </p>
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
