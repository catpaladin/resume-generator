import type { AIEnhancementResult } from "@/types/ai-enhancement";
import type { ResumeData, AISettings } from "@/types/resume";

/**
 * Performance optimizations for AI enhancement operations
 */

export class AIPerformanceOptimizer {
  private static instance: AIPerformanceOptimizer;
  private requestCache = new Map<
    string,
    { result: AIEnhancementResult; timestamp: number }
  >();
  private requestCacheBackup = new Map<
    string,
    { result: AIEnhancementResult; timestamp: number }
  >();
  private rateLimitTracker = new Map<
    string,
    { requests: number; resetTime: number }
  >();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

  static getInstance(): AIPerformanceOptimizer {
    if (!this.instance) {
      this.instance = new AIPerformanceOptimizer();
    }
    return this.instance;
  }

  /**
   * Creates a cache key for AI enhancement requests
   */
  private generateCacheKey(
    resumeText: string,
    settings: AISettings,
    jobDescription?: string,
  ): string {
    const content = [
      resumeText,
      settings.provider,
      settings.model,
      settings.enhancementLevel,
      JSON.stringify(settings.focusAreas || []),
      jobDescription || "",
      settings.userInstructions || "",
    ].join("|");

    // Create a simple hash of the content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `ai_cache_${Math.abs(hash)}`;
  }

  /**
   * Checks if we have a cached result for this request
   */
  getCachedResult(
    resumeText: string,
    settings: AISettings,
    jobDescription?: string,
  ): AIEnhancementResult | null {
    const key = this.generateCacheKey(resumeText, settings, jobDescription);
    const cached = this.requestCache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    // Clean up expired cache entry
    if (cached) {
      this.requestCache.delete(key);
    }

    return null;
  }

  /**
   * Caches an AI enhancement result
   */
  cacheResult(
    resumeText: string,
    settings: AISettings,
    result: AIEnhancementResult,
    jobDescription?: string,
  ): void {
    const key = this.generateCacheKey(resumeText, settings, jobDescription);
    this.requestCache.set(key, {
      result: { ...result },
      timestamp: Date.now(),
    });

    // Cleanup old cache entries periodically
    if (this.requestCache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Serializes a resume section to text
   */
  private compressData(data: unknown): string {
    if (!data) return "";

    if (typeof data === "string") {
      return data;
    }

    if (Array.isArray(data)) {
      return data
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object") return JSON.stringify(item);
          return String(item);
        })
        .join("\n");
    }

    if (typeof data === "object") {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    }

    return String(data);
  }

  /**
   * Removes expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.requestCache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Checks if a provider is rate limited
   */
  isRateLimited(provider: string): boolean {
    const tracker = this.rateLimitTracker.get(provider);
    if (!tracker) return false;

    const now = Date.now();
    if (now > tracker.resetTime) {
      // Reset the counter
      this.rateLimitTracker.delete(provider);
      return false;
    }

    // Check provider-specific limits
    const limits = {
      openai: 60, // 60 requests per minute
      anthropic: 50, // 50 requests per minute
      gemini: 60, // 60 requests per minute
    };

    const limit = limits[provider as keyof typeof limits] || 30;
    return tracker.requests >= limit;
  }

  /**
   * Records a request for rate limiting
   */
  recordRequest(provider: string): void {
    const now = Date.now();
    const tracker = this.rateLimitTracker.get(provider);

    if (!tracker || now > tracker.resetTime) {
      // Initialize or reset the tracker
      this.rateLimitTracker.set(provider, {
        requests: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
    } else {
      tracker.requests++;
    }
  }

  /**
   * Gets the next available provider that isn't rate limited
   */
  getAvailableProvider(
    preferredProvider: string,
    fallbackProviders: string[],
  ): string | null {
    if (!this.isRateLimited(preferredProvider)) {
      return preferredProvider;
    }

    for (const provider of fallbackProviders) {
      if (!this.isRateLimited(provider)) {
        return provider;
      }
    }

    return null; // All providers are rate limited
  }

  /**
   * Estimates wait time until provider is available
   */
  getWaitTime(provider: string): number {
    const tracker = this.rateLimitTracker.get(provider);
    if (!tracker) return 0;

    const now = Date.now();
    return Math.max(0, tracker.resetTime - now);
  }

  /**
   * Clears all caches (useful for memory management)
   */
  clearCaches(): void {
    this.requestCache.clear();
    this.rateLimitTracker.clear();
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): {
    cacheSize: number;
    hitRate: number;
    rateLimitedProviders: string[];
  } {
    const rateLimitedProviders: string[] = [];
    const now = Date.now();

    for (const [provider, tracker] of this.rateLimitTracker.entries()) {
      if (now <= tracker.resetTime) {
        rateLimitedProviders.push(provider);
      }
    }

    return {
      cacheSize: this.requestCache.size,
      hitRate: 0, // Would need to track hits/misses for this
      rateLimitedProviders,
    };
  }
}

/**
 * Content chunking for large resumes
 */
export class ContentChunker {
  private readonly MAX_CHUNK_SIZE = 8000; // Safe token limit
  private readonly OVERLAP_SIZE = 200; // Overlap between chunks

  /**
   * Splits large resume content into manageable chunks
   */
  chunkResumeContent(resumeData: ResumeData): Array<{
    section: keyof ResumeData;
    content: string;
    priority: number;
  }> {
    const chunks: Array<{
      section: keyof ResumeData;
      content: string;
      priority: number;
    }> = [];

    // Priority order for processing sections
    const sectionPriorities = {
      personal: 1,
      experience: 2,
      skills: 3,
      projects: 4,
      education: 5,
    };

    for (const [section, priority] of Object.entries(sectionPriorities)) {
      const sectionKey = section as keyof ResumeData;
      const content = this.serializeSection(resumeData[sectionKey]);

      if (content.length > this.MAX_CHUNK_SIZE) {
        // Split large sections
        const subChunks = this.splitLargeSection(content);
        subChunks.forEach((chunk: string, index: number) => {
          chunks.push({
            section: sectionKey,
            content: chunk,
            priority: priority + index * 0.1, // Maintain order
          });
        });
      } else {
        chunks.push({
          section: sectionKey,
          content,
          priority,
        });
      }
    }

    return chunks.sort((a, b) => a.priority - b.priority);
  }

  private compressLargeData(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object") return JSON.stringify(item);
          return String(item);
        })
        .join("\n");
    }

    if (typeof data === "object" && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    }

    return String(data);
  }

  /**
   * Serializes a resume section to string
   */
  private serializeSection(data: unknown): string {
    if (typeof data === "string") return data;
    if (Array.isArray(data)) {
      return data
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object") return JSON.stringify(item);
          return String(item);
        })
        .join("\n");
    }
    if (typeof data === "object" && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    }
    return String(data);
  }

  /**
   * Splits large content into smaller chunks
   */
  private splitLargeSection(content: string): string[] {
    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < content.length) {
      const chunkEnd = Math.min(
        currentIndex + this.MAX_CHUNK_SIZE,
        content.length,
      );
      let chunk = content.slice(currentIndex, chunkEnd);

      // Try to break at word boundaries
      if (chunkEnd < content.length) {
        const lastSpace = chunk.lastIndexOf(" ");
        if (lastSpace > this.MAX_CHUNK_SIZE * 0.8) {
          chunk = chunk.slice(0, lastSpace);
        }
      }

      chunks.push(chunk);
      currentIndex += chunk.length - this.OVERLAP_SIZE;
    }

    return chunks;
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static memoryUsage = 0;

  /**
   * Monitors memory usage and clears caches when needed
   */
  static checkMemoryUsage(): void {
    if (typeof window !== "undefined" && "performance" in window) {
      const memInfo = (
        performance as unknown as { memory?: { usedJSHeapSize: number } }
      ).memory;
      if (memInfo && memInfo.usedJSHeapSize > this.MAX_CACHE_SIZE) {
        this.clearCaches();
      }
    }
  }

  /**
   * Clears all performance-related caches
   */
  static clearCaches(): void {
    AIPerformanceOptimizer.getInstance().clearCaches();
  }

  /**
   * Clears old caches from local storage
   */
  static cleanupOldCaches(): void {
    if (typeof localStorage !== "undefined") {
      const keys = Object.keys(localStorage);
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

      keys.forEach((key: string) => {
        if (key.startsWith("ai_cache_")) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || "{}");
            if (item.timestamp && item.timestamp < dayAgo) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove invalid entries
            localStorage.removeItem(key);
          }
        }
      });
    }
  }

  /**
   * Estimates memory usage of an object
   */
  static estimateObjectSize(obj: unknown): number {
    function sizeOf(object: unknown): number {
      if (object === null || object === undefined) return 0;

      switch (typeof object) {
        case "number":
          return 8;
        case "string":
          return object.length * 2;
        case "boolean":
          return 4;
        case "object":
          if (Array.isArray(object)) {
            return object.reduce((acc, item) => acc + sizeOf(item), 0);
          }
          if (object !== null) {
            return Object.keys(object).reduce((acc, key) => {
              return (
                acc +
                sizeOf(key) +
                sizeOf((object as Record<string, unknown>)[key])
              );
            }, 0);
          }
          return 0;
        default:
          return 0;
      }
    }

    return sizeOf(obj);
  }
}

/**
 * Request batching for efficient API usage
 */
export class RequestBatcher {
  private static instance: RequestBatcher;
  private batchQueue: Array<{
    request: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }> = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100; // ms
  private readonly MAX_BATCH_SIZE = 5;

  static getInstance(): RequestBatcher {
    if (!this.instance) {
      this.instance = new RequestBatcher();
    }
    return this.instance;
  }

  /**
   * Adds a request to the batch queue
   */
  batchRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.batchQueue.push({
        request: request as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      if (this.batchQueue.length >= this.MAX_BATCH_SIZE) {
        this.processBatch();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(
          () => this.processBatch(),
          this.BATCH_DELAY,
        );
      }
    });
  }

  /**
   * Processes the current batch of requests
   */
  private async processBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];

    // Process all requests in parallel
    const results = await Promise.allSettled(
      currentBatch.map((item) => item.request()),
    );

    // Resolve/reject based on results
    results.forEach((result, index) => {
      const batchItem = currentBatch[index];
      if (result.status === "fulfilled") {
        batchItem.resolve(result.value);
      } else {
        batchItem.reject(result.reason);
      }
    });
  }
}

// Export singleton instances
export const performanceOptimizer = AIPerformanceOptimizer.getInstance();
export const contentChunker = new ContentChunker();
