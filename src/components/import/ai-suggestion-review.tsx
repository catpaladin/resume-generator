import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import type { AISuggestion, AIEnhancementResult } from "@/types/ai-enhancement";

interface AISuggestionReviewProps {
  enhancementResult: AIEnhancementResult;
  onAcceptSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onApplyChanges: () => void;
  className?: string;
}

interface SuggestionItemProps {
  suggestion: AISuggestion;
  onAccept: () => void;
  onReject: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}

function SuggestionItem({
  suggestion,
  onAccept,
  onReject,
  showDetails,
  onToggleDetails,
}: SuggestionItemProps) {
  const getTypeIcon = () => {
    switch (suggestion.type) {
      case "improvement":
        return <Sparkles className="text-blue-500" size={16} />;
      case "correction":
        return <AlertTriangle className="text-amber-500" size={16} />;
      case "enhancement":
        return <CheckCircle className="text-green-500" size={16} />;
      case "addition":
        return <CheckCircle className="text-purple-500" size={16} />;
      default:
        return <Sparkles className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = () => {
    if (suggestion.accepted === true) return "border-green-200 bg-green-50";
    if (suggestion.accepted === false) return "border-red-200 bg-red-50";
    return "border-gray-200 bg-white hover:bg-gray-50";
  };

  const confidenceColor =
    suggestion.confidence >= 0.8
      ? "text-green-600"
      : suggestion.confidence >= 0.6
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {getTypeIcon()}
            <span className="text-sm font-medium capitalize">
              {suggestion.type}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-600">{suggestion.field}</span>
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-600">
                Original:
              </p>
              <p className="rounded bg-gray-100 p-2 text-sm text-gray-800">
                {suggestion.originalValue}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-600">
                AI Suggestion:
              </p>
              <p className="rounded bg-blue-50 p-2 text-sm text-gray-800">
                {suggestion.suggestedValue}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetails}
              className="flex h-auto items-center gap-1 p-0 text-xs"
            >
              {showDetails ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              {showDetails ? "Hide" : "Show"} reasoning
              {showDetails ? <EyeOff size={12} /> : <Eye size={12} />}
            </Button>

            {showDetails && (
              <div className="mt-2 rounded-md bg-gray-50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-600">
                  AI Reasoning:
                </p>
                <p className="text-xs text-gray-500">
                  {suggestion.confidence >= 0.8 ? "High" : "Medium"} confidence
                </p>
                <p className="text-sm text-gray-700">{suggestion.reasoning}</p>
              </div>
            )}
          </div>
        </div>

        <div className="ml-4 flex flex-col gap-2">
          {suggestion.accepted === undefined && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onAccept}
                className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              >
                <Check size={14} />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                className="flex items-center gap-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <X size={14} />
                Reject
              </Button>
            </>
          )}

          {suggestion.accepted === true && (
            <div className="flex items-center gap-1 text-green-700">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Accepted</span>
            </div>
          )}

          {suggestion.accepted === false && (
            <div className="flex items-center gap-1 text-red-700">
              <XCircle size={16} />
              <span className="text-sm font-medium">Rejected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AISuggestionReview({
  enhancementResult,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAcceptAll,
  onRejectAll,
  onApplyChanges,
  className = "",
}: AISuggestionReviewProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(
    new Set(),
  );
  const [filterType, setFilterType] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");

  const toggleSuggestionDetails = (suggestionId: string) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId);
    } else {
      newExpanded.add(suggestionId);
    }
    setExpandedSuggestions(newExpanded);
  };

  const filteredSuggestions = enhancementResult.suggestions.filter(
    (suggestion) => {
      switch (filterType) {
        case "pending":
          return suggestion.accepted === undefined;
        case "accepted":
          return suggestion.accepted === true;
        case "rejected":
          return suggestion.accepted === false;
        default:
          return true;
      }
    },
  );

  const suggestionStats = {
    total: enhancementResult.suggestions.length,
    pending: enhancementResult.suggestions.filter(
      (s) => s.accepted === undefined,
    ).length,
    accepted: enhancementResult.suggestions.filter((s) => s.accepted === true)
      .length,
    rejected: enhancementResult.suggestions.filter((s) => s.accepted === false)
      .length,
  };

  const hasChanges =
    suggestionStats.accepted > 0 || suggestionStats.rejected > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-blue-600" size={20} />
            AI Enhancement Review
            <span className="text-sm font-normal text-gray-500">
              ({suggestionStats.total} suggestions,{" "}
              {Math.round(enhancementResult.confidence * 100)}% overall
              confidence)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">
                {suggestionStats.total}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {suggestionStats.pending}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {suggestionStats.accepted}
              </div>
              <div className="text-xs text-gray-500">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {suggestionStats.rejected}
              </div>
              <div className="text-xs text-gray-500">Rejected</div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["all", "pending", "accepted", "rejected"].map((filter) => (
                <Button
                  key={filter}
                  variant={filterType === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter as typeof filterType)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              {suggestionStats.pending > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAcceptAll}
                    className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Accept All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRejectAll}
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <X size={14} className="mr-1" />
                    Generate All
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-3">
        {filteredSuggestions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                No suggestions to show for &quot;{filterType}&quot; filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              onAccept={() => onAcceptSuggestion(suggestion.id)}
              onReject={() => onRejectSuggestion(suggestion.id)}
              showDetails={expandedSuggestions.has(suggestion.id)}
              onToggleDetails={() => toggleSuggestionDetails(suggestion.id)}
            />
          ))
        )}
      </div>

      {/* Apply Changes */}
      {hasChanges && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-800">
                  Ready to apply changes?
                </p>
                <p className="text-sm text-blue-600">
                  {suggestionStats.accepted} suggestion(s) will be applied to
                  your resume.
                </p>
              </div>
              <Button
                onClick={onApplyChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RotateCcw size={16} className="mr-2" />
                Apply Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
