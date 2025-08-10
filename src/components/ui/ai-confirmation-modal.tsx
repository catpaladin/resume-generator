import React from "react";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import { X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface AIConfirmationModalProps {
  isOpen: boolean;
  originalText: string;
  enhancedText: string;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function AIConfirmationModal({
  isOpen,
  originalText,
  enhancedText,
  onAccept,
  onReject,
  isLoading = false,
}: AIConfirmationModalProps) {
  if (!isOpen) return null;

  // Simple diff algorithm to highlight changes
  const getImprovement = (original: string, enhanced: string) => {
    const improvements = [];
    
    // Check for quantifiable metrics
    const numberRegex = /\d+(?:\.\d+)?(?:\s*(?:%|percent|k|thousand|m|million|b|billion))?/gi;
    const enhancedNumbers = enhanced.match(numberRegex) || [];
    const originalNumbers = original.match(numberRegex) || [];
    
    if (enhancedNumbers.length > originalNumbers.length) {
      improvements.push("Added quantifiable metrics");
    }

    // Check for action verbs
    const actionVerbs = /\b(led|managed|developed|created|implemented|improved|increased|reduced|optimized|delivered|achieved|designed|built|launched|streamlined|enhanced|established|coordinated|executed|analyzed|resolved)\b/gi;
    const enhancedVerbs = enhanced.match(actionVerbs) || [];
    const originalVerbs = original.match(actionVerbs) || [];
    
    if (enhancedVerbs.length > originalVerbs.length) {
      improvements.push("Stronger action verbs");
    }

    // Check for impact words
    const impactWords = /\b(impact|result|outcome|success|growth|efficiency|performance|productivity|revenue|cost|savings|roi|improvement)\b/gi;
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
    if (enhanced.includes(";") || enhanced.split(",").length > original.split(",").length) {
      improvements.push("Better structure and flow");
    }

    return improvements.length > 0 ? improvements : ["Enhanced clarity and professionalism"];
  };

  const improvements = getImprovement(originalText, enhancedText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
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
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                &ldquo;{originalText}&rdquo;
              </p>
            </div>
          </div>

          {/* Enhanced Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Enhanced:
            </label>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-sm font-medium">
                &ldquo;{enhancedText}&rdquo;
              </p>
            </div>
          </div>

          {/* Key Improvements */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <CheckCircle2 size={14} className="text-green-600" />
              Key Improvements:
            </label>
            <div className="space-y-1">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  {improvement}
                </div>
              ))}
            </div>
          </div>

          {/* Warning if significantly different */}
          {enhancedText.length > originalText.length * 1.5 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <p className="font-medium">Notice:</p>
                <p>The enhanced version is significantly longer. Make sure it aligns with your experience.</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
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