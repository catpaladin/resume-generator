import React, { useState, useEffect, useCallback } from "react";
import { CostDisplay } from "./cost-display";
import { Button } from "./button/button";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { CostEstimator } from "@/lib/ai/cost-estimator";
import type { AIEnhancementOptions } from "@/types/ai-enhancement";

interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
  model: string;
  provider: string;
  tokenEstimate: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  warningsExceededContext?: boolean;
  recommended?: boolean;
}

interface CostComparisonProps {
  originalText: string;
  options: AIEnhancementOptions;
  onProviderChange?: (provider: string, model: string) => void;
  className?: string;
}

export function CostComparison({
  originalText,
  options,
  onProviderChange,
  className = "",
}: CostComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [estimates, setEstimates] = useState<CostEstimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<CostEstimate | null>(
    null,
  );

  const updateEstimates = useCallback(async () => {
    setIsLoading(true);
    try {
      const comparisons = CostEstimator.compareProvidersForRequest(
        originalText,
        options.jobDescription,
        options.userInstructions,
        options.enhancementLevel,
      );

      setEstimates(comparisons);

      // Find current selection or set recommended
      const currentSelection = comparisons.find(
        (est) =>
          est.provider === options.provider && est.model === options.model,
      );
      const recommended = comparisons.find((est) => est.recommended);

      setSelectedEstimate(currentSelection || recommended || comparisons[0]);
    } catch (error) {
      console.error("Failed to calculate cost estimates:", error);
      setEstimates([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    originalText,
    options.jobDescription,
    options.userInstructions,
    options.enhancementLevel,
    options.provider,
    options.model,
  ]);

  useEffect(() => {
    if (originalText.trim()) {
      updateEstimates();
    }
  }, [originalText, updateEstimates]);

  const handleProviderSelection = (estimate: CostEstimate) => {
    setSelectedEstimate(estimate);
    onProviderChange?.(estimate.provider, estimate.model);
  };

  if (!estimates.length && !isLoading) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Estimated Cost
        </h4>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={updateEstimates}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Compare Options
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      ) : (
        <>
          {/* Current/Selected Estimate */}
          {selectedEstimate && (
            <CostDisplay
              cost={selectedEstimate.totalCost}
              inputCost={selectedEstimate.inputCost}
              outputCost={selectedEstimate.outputCost}
              tokenCount={{
                input: selectedEstimate.tokenEstimate.inputTokens,
                output: selectedEstimate.tokenEstimate.outputTokens,
                total: selectedEstimate.tokenEstimate.totalTokens,
              }}
              model={selectedEstimate.model}
              provider={selectedEstimate.provider}
              isRecommended={selectedEstimate.recommended}
              exceedsContext={selectedEstimate.warningsExceededContext}
              showBreakdown={isExpanded}
              className={
                selectedEstimate.recommended
                  ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }
            />
          )}

          {/* Expanded Comparison */}
          {isExpanded && estimates.length > 1 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                All Options ({estimates.length})
              </div>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {estimates.map((estimate) => (
                  <button
                    key={`${estimate.provider}-${estimate.model}`}
                    onClick={() => handleProviderSelection(estimate)}
                    className="w-full text-left transition-opacity hover:opacity-80"
                    disabled={
                      selectedEstimate?.provider === estimate.provider &&
                      selectedEstimate?.model === estimate.model
                    }
                  >
                    <CostDisplay
                      cost={estimate.totalCost}
                      model={estimate.model}
                      provider={estimate.provider}
                      isRecommended={estimate.recommended}
                      exceedsContext={estimate.warningsExceededContext}
                      className={`transition-all ${
                        selectedEstimate?.provider === estimate.provider &&
                        selectedEstimate?.model === estimate.model
                          ? "ring-2 ring-blue-500"
                          : "hover:border-gray-300 dark:hover:border-gray-600"
                      } ${
                        estimate.recommended
                          ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cost Savings Notice */}
          {estimates.length > 1 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: {estimates[0].recommended ? "Green" : "First"} option
              offers the best value.
              {estimates.length > 2 &&
                ` Save up to ${CostEstimator.formatCost(
                  Math.max(...estimates.map((e) => e.totalCost)) -
                    Math.min(...estimates.map((e) => e.totalCost)),
                )} by choosing wisely.`}
            </div>
          )}
        </>
      )}
    </div>
  );
}
