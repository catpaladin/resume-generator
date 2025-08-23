import React from "react";
import { DollarSign, TrendingUp, AlertTriangle, Info } from "lucide-react";

interface CostDisplayProps {
  cost: number;
  currency?: string;
  showBreakdown?: boolean;
  inputCost?: number;
  outputCost?: number;
  tokenCount?: {
    input: number;
    output: number;
    total: number;
  };
  model?: string;
  provider?: string;
  isRecommended?: boolean;
  exceedsContext?: boolean;
  className?: string;
}

export function CostDisplay({
  cost,
  currency = "USD",
  showBreakdown = false,
  inputCost,
  outputCost,
  tokenCount,
  model,
  provider,
  isRecommended = false,
  exceedsContext = false,
  className = "",
}: CostDisplayProps) {
  const formatCost = (amount: number) => {
    if (amount < 0.001) {
      return `<$0.001`;
    }
    if (amount < 0.01) {
      return `$${amount.toFixed(4)}`;
    }
    return `$${amount.toFixed(3)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-green-600" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {formatCost(cost)} {currency}
              </span>
              {isRecommended && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  <TrendingUp size={12} className="mr-1" />
                  Recommended
                </span>
              )}
            </div>
            {(model || provider) && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {provider && <span className="capitalize">{provider}</span>}
                {model && provider && " • "}
                {model && <span>{model}</span>}
              </div>
            )}
          </div>
        </div>

        {exceedsContext && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle size={14} />
            <span className="text-xs">Context limit</span>
          </div>
        )}
      </div>

      {showBreakdown &&
        (inputCost !== undefined || outputCost !== undefined || tokenCount) && (
          <div className="mt-3 space-y-2 border-t pt-2">
            {inputCost !== undefined && outputCost !== undefined && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Info size={12} />
                    <span>Input</span>
                  </div>
                  <span className="font-medium">{formatCost(inputCost)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Info size={12} />
                    <span>Output</span>
                  </div>
                  <span className="font-medium">{formatCost(outputCost)}</span>
                </div>
              </div>
            )}

            {tokenCount && (
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div>Input tokens</div>
                  <div className="font-medium">
                    {formatTokens(tokenCount.input)}
                  </div>
                </div>
                <div className="text-center">
                  <div>Output tokens</div>
                  <div className="font-medium">
                    {formatTokens(tokenCount.output)}
                  </div>
                </div>
                <div className="text-center">
                  <div>Total tokens</div>
                  <div className="font-medium">
                    {formatTokens(tokenCount.total)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
