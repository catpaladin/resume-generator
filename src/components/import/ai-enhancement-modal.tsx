import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/input";
import {
  Bot,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { useTheme } from "@/hooks/use-theme";
import type { ResumeData } from "@/types/resume";
import type {
  AIEnhancementResult,
  AIEnhancementOptions,
} from "@/types/ai-enhancement";

interface AIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ResumeData;
  originalText: string;
  onEnhance: (options: AIEnhancementOptions) => Promise<AIEnhancementResult>;
  onAccept: (enhancedData: ResumeData) => void;
  onReject: () => void;
}

export function AIEnhancementModal({
  isOpen,
  onClose,
  parsedData,
  originalText,
  onEnhance,
  onAccept,
  onReject,
}: AIEnhancementModalProps) {
  const { aiSettings } = useResumeStore();
  const { isDark } = useTheme();
  const [step, setStep] = useState<"options" | "enhancing" | "review">(
    "options",
  );
  const [enhancementResult, setEnhancementResult] =
    useState<AIEnhancementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<AIEnhancementOptions>({
    provider: aiSettings?.provider || "openai",
    enhancementLevel: "moderate",
    focusAreas: [],
    enableFallback: true,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("options");
      setEnhancementResult(null);
      setError(null);
      setOptions({
        provider: aiSettings?.provider || "openai",
        model: aiSettings?.model,
        enhancementLevel: aiSettings?.enhancementLevel || "moderate",
        focusAreas: aiSettings?.focusAreas || [],
        jobDescription: aiSettings?.jobDescription,
        userInstructions: aiSettings?.userInstructions,
        enableFallback: aiSettings?.enableFallback ?? true,
      });
    }
  }, [isOpen, aiSettings]);

  const handleEnhance = async () => {
    setStep("enhancing");
    setError(null);

    try {
      const result = await onEnhance(options);
      setEnhancementResult(result);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
      setStep("options");
    }
  };

  const handleAccept = () => {
    if (enhancementResult) {
      onAccept(enhancementResult.enhancedData);
      onClose();
    }
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg p-6 shadow-xl ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-blue-600" size={24} />
            <h2
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              AI Enhancement
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {step === "options" && (
          <div className="space-y-6">
            <div
              className={`rounded-lg border p-4 ${
                isDark
                  ? "border-blue-700 bg-blue-900/20"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="mt-1 text-blue-600" size={16} />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    AI-Powered Resume Enhancement
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      isDark ? "text-blue-400" : "text-blue-700"
                    }`}
                  >
                    Our AI will analyze your resume and suggest improvements to
                    make it more impactful and ATS-friendly while maintaining
                    accuracy.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div
                className={`rounded-lg border p-3 ${
                  isDark
                    ? "border-red-700 bg-red-900/20"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-600" size={16} />
                  <span
                    className={`text-sm ${
                      isDark ? "text-red-300" : "text-red-800"
                    }`}
                  >
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Enhancement Level
                </label>
                <Select
                  value={options.enhancementLevel}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      enhancementLevel: e.target.value as
                        | "light"
                        | "moderate"
                        | "comprehensive",
                    })
                  }
                >
                  <option value="light">Light - Grammar & clarity</option>
                  <option value="moderate">Moderate - Impact & keywords</option>
                  <option value="comprehensive">
                    Comprehensive - Full optimization
                  </option>
                </Select>
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  AI Provider
                </label>
                <Select
                  value={options.provider}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      provider: e.target.value as
                        | "openai"
                        | "anthropic"
                        | "gemini",
                    })
                  }
                >
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="anthropic">Claude</option>
                  <option value="gemini">Google Gemini</option>
                </Select>
              </div>
            </div>

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Job Description (Optional)
              </label>
              <textarea
                className={`min-h-[100px] w-full rounded-md border p-3 text-sm ${
                  isDark
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Paste the job description to tailor enhancements..."
                value={options.jobDescription || ""}
                onChange={(e) =>
                  setOptions({ ...options, jobDescription: e.target.value })
                }
              />
            </div>

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Additional Instructions (Optional)
              </label>
              <TextInput
                placeholder="e.g., Focus on leadership, emphasize technical skills..."
                value={options.userInstructions || ""}
                onChange={(e) =>
                  setOptions({ ...options, userInstructions: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableFallback"
                checked={options.enableFallback}
                onChange={(e) =>
                  setOptions({ ...options, enableFallback: e.target.checked })
                }
              />
              <label
                htmlFor="enableFallback"
                className={`text-sm ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Enable fallback to other AI providers if primary fails
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Skip AI Enhancement
              </Button>
              <Button
                onClick={handleEnhance}
                className="flex items-center gap-2"
              >
                <Sparkles size={16} />
                Enhance with AI
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {step === "enhancing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 animate-spin text-blue-600" size={48} />
            <h3
              className={`mb-2 text-lg font-medium ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Enhancing your resume...
            </h3>
            <p
              className={`text-center text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Our AI is analyzing your resume and generating improvements.
              <br />
              This may take 10-30 seconds.
            </p>
          </div>
        )}

        {step === "review" && enhancementResult && (
          <div className="space-y-6">
            <div
              className={`rounded-lg border p-4 ${
                isDark
                  ? "border-green-700 bg-green-900/20"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <p
                    className={`font-medium ${
                      isDark ? "text-green-300" : "text-green-800"
                    }`}
                  >
                    Enhancement Complete!
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-green-400" : "text-green-700"
                    }`}
                  >
                    {enhancementResult.suggestions.length} improvements
                    suggested (Confidence:{" "}
                    {Math.round(enhancementResult.confidence * 100)}%)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Original</CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Enhanced</CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(enhancementResult.enhancedData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4
                className={`mb-3 font-medium ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                AI Suggestions
              </h4>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {enhancementResult.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`rounded border p-3 ${
                      isDark
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {suggestion.field}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {suggestion.reasoning}
                        </p>
                      </div>
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReject}>
                <XCircle size={16} className="mr-2" />
                Use Original
              </Button>
              <Button onClick={handleAccept}>
                <CheckCircle size={16} className="mr-2" />
                Accept Enhanced
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
