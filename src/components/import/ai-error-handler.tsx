import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  Info,
  ExternalLink,
  Copy,
  CheckCircle,
  X,
  Settings,
  DollarSign,
  Clock,
  Wifi,
  Key,
  Server,
  Zap,
} from "lucide-react";
import type { AIError } from "@/types/ai-enhancement";

interface AIErrorHandlerProps {
  error: AIError;
  onRetry?: () => void;
  onFallback?: () => void;
  onDismiss?: () => void;
  onOpenSettings?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

interface ErrorSolution {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  link?: {
    label: string;
    url: string;
  };
}

export function AIErrorHandler({
  error,
  onRetry,
  onFallback,
  onDismiss,
  onOpenSettings,
  retryCount = 0,
  maxRetries = 3,
  className = "",
}: AIErrorHandlerProps) {
  const [copiedError, setCopiedError] = useState(false);

  const getErrorIcon = () => {
    switch (error.type) {
      case "rate_limit":
        return <Clock className="text-amber-500" size={24} />;
      case "api_key_invalid":
        return <Key className="text-red-500" size={24} />;
      case "network_error":
        return <Wifi className="text-orange-500" size={24} />;
      case "quota_exceeded":
        return <DollarSign className="text-purple-500" size={24} />;
      case "model_unavailable":
        return <Server className="text-blue-500" size={24} />;
      default:
        return <AlertTriangle className="text-red-500" size={24} />;
    }
  };

  const getErrorSeverity = () => {
    const criticalErrors = ["api_key_invalid", "quota_exceeded"];
    const warningErrors = ["rate_limit", "model_unavailable"];

    if (criticalErrors.includes(error.type)) return "critical";
    if (warningErrors.includes(error.type)) return "warning";
    return "error";
  };

  const getSolutions = (): ErrorSolution[] => {
    switch (error.type) {
      case "rate_limit":
        return [
          {
            title: "Wait and Retry",
            description: `Wait ${error.retryAfter || 60} seconds before trying again.`,
            action: error.retryAfter
              ? {
                  label: `Retry in ${error.retryAfter}s`,
                  onClick: () => {
                    setTimeout(
                      () => onRetry?.(),
                      (error.retryAfter || 60) * 1000,
                    );
                  },
                  icon: Clock,
                }
              : undefined,
          },
          {
            title: "Try Different Provider",
            description: "Switch to Claude or Gemini as fallback providers.",
            action: onFallback
              ? {
                  label: "Use Fallback",
                  onClick: onFallback,
                  icon: Zap,
                }
              : undefined,
          },
          {
            title: "Upgrade API Plan",
            description: "Consider upgrading your API plan for higher limits.",
            link: {
              label: "View Pricing",
              url:
                error.provider === "openai"
                  ? "https://openai.com/pricing"
                  : error.provider === "anthropic"
                    ? "https://console.anthropic.com/settings/plans"
                    : "https://makersuite.google.com/pricing",
            },
          },
        ];

      case "api_key_invalid":
        return [
          {
            title: "Check API Key",
            description:
              "Verify your API key is correct and has necessary permissions.",
            action: onOpenSettings
              ? {
                  label: "Open Settings",
                  onClick: onOpenSettings,
                  icon: Settings,
                }
              : undefined,
          },
          {
            title: "Generate New Key",
            description: "Create a new API key if the current one is expired.",
            link: {
              label: "API Console",
              url:
                error.provider === "openai"
                  ? "https://platform.openai.com/api-keys"
                  : error.provider === "anthropic"
                    ? "https://console.anthropic.com/settings/keys"
                    : "https://makersuite.google.com/app/apikey",
            },
          },
        ];

      case "quota_exceeded":
        return [
          {
            title: "Check Billing",
            description:
              "Verify your account has sufficient credits or billing is set up.",
            link: {
              label: "Billing Dashboard",
              url:
                error.provider === "openai"
                  ? "https://platform.openai.com/account/billing"
                  : error.provider === "anthropic"
                    ? "https://console.anthropic.com/settings/billing"
                    : "https://console.cloud.google.com/billing",
            },
          },
          {
            title: "Use Alternative Provider",
            description: "Switch to a different AI provider temporarily.",
            action: onFallback
              ? {
                  label: "Switch Provider",
                  onClick: onFallback,
                  icon: RefreshCw,
                }
              : undefined,
          },
        ];

      case "network_error":
        return [
          {
            title: "Check Connection",
            description: "Ensure you have a stable internet connection.",
            action: onRetry
              ? {
                  label: "Retry Connection",
                  onClick: onRetry,
                  icon: RefreshCw,
                }
              : undefined,
          },
          {
            title: "Try Later",
            description: "The service might be temporarily unavailable.",
          },
        ];

      case "model_unavailable":
        return [
          {
            title: "Use Different Model",
            description:
              "Try switching to an alternative model for this provider.",
            action: onOpenSettings
              ? {
                  label: "Change Model",
                  onClick: onOpenSettings,
                  icon: Settings,
                }
              : undefined,
          },
          {
            title: "Switch Provider",
            description: "Use a different AI provider temporarily.",
            action: onFallback
              ? {
                  label: "Use Fallback",
                  onClick: onFallback,
                  icon: Zap,
                }
              : undefined,
          },
        ];

      default:
        return [
          {
            title: "Retry Operation",
            description:
              "The error might be temporary. Try the operation again.",
            action: onRetry
              ? {
                  label: "Retry",
                  onClick: onRetry,
                  icon: RefreshCw,
                }
              : undefined,
          },
        ];
    }
  };

  const copyErrorDetails = async () => {
    const errorDetails = `
AI Enhancement Error Report
============================
Provider: ${error.provider}
Type: ${error.type}
Message: ${error.message}
Timestamp: ${new Date().toISOString()}
Retry Count: ${retryCount}
${error.suggestion ? `Suggestion: ${error.suggestion}` : ""}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopiedError(true);
      setTimeout(() => setCopiedError(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  const severity = getErrorSeverity();
  const solutions = getSolutions();

  const severityColors = {
    critical: "border-red-500 bg-red-50",
    warning: "border-amber-500 bg-amber-50",
    error: "border-orange-500 bg-orange-50",
  };

  const canRetry =
    onRetry && retryCount < maxRetries && error.type !== "api_key_invalid";

  return (
    <Card className={`${severityColors[severity]} ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getErrorIcon()}
            AI Enhancement Failed
            <span className="text-sm font-normal text-gray-600">
              ({error.provider})
            </span>
          </CardTitle>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        <div className="rounded-lg border bg-white p-3">
          <p className="mb-1 text-sm font-medium text-gray-900">
            Error Details
          </p>
          <p className="text-sm text-gray-700">{error.message}</p>
          {error.suggestion && (
            <p className="mt-2 text-sm italic text-blue-700">
              💡 {error.suggestion}
            </p>
          )}
        </div>

        {/* Retry Information */}
        {retryCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw size={14} />
            <span>
              Retry attempt {retryCount} of {maxRetries}
            </span>
          </div>
        )}

        {/* Solutions */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-1 text-sm font-medium text-gray-900">
            <Info size={16} />
            Recommended Solutions
          </h4>

          {solutions.map((solution, index) => (
            <div key={index} className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-gray-900">
                    {solution.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {solution.description}
                  </p>
                </div>
                <div className="ml-3 flex gap-2">
                  {solution.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={solution.action.onClick}
                      className="flex items-center gap-1"
                    >
                      {solution.action.icon && (
                        <solution.action.icon size={14} />
                      )}
                      {solution.action.label}
                    </Button>
                  )}
                  {solution.link && (
                    <a
                      href={solution.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <ExternalLink size={14} />
                      {solution.link.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-2">
          <div className="flex gap-2">
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Retry ({maxRetries - retryCount} left)
              </Button>
            )}

            {onFallback && error.type !== "api_key_invalid" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFallback}
                className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700"
              >
                <Zap size={14} />
                Try Fallback Provider
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyErrorDetails}
            className="flex items-center gap-1"
          >
            {copiedError ? (
              <>
                <CheckCircle size={14} className="text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Error
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
