import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Edit3,
} from "lucide-react";

interface AIConfirmationModalProps {
  isOpen: boolean;
  originalText: string;
  enhancedText: string;
  onAccept: () => void;
  onReject: () => void;
  onRefine?: (refinementInstructions: string) => void;
  isLoading?: boolean;
  isRefining?: boolean;
}

export function AIConfirmationModal({
  isOpen,
  originalText,
  enhancedText,
  onAccept,
  onReject,
  onRefine,
  isLoading = false,
  isRefining = false,
}: AIConfirmationModalProps) {
  const [showRefinement, setShowRefinement] = useState(false);
  const [refinementInstructions, setRefinementInstructions] = useState("");

  if (!isOpen) return null;

  const handleRefine = () => {
    if (onRefine && refinementInstructions.trim()) {
      const sanitizedInstructions = sanitizeInstructions(
        refinementInstructions,
      );
      onRefine(sanitizedInstructions);
      setRefinementInstructions("");
      setShowRefinement(false);
    }
  };

  const sanitizeInstructions = (input: string) => {
    // Very light sanitization - only remove truly dangerous content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: URLs
      .substring(0, 300) // Limit length
      .trim();
  };

  // Simple diff algorithm to highlight changes
  const getImprovement = (original: string, enhanced: string) => {
    const improvements = [];

    // Check for quantifiable metrics
    const numberRegex =
      /\d+(?:\.\d+)?(?:\s*(?:%|percent|k|thousand|m|million|b|billion))?/gi;
    const enhancedNumbers = enhanced.match(numberRegex) || [];
    const originalNumbers = original.match(numberRegex) || [];

    if (enhancedNumbers.length > originalNumbers.length) {
      improvements.push("Added quantifiable metrics");
    }

    // Check for action verbs
    const actionVerbs =
      /\b(led|managed|developed|created|implemented|improved|increased|reduced|optimized|delivered|achieved|designed|built|launched|streamlined|enhanced|established|coordinated|executed|analyzed|resolved)\b/gi;
    const enhancedVerbs = enhanced.match(actionVerbs) || [];
    const originalVerbs = original.match(actionVerbs) || [];

    if (enhancedVerbs.length > originalVerbs.length) {
      improvements.push("Stronger action verbs");
    }

    // Check for impact words
    const impactWords =
      /\b(impact|result|outcome|success|growth|efficiency|performance|productivity|revenue|cost|savings|roi|improvement)\b/gi;
    const enhancedImpacts = enhanced.match(impactWords) || [];
    const originalImpacts = original.match(impactWords) || [];

    if (enhancedImpacts.length > originalImpacts.length) {
      improvements.push("More impact-focused language");
    }

    // Check for conciseness
    if (enhanced.length < original.length * 0.9) {
      improvements.push("More concise phrasing");
    } else if (enhanced.length > original.length * 1.1) {
      improvements.push("More detailed description");
    }

    // Check for better structure
    if (
      enhanced.includes(";") ||
      enhanced.split(",").length > original.split(",").length
    ) {
      improvements.push("Better structure and flow");
    }

    return improvements.length > 0
      ? improvements
      : ["Enhanced clarity and professionalism"];
  };

  const improvements = getImprovement(originalText, enhancedText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-600" />
            <h3 className="text-lg font-semibold">AI Enhancement Preview</h3>
          </div>
          <IconButton
            variant="ghost"
            icon={<X size={18} />}
            onClick={onReject}
            aria-label="Close"
            disabled={isLoading}
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Original Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Original:
            </label>
            <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-700">
              <p className="text-sm text-gray-600 italic dark:text-gray-400">
                &ldquo;{originalText}&rdquo;
              </p>
            </div>
          </div>

          {/* Enhanced Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Enhanced:
            </label>
            <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-3 dark:border-purple-700 dark:from-purple-900/20 dark:to-blue-900/20">
              <p className="text-sm font-medium">
                &ldquo;{enhancedText}&rdquo;
              </p>
            </div>
          </div>

          {/* Key Improvements */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              <CheckCircle2 size={14} className="text-green-600" />
              Key Improvements:
            </label>
            <div className="space-y-1">
              {improvements.map((improvement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400"
                >
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  {improvement}
                </div>
              ))}
            </div>
          </div>

          {/* Warning if significantly different */}
          {enhancedText.length > originalText.length * 1.5 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
              <AlertCircle
                size={16}
                className="mt-0.5 flex-shrink-0 text-amber-600"
              />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <p className="font-medium">Notice:</p>
                <p>
                  The enhanced version is significantly longer. Make sure it
                  aligns with your experience.
                </p>
              </div>
            </div>
          )}

          {/* Refinement Section */}
          {onRefine && (
            <div className="space-y-3 rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-3 dark:border-blue-700/50 dark:from-blue-900/10 dark:to-purple-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Need further refinement?
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRefinement(!showRefinement)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {showRefinement ? "Hide" : "Refine Further"}
                </Button>
              </div>

              {showRefinement && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Additional instructions:
                    </label>
                    <textarea
                      value={refinementInstructions}
                      onChange={(e) =>
                        setRefinementInstructions(e.target.value)
                      }
                      placeholder="e.g., 'Add more specific technologies used', 'Emphasize the business impact', 'Make it more concise'"
                      className="h-16 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                      maxLength={300}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {refinementInstructions.length}/300 characters
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleRefine}
                        disabled={!refinementInstructions.trim() || isRefining}
                        className="bg-blue-600 text-xs hover:bg-blue-700"
                      >
                        {isRefining ? (
                          <>
                            <RefreshCw
                              size={12}
                              className="mr-1 animate-spin"
                            />
                            Refining...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} className="mr-1" />
                            Refine
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 border-t pt-4">
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Keep Original
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isLoading}
          >
            <CheckCircle2 size={16} className="mr-2" />
            Use Enhancement
          </Button>
        </div>
      </div>
    </div>
  );
}
