import type {
  AIProvider,
  AIProviderConfig,
  AIEnhancementRequest,
  AIEnhancementResult,
  AIEnhancementOptions,
  AIError,
} from "@/types/ai-enhancement";
import type { AISettings, ResumeData } from "@/types/resume";
import { OpenAIProvider } from "./providers/openai-provider";
import { ClaudeProvider } from "./providers/claude-provider";
import { GeminiProvider } from "./providers/gemini-provider";
import { getApiKey } from "@/services/secureStorage";

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: AIProvider | null = null;

  constructor() {
    // Register all available providers
    this.providers.set("openai", new OpenAIProvider());
    this.providers.set("anthropic", new ClaudeProvider());
    this.providers.set("gemini", new GeminiProvider());
  }

  /**
   * Configure and set the active AI provider
   */
  async configureProvider(settings: AISettings): Promise<void> {
    if (!settings.provider) {
      throw new Error("No AI provider specified");
    }

    const provider = this.providers.get(settings.provider);
    if (!provider) {
      throw new Error(`Unsupported AI provider: ${settings.provider}`);
    }

    // Get API key from secure storage
    console.log(
      `[AIService] Attempting to retrieve API key for provider: ${settings.provider}`,
    );
    const apiKey = await getApiKey(settings.provider);
    console.log(
      `[AIService] API key retrieval result:`,
      apiKey ? `Found (${apiKey.length} chars)` : "Not found",
    );

    if (!apiKey) {
      const providerNames = {
        openai: "OpenAI",
        anthropic: "Anthropic",
        gemini: "Google Gemini",
      };
      const providerName =
        providerNames[settings.provider as keyof typeof providerNames] ||
        settings.provider;
      console.error(`[AIService] No API key found for ${providerName}`);
      throw new Error(
        `No API key found for ${providerName}. Please configure your API key in AI Settings.`,
      );
    }

    // Configure the provider
    const config: AIProviderConfig = {
      name: settings.provider,
      apiKey,
      model: settings.customModel || settings.model,
      maxRetries: 3,
      timeout: 30000,
    };

    try {
      provider.configure(config);
      this.currentProvider = provider;
    } catch (error) {
      throw new Error(
        `Failed to configure ${settings.provider} provider: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Test connection to the current provider
   */
  async testConnection(): Promise<boolean> {
    if (!this.currentProvider) {
      throw new Error("No AI provider configured");
    }

    return this.currentProvider.testConnection();
  }

  /**
   * Enhance resume data using the configured AI provider
   */
  async enhanceResume(
    options: AIEnhancementOptions,
    originalText: string,
    parsedData: ResumeData,
  ): Promise<AIEnhancementResult> {
    // Configure provider if needed
    if (
      !this.currentProvider ||
      this.currentProvider.name.toLowerCase() !== options.provider
    ) {
      const settings: AISettings = {
        provider: options.provider,
        model: options.model,
        customModel: options.model,
        jobDescription: options.jobDescription,
        userInstructions: options.userInstructions,
        hasApiKey: true,
      };
      await this.configureProvider(settings);
    }

    if (!this.currentProvider) {
      throw new Error("Failed to configure AI provider");
    }

    const request: AIEnhancementRequest = {
      originalText,
      parsedData,
      jobDescription: options.jobDescription,
      userInstructions: options.userInstructions,
      focusAreas: options.focusAreas,
      enhancementLevel: options.enhancementLevel,
    };

    try {
      return await this.currentProvider.enhanceResume(request);
    } catch (error) {
      if (options.enableFallback && this.shouldTryFallback(error)) {
        return this.tryFallbackProvider(request, options);
      }
      throw error;
    }
  }

  /**
   * Estimate the cost of enhancement
   */
  async estimateCost(
    provider: string,
    originalText: string,
    parsedData: ResumeData,
  ): Promise<number> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }

    const request: AIEnhancementRequest = {
      originalText,
      parsedData,
      enhancementLevel: "moderate",
    };

    return providerInstance.estimateCost(request);
  }

  /**
   * Get supported models for a provider
   */
  async getSupportedModels(provider: string): Promise<string[]> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }

    return providerInstance.getSupportedModels();
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get the current provider name
   */
  getCurrentProvider(): string | null {
    return this.currentProvider?.name || null;
  }

  /**
   * Try fallback provider in case of failure
   */
  private async tryFallbackProvider(
    request: AIEnhancementRequest,
    options: AIEnhancementOptions,
  ): Promise<AIEnhancementResult> {
    const fallbackProviders = this.getFallbackProviders(options.provider);

    for (const fallbackProvider of fallbackProviders) {
      try {
        console.log(`Trying fallback provider: ${fallbackProvider}`);

        const settings: AISettings = {
          provider: fallbackProvider as "openai" | "anthropic" | "gemini",
          hasApiKey: true,
        };

        await this.configureProvider(settings);

        if (this.currentProvider) {
          const result = await this.currentProvider.enhanceResume(request);

          // Add note about fallback
          result.suggestions.unshift({
            id: `fallback_${Date.now()}`,
            field: "provider",
            section: "personal",
            originalValue: options.provider,
            suggestedValue: fallbackProvider,
            reasoning: `Original provider ${options.provider} failed, used ${fallbackProvider} as fallback`,
            confidence: 0.8,
            type: "correction",
            accepted: false,
          });

          return result;
        }
      } catch (fallbackError) {
        console.warn(
          `Fallback provider ${fallbackProvider} also failed:`,
          fallbackError,
        );
        continue;
      }
    }

    throw new Error("All providers failed, including fallbacks");
  }

  /**
   * Determine if we should try fallback providers
   */
  private shouldTryFallback(error: unknown): boolean {
    if (error && typeof error === "object" && "type" in error) {
      const aiError = error as AIError;
      return (
        aiError.type === "rate_limit" ||
        aiError.type === "quota_exceeded" ||
        aiError.type === "network_error"
      );
    }
    return false;
  }

  /**
   * Get fallback providers in order of preference
   */
  private getFallbackProviders(currentProvider: string): string[] {
    const allProviders = ["openai", "anthropic", "gemini"];
    return allProviders.filter((p) => p !== currentProvider);
  }
}

// Export a singleton instance
export const aiService = new AIService();

// Helper function for easy usage
export async function enhanceResumeWithAI(
  options: AIEnhancementOptions,
  originalText: string,
  parsedData: ResumeData,
): Promise<AIEnhancementResult> {
  try {
    console.log(
      `[enhanceResumeWithAI] Starting enhancement with provider: ${options.provider}`,
    );

    // Get API key from secure storage
    const apiKey = await getApiKey(options.provider);
    if (!apiKey) {
      throw new Error(`No API key found for ${options.provider}`);
    }

    // Use the server-side enhance endpoint to avoid CORS issues
    // In Electron, we need to use absolute URLs for protocol handler to work
    const isElectron =
      typeof window !== "undefined" && window.location.protocol === "app:";
    const url = isElectron
      ? `app://localhost/api/ai/enhance`
      : "/api/ai/enhance";
    console.log(
      `[enhanceResumeWithAI] Environment: ${isElectron ? "Electron" : "Web"}, URL: ${url}`,
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        options,
        originalText,
        parsedData,
        apiKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Enhancement failed: ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log(
      `[enhanceResumeWithAI] Enhancement completed successfully`,
      result,
    );

    return result;
  } catch (error) {
    console.error("[enhanceResumeWithAI] Enhancement failed:", error);
    throw error;
  }
}

// Helper function to test AI connectivity
export async function testAIConnection(
  settings: AISettings,
  testApiKey?: string,
): Promise<boolean> {
  try {
    console.log(
      `[testAIConnection] Testing connection for provider: ${settings.provider}`,
    );

    // Use provided API key for testing, or get from secure storage
    let apiKey = testApiKey;
    if (!apiKey) {
      const { getApiKey } = await import("@/services/secureStorage");
      apiKey = (await getApiKey(settings.provider)) || undefined;
    }

    if (!apiKey) {
      console.error(
        `[testAIConnection] No API key found for ${settings.provider}`,
      );
      return false;
    }

    // Use the server-side test endpoint to avoid CORS issues
    // In Electron, we need to use absolute URLs for protocol handler to work
    const isElectron =
      typeof window !== "undefined" && window.location.protocol === "app:";
    const url = isElectron ? `app://localhost/api/ai/test` : "/api/ai/test";
    console.log(
      `[testAIConnection] Environment: ${isElectron ? "Electron" : "Web"}`,
    );
    console.log(`[testAIConnection] Making request to: ${url}`);
    console.log(`[testAIConnection] Current location:`, window.location.href);
    console.log(
      `[testAIConnection] window.location.origin:`,
      typeof window !== "undefined" ? window.location.origin : "N/A",
    );
    console.log(`[testAIConnection] Request payload:`, {
      provider: settings.provider,
      model: settings.customModel || settings.model,
      apiKeyLength: apiKey.length,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: settings.provider,
        apiKey,
        model: settings.customModel || settings.model,
      }),
    });

    console.log(`[testAIConnection] Response status:`, response.status);
    console.log(
      `[testAIConnection] Response headers:`,
      Object.fromEntries(response.headers),
    );

    const result = await response.json();
    console.log(
      `[testAIConnection] Test result:`,
      result.success ? "Success" : "Failed",
      result,
    );

    return result.success;
  } catch (error) {
    console.error("AI connection test failed:", error);
    return false;
  }
}

// Helper function to estimate costs across providers
export async function estimateEnhancementCosts(
  originalText: string,
  parsedData: ResumeData,
): Promise<Record<string, number>> {
  const costs: Record<string, number> = {};
  const providers = aiService.getAvailableProviders();

  for (const provider of providers) {
    try {
      costs[provider] = await aiService.estimateCost(
        provider,
        originalText,
        parsedData,
      );
    } catch (error) {
      costs[provider] = 0; // Set to 0 if estimation fails
    }
  }

  return costs;
}
