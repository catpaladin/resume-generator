import { modelsDevService } from "../../services/modelsDevService.svelte.ts";

interface ModelPricing {
  inputCostPer1M: number; // USD per 1M input tokens
  outputCostPer1M: number; // USD per 1M output tokens
  contextWindow: number; // Maximum context window size
}

interface ProviderPricing {
  [model: string]: ModelPricing;
}

// Updated pricing as of January 2025
const PRICING_DATA: Record<string, ProviderPricing> = {
  openai: {
    "gpt-4o": {
      inputCostPer1M: 2.5,
      outputCostPer1M: 10.0,
      contextWindow: 128000,
    },
    "gpt-4o-mini": {
      inputCostPer1M: 0.15,
      outputCostPer1M: 0.6,
      contextWindow: 128000,
    },
    "gpt-4-turbo": {
      inputCostPer1M: 10.0,
      outputCostPer1M: 30.0,
      contextWindow: 128000,
    },
    "gpt-4": {
      inputCostPer1M: 30.0,
      outputCostPer1M: 60.0,
      contextWindow: 8192,
    },
    "gpt-3.5-turbo": {
      inputCostPer1M: 0.5,
      outputCostPer1M: 1.5,
      contextWindow: 16385,
    },
  },
  anthropic: {
    "claude-3-5-sonnet-20241022": {
      inputCostPer1M: 3.0,
      outputCostPer1M: 15.0,
      contextWindow: 200000,
    },
    "claude-3-5-haiku-20241022": {
      inputCostPer1M: 0.8,
      outputCostPer1M: 4.0,
      contextWindow: 200000,
    },
    "claude-3-opus-20240229": {
      inputCostPer1M: 15.0,
      outputCostPer1M: 75.0,
      contextWindow: 200000,
    },
    "claude-3-sonnet-20240229": {
      inputCostPer1M: 3.0,
      outputCostPer1M: 15.0,
      contextWindow: 200000,
    },
    "claude-3-haiku-20240307": {
      inputCostPer1M: 0.25,
      outputCostPer1M: 1.25,
      contextWindow: 200000,
    },
  },
  gemini: {
    "gemini-1.5-pro": {
      inputCostPer1M: 1.25,
      outputCostPer1M: 5.0,
      contextWindow: 2097152, // 2M tokens
    },
    "gemini-1.5-flash": {
      inputCostPer1M: 0.075,
      outputCostPer1M: 0.3,
      contextWindow: 1048576, // 1M tokens
    },
    "gemini-1.0-pro": {
      inputCostPer1M: 0.5,
      outputCostPer1M: 1.5,
      contextWindow: 32768,
    },
  },
};

interface TokenEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
  model: string;
  provider: string;
  tokenEstimate: TokenEstimate;
  warningsExceededContext?: boolean;
}

export class CostEstimator {
  private static readonly CHARS_PER_TOKEN = 4; // Rough approximation
  private static readonly DEFAULT_OUTPUT_TOKENS = 1500; // Estimated output for resume enhancement

  /**
   * Estimates the number of tokens for a given text
   */
  static estimateTokens(text: string): number {
    // More accurate estimation could use tiktoken library
    // For now, using the 4-character approximation
    return Math.ceil(text.length / this.CHARS_PER_TOKEN);
  }

  /**
   * Estimates cost for a resume enhancement request
   */
  static estimateEnhancementCost(
    provider: string,
    model: string,
    originalText: string,
    jobDescription?: string,
    userInstructions?: string,
    enhancementLevel: "light" | "moderate" | "comprehensive" = "moderate",
  ): CostEstimate | null {
    const pricing = this.getModelPricing(provider, model);
    if (!pricing) {
      return null;
    }

    // Calculate input tokens
    let inputText = originalText;
    if (jobDescription) inputText += "\n" + jobDescription;
    if (userInstructions) inputText += "\n" + userInstructions;

    // Add system prompt and formatting overhead (estimated)
    const systemPromptTokens = 500;
    const formattingOverhead = 200;

    const contentTokens = this.estimateTokens(inputText);
    const inputTokens = contentTokens + systemPromptTokens + formattingOverhead;

    // Estimate output tokens based on enhancement level
    let outputTokens = this.DEFAULT_OUTPUT_TOKENS;
    switch (enhancementLevel) {
      case "light":
        outputTokens = Math.ceil(this.DEFAULT_OUTPUT_TOKENS * 0.7);
        break;
      case "comprehensive":
        outputTokens = Math.ceil(this.DEFAULT_OUTPUT_TOKENS * 1.5);
        break;
      case "moderate":
      default:
        outputTokens = this.DEFAULT_OUTPUT_TOKENS;
        break;
    }

    // Check if we exceed context window
    const totalTokens = inputTokens + outputTokens;
    const warningsExceededContext = totalTokens > pricing.contextWindow;

    // If we exceed context window, we need to adjust
    if (warningsExceededContext) {
      // Reduce output tokens to fit in context window
      outputTokens = Math.max(500, pricing.contextWindow - inputTokens - 100); // Leave 100 tokens buffer
    }

    // Calculate costs
    const inputCost = (inputTokens / 1000000) * pricing.inputCostPer1M;
    const outputCost = (outputTokens / 1000000) * pricing.outputCostPer1M;
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
      currency: "USD",
      model,
      provider,
      tokenEstimate: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      warningsExceededContext,
    };
  }

  /**
   * Get all supported models for a provider with their pricing
   */
  static getProviderModels(provider: string): Array<{
    model: string;
    pricing: ModelPricing;
    costEfficiency: number; // Lower is more cost-effective
  }> {
    const staticPricing = PRICING_DATA[provider] || {};
    const dynamicModels = modelsDevService.getModelsForProvider(provider);

    const allModels: Record<string, ModelPricing> = { ...staticPricing };

    for (const model of dynamicModels) {
      const pricing = modelsDevService.getPricing(provider, model.id);
      if (pricing) {
        allModels[model.id] = pricing;
      }
    }

    if (Object.keys(allModels).length === 0) return [];

    return Object.entries(allModels)
      .map(([model, pricing]) => {
        // Calculate cost efficiency score (average cost per 1M tokens)
        const avgCost = (pricing.inputCostPer1M + pricing.outputCostPer1M) / 2;

        return {
          model,
          pricing,
          costEfficiency: avgCost,
        };
      })
      .sort((a, b) => a.costEfficiency - b.costEfficiency); // Sort by cost efficiency
  }

  /**
   * Get the most cost-effective model for a provider
   */
  static getMostCostEffectiveModel(provider: string): string | null {
    const models = this.getProviderModels(provider);
    return models.length > 0 ? models[0].model : null;
  }

  /**
   * Compare costs across all providers for a given request
   */
  static compareProvidersForRequest(
    originalText: string,
    jobDescription?: string,
    userInstructions?: string,
    enhancementLevel: "light" | "moderate" | "comprehensive" = "moderate",
  ): Array<CostEstimate & { recommended?: boolean }> {
    const results: Array<CostEstimate & { recommended?: boolean }> = [];

    // Get estimates for all providers and their most cost-effective models
    for (const provider of Object.keys(PRICING_DATA)) {
      const models = this.getProviderModels(provider);

      // Include top 2 models per provider (most cost-effective and best performance)
      const modelsToInclude = models.slice(0, 2);

      for (const { model } of modelsToInclude) {
        const estimate = this.estimateEnhancementCost(
          provider,
          model,
          originalText,
          jobDescription,
          userInstructions,
          enhancementLevel,
        );

        if (estimate) {
          results.push(estimate);
        }
      }
    }

    // Sort by total cost and mark the most cost-effective as recommended
    results.sort((a, b) => a.totalCost - b.totalCost);

    if (results.length > 0) {
      results[0].recommended = true;
    }

    return results;
  }

  /**
   * Format cost for display
   */
  static formatCost(cost: number, currency: string = "USD"): string {
    if (cost < 0.001) {
      return `<$0.001 ${currency}`;
    }

    if (cost < 0.01) {
      return `$${cost.toFixed(4)} ${currency}`;
    }

    return `$${cost.toFixed(3)} ${currency}`;
  }

  /**
   * Get pricing information for a specific model
   */
  static getModelPricing(provider: string, model: string): ModelPricing | null {
    const dynamicPricing = modelsDevService.getPricing(provider, model);
    if (dynamicPricing) {
      return dynamicPricing;
    }
    return PRICING_DATA[provider]?.[model] || null;
  }

  /**
   * Check if a model exists for a provider
   */
  static isModelSupported(provider: string, model: string): boolean {
    return Boolean(this.getModelPricing(provider, model));
  }

  /**
   * Get all supported providers
   */
  static getSupportedProviders(): string[] {
    const staticProviders = Object.keys(PRICING_DATA);
    // In a real app, we might want to merge with dynamic providers
    // but for now we'll stick to the ones we have UI for
    return staticProviders;
  }
}
