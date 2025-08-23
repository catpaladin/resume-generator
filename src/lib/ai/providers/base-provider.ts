import type {
  AIProvider,
  AIProviderConfig,
  AIEnhancementRequest,
  AIEnhancementResult,
  AIError,
} from "@/types/ai-enhancement";

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig | null = null;
  protected isConfigured = false;

  abstract name: string;

  configure(config: AIProviderConfig): void {
    this.config = config;
    this.isConfigured = true;
  }

  protected ensureConfigured(): void {
    if (!this.isConfigured || !this.config) {
      throw new Error(`${this.name} provider is not configured`);
    }
  }

  protected createError(
    type: AIError["type"],
    message: string,
    retryAfter?: number,
    suggestion?: string,
  ): AIError {
    return {
      type,
      message,
      provider: this.name,
      retryAfter,
      suggestion,
    };
  }

  protected async handleRequest<T>(
    request: () => Promise<T>,
    retries = 3,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if it's a retryable error
        if (this.isRetryableError(error) && attempt < retries) {
          const delay = this.calculateRetryDelay(attempt);
          await this.sleep(delay);
          continue;
        }

        throw this.mapErrorToAIError(error);
      }
    }

    throw this.mapErrorToAIError(lastError!);
  }

  protected isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("network") ||
        message.includes("timeout") ||
        message.includes("rate limit") ||
        message.includes("502") ||
        message.includes("503") ||
        message.includes("504")
      );
    }
    return false;
  }

  protected calculateRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected mapErrorToAIError(error: unknown): AIError {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("api key") || message.includes("unauthorized")) {
        return this.createError(
          "api_key_invalid",
          "Invalid API key. Please check your configuration.",
          undefined,
          "Verify your API key in the AI settings",
        );
      }

      if (
        message.includes("rate limit") ||
        message.includes("too many requests")
      ) {
        const retryAfterMatch = error.message.match(/retry after (\d+)/i);
        const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 60;

        return this.createError(
          "rate_limit",
          "Rate limit exceeded. Please try again later.",
          retryAfter,
          "Consider upgrading your API plan or trying a different provider",
        );
      }

      if (message.includes("quota") || message.includes("billing")) {
        return this.createError(
          "quota_exceeded",
          "API quota exceeded or billing issue.",
          undefined,
          "Check your billing status or try a different provider",
        );
      }

      if (message.includes("model") && message.includes("not found")) {
        return this.createError(
          "model_unavailable",
          "The specified model is not available.",
          undefined,
          "Try a different model or check the provider's documentation",
        );
      }

      if (message.includes("network") || message.includes("timeout")) {
        return this.createError(
          "network_error",
          "Network error occurred. Please check your connection.",
          30,
          "Check your internet connection and try again",
        );
      }
    }

    return this.createError(
      "parsing_error",
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      "Please try again or contact support if the issue persists",
    );
  }

  protected generateSuggestionId(): string {
    return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Abstract methods that must be implemented by each provider
  abstract testConnection(): Promise<boolean>;
  abstract enhanceResume(
    request: AIEnhancementRequest,
  ): Promise<AIEnhancementResult>;
  abstract estimateCost(request: AIEnhancementRequest): Promise<number>;
  abstract getSupportedModels(): Promise<string[]>;
}
