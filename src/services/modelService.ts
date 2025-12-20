/**
 * Model Service
 *
 * Fetches available models dynamically from AI providers' APIs
 * and provides fallback static lists for reliability.
 */

import { getApiKey } from "./secureStorage";
import { modelsDevService } from "./modelsDevService.svelte.ts";

export interface Model {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  isRecommended?: boolean;
  isDeprecated?: boolean;
}

export interface ModelProvider {
  name: string;
  models: Model[];
  lastFetched?: Date;
  error?: string;
}

// Fallback static models (updated for 2025)
const FALLBACK_MODELS = {
  openai: [
    {
      id: "gpt-4.1",
      name: "GPT-4.1",
      description: "Most capable model with major gains in coding",
      isRecommended: true,
    },
    {
      id: "gpt-4.1-mini",
      name: "GPT-4.1 Mini",
      description: "Faster and more cost-effective",
    },
    {
      id: "o3-pro",
      name: "o3 Pro",
      description: "Advanced reasoning model for complex tasks",
    },
    {
      id: "o4-mini",
      name: "o4 Mini",
      description: "Efficient reasoning model",
    },
    {
      id: "gpt-4o",
      name: "GPT-4o",
      description: "Multimodal model with text and image support",
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      description: "Smaller, faster version of GPT-4o",
    },
    // Legacy models marked as deprecated
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      description: "Legacy model",
      isDeprecated: true,
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      description: "Legacy model",
      isDeprecated: true,
    },
  ],
  anthropic: [
    {
      id: "claude-opus-4-1-20250805",
      name: "Claude Opus 4.1",
      description: "Most capable and intelligent model",
      isRecommended: true,
    },
    {
      id: "claude-opus-4-20250514",
      name: "Claude Opus 4",
      description: "High-performance flagship model",
      isRecommended: true,
    },
    {
      id: "claude-sonnet-4-20250514",
      name: "Claude Sonnet 4",
      description: "High-performance with exceptional reasoning",
      isRecommended: true,
    },
    {
      id: "claude-3-7-sonnet-latest",
      name: "Claude 3.7 Sonnet",
      description: "Extended thinking capabilities",
    },
    {
      id: "claude-3-5-sonnet-latest",
      name: "Claude 3.5 Sonnet (Latest)",
      description: "Balanced performance and cost",
    },
    {
      id: "claude-3-5-haiku-latest",
      name: "Claude 3.5 Haiku (Latest)",
      description: "Fast and cost-effective",
    },
    {
      id: "claude-3-5-sonnet-20240620",
      name: "Claude 3.5 Sonnet",
      description: "Stable version",
    },
    {
      id: "claude-3-haiku-20240307",
      name: "Claude 3 Haiku",
      description: "Legacy fast model",
    },
  ],
  gemini: [
    {
      id: "gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      description: "Most advanced AI model",
      isRecommended: true,
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      description: "Best price-performance ratio",
      isRecommended: true,
    },
    {
      id: "gemini-2.5-flash-lite",
      name: "Gemini 2.5 Flash Lite",
      description: "Most cost effective for high throughput",
    },
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      description: "Next-gen features with 1M token context",
    },
    {
      id: "gemini-2.0-flash-lite",
      name: "Gemini 2.0 Flash Lite",
      description: "Optimized for cost efficiency",
    },
    // Legacy models
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      description: "Legacy model",
      isDeprecated: true,
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      description: "Legacy model",
      isDeprecated: true,
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      description: "Legacy model",
      isDeprecated: true,
    },
  ],
} as const;

class ModelService {
  private cache = new Map<string, ModelProvider>();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  /**
   * Get models for a provider with caching
   */
  async getModels(provider: string): Promise<Model[]> {
    // Try to get models from models.dev first
    try {
      if (!modelsDevService.isDataLoaded()) {
        await modelsDevService.fetchModels();
      }
      const dynamicModels = modelsDevService.getModelsForProvider(provider);
      if (dynamicModels.length > 0) {
        return dynamicModels;
      }
    } catch (error) {
      console.warn(
        `Failed to fetch dynamic models from models.dev for ${provider}:`,
        error,
      );
    }

    const cached = this.cache.get(provider);

    // Return cached data if it's fresh
    if (
      cached &&
      cached.lastFetched &&
      Date.now() - cached.lastFetched.getTime() < this.CACHE_DURATION
    ) {
      return cached.models;
    }

    try {
      const models = await this.fetchModelsFromAPI(
        provider as keyof typeof FALLBACK_MODELS,
      );

      // Cache successful result
      this.cache.set(provider, {
        name: provider,
        models,
        lastFetched: new Date(),
      });

      return models;
    } catch (error) {
      console.warn(`Failed to fetch models for ${provider}:`, error);

      // Return fallback models
      const fallbackModels = this.getFallbackModels(
        provider as keyof typeof FALLBACK_MODELS,
      );

      // Cache fallback with error
      this.cache.set(provider, {
        name: provider,
        models: fallbackModels,
        lastFetched: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return fallbackModels;
    }
  }

  /**
   * Fetch models from provider APIs via proxy
   */
  private async fetchModelsFromAPI(
    provider: keyof typeof FALLBACK_MODELS,
  ): Promise<Model[]> {
    const apiKey = await getApiKey(provider);

    if (!apiKey) {
      throw new Error("API key required to fetch models");
    }

    // Use proxy endpoint to avoid CORS issues
    const response = await fetch("/api/ai/models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        apiKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to fetch models: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.models || [];
  }

  /**
   * Get fallback models for a provider
   */
  private getFallbackModels(provider: keyof typeof FALLBACK_MODELS): Model[] {
    return [...(FALLBACK_MODELS[provider] || [])] as Model[];
  }

  /**
   * Format model ID into a readable name
   */
  private formatModelName(id: string): string {
    return id
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(
        /\d{8,}/g,
        (match) =>
          `(${match.slice(0, 4)}-${match.slice(4, 6)}-${match.slice(6)})`,
      )
      .trim();
  }

  /**
   * Get model description based on ID
   */
  private getModelDescription(id: string, provider: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      openai: {
        "gpt-4.1":
          "Most capable model with major gains in coding and instruction following",
        "gpt-4o": "Multimodal model integrating text and images",
        "o3-pro": "Advanced reasoning model for complex problems",
        "o4-mini": "Efficient reasoning model",
      },
      anthropic: {
        "claude-opus-4.1": "Most capable and intelligent model",
        "claude-sonnet-4": "High-performance with exceptional reasoning",
        "claude-sonnet-3.7": "Extended thinking capabilities",
      },
      gemini: {
        "gemini-2.5-pro": "Most advanced AI model",
        "gemini-2.5-flash": "Best price-performance ratio",
        "gemini-2.0-flash": "Next-gen features with 1M token context",
      },
    };

    return descriptions[provider]?.[id] || "AI language model";
  }

  /**
   * Check if model is recommended
   */
  private isRecommendedModel(id: string, provider: string): boolean {
    const recommended = {
      openai: ["gpt-4.1", "gpt-4o", "o3-pro"],
      anthropic: [
        "claude-opus-4-1-20250805",
        "claude-opus-4-20250514",
        "claude-sonnet-4-20250514",
      ],
      gemini: ["gemini-2.5-pro", "gemini-2.5-flash"],
    };

    return (
      recommended[provider as keyof typeof recommended]?.some((rec) =>
        id.includes(rec),
      ) || false
    );
  }

  /**
   * Check if model is deprecated
   */
  private isDeprecatedModel(id: string, provider: string): boolean {
    const deprecated = {
      openai: [
        "gpt-4-turbo",
        "gpt-3.5-turbo",
        "davinci",
        "curie",
        "babbage",
        "ada",
      ],
      anthropic: ["claude-2", "claude-instant"],
      gemini: [
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-pro",
        "gemini-pro-vision",
      ],
    };

    return (
      deprecated[provider as keyof typeof deprecated]?.some((dep) =>
        id.includes(dep),
      ) || false
    );
  }

  /**
   * Clear cache for a provider
   */
  clearCache(provider?: string): void {
    if (provider) {
      this.cache.delete(provider);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache status
   */
  getCacheStatus(provider: string): {
    isCached: boolean;
    lastFetched?: Date;
    error?: string;
  } {
    const cached = this.cache.get(provider);
    return {
      isCached: !!cached,
      lastFetched: cached?.lastFetched,
      error: cached?.error,
    };
  }
}

export const modelService = new ModelService();

// Helper functions
export const getModelsForProvider = (provider: string) =>
  modelService.getModels(provider);
export const clearModelCache = (provider?: string) =>
  modelService.clearCache(provider);
export const getModelCacheStatus = (provider: string) =>
  modelService.getCacheStatus(provider);
