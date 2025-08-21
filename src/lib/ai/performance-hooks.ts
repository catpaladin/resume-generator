import { useEffect, useCallback, useRef, useState } from "react";
import {
  performanceOptimizer,
  MemoryManager,
} from "./performance-optimizations";
import type { AIEnhancementResult } from "@/types/ai-enhancement";
import type { AISettings } from "@/types/resume";

/**
 * React hooks for AI performance optimization
 */

/**
 * Hook for caching AI enhancement results
 */
export function useAICache() {
  const [cacheStats, setCacheStats] = useState(
    performanceOptimizer.getCacheStats(),
  );

  const getCachedResult = useCallback(
    (
      resumeText: string,
      settings: AISettings,
      jobDescription?: string,
    ): AIEnhancementResult | null => {
      return performanceOptimizer.getCachedResult(
        resumeText,
        settings,
        jobDescription,
      );
    },
    [],
  );

  const cacheResult = useCallback(
    (
      resumeText: string,
      settings: AISettings,
      result: AIEnhancementResult,
      jobDescription?: string,
    ): void => {
      performanceOptimizer.cacheResult(
        resumeText,
        settings,
        result,
        jobDescription,
      );
      setCacheStats(performanceOptimizer.getCacheStats());
    },
    [],
  );

  const clearCache = useCallback(() => {
    performanceOptimizer.clearCaches();
    setCacheStats(performanceOptimizer.getCacheStats());
  }, []);

  const refreshStats = useCallback(() => {
    setCacheStats(performanceOptimizer.getCacheStats());
  }, []);

  return {
    getCachedResult,
    cacheResult,
    clearCache,
    cacheStats,
    refreshStats,
  };
}

/**
 * Hook for managing rate limits across AI providers
 */
export function useRateLimit() {
  const [rateLimitedProviders, setRateLimitedProviders] = useState<string[]>(
    [],
  );

  const checkRateLimit = useCallback((provider: string): boolean => {
    return performanceOptimizer.isRateLimited(provider);
  }, []);

  const recordRequest = useCallback((provider: string): void => {
    performanceOptimizer.recordRequest(provider);
    updateRateLimitStatus();
  }, []);

  const getAvailableProvider = useCallback(
    (preferredProvider: string, fallbackProviders: string[]): string | null => {
      return performanceOptimizer.getAvailableProvider(
        preferredProvider,
        fallbackProviders,
      );
    },
    [],
  );

  const getWaitTime = useCallback((provider: string): number => {
    return performanceOptimizer.getWaitTime(provider);
  }, []);

  const updateRateLimitStatus = useCallback(() => {
    const stats = performanceOptimizer.getCacheStats();
    setRateLimitedProviders(stats.rateLimitedProviders);
  }, []);

  useEffect(() => {
    // Update rate limit status periodically
    const interval = setInterval(updateRateLimitStatus, 5000);
    return () => clearInterval(interval);
  }, [updateRateLimitStatus]);

  return {
    checkRateLimit,
    recordRequest,
    getAvailableProvider,
    getWaitTime,
    rateLimitedProviders,
    updateRateLimitStatus,
  };
}

/**
 * Hook for debouncing AI enhancement requests
 */
export function useAIDebounce(delay: number = 500) {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const entries = performance.getEntriesByName("ai-enhancement");
  const performanceEntry = entries.find(
    (entry: PerformanceEntry) => entry.name === "ai-enhancement",
  );

  const debouncedExecute = useCallback(
    <T>(callback: () => Promise<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        setIsDebouncing(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await callback();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            setIsDebouncing(false);
          }
        }, delay);
      });
    },
    [delay],
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsDebouncing(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedExecute,
    cancel,
    isDebouncing,
  };
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitor() {
  const [memoryPressure, setMemoryPressure] = useState<
    "low" | "medium" | "high"
  >("low");
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkMemoryUsage = useCallback(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      const memoryStats = (navigator as unknown as { deviceMemory?: number })
        .deviceMemory;
      const memoryInfo = (
        performance as unknown as {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      if (memoryInfo) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = memoryInfo;
        const usageRatio = usedJSHeapSize / jsHeapSizeLimit;

        if (usageRatio > 0.8) {
          setMemoryPressure("high");
          MemoryManager.clearCaches();
        } else if (usageRatio > 0.6) {
          setMemoryPressure("medium");
        } else {
          setMemoryPressure("low");
        }
      }
    }
  }, []);

  const forceGarbageCollection = useCallback(() => {
    MemoryManager.clearCaches();

    // Force garbage collection if possible (requires flag in Chrome)
    if (
      typeof window !== "undefined" &&
      (window as unknown as { gc?: () => void }).gc
    ) {
      (window as unknown as { gc: () => void }).gc();
    }
  }, []);

  useEffect(() => {
    checkMemoryUsage();

    // Check memory usage every 30 seconds
    checkIntervalRef.current = setInterval(checkMemoryUsage, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkMemoryUsage]);

  return {
    memoryPressure,
    checkMemoryUsage,
    forceGarbageCollection,
  };
}

/**
 * Hook for network monitoring
 */
export const useNetworkMonitoring = (): {
  isOnline: boolean;
  connectionType: string;
} => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState("");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const connection = (
      navigator as unknown as { connection?: { effectiveType: string } }
    ).connection;
    if (connection) {
      setConnectionType(connection.effectiveType);
    }
  }, []);

  return { isOnline, connectionType };
};

/**
 * Hook for optimized AI enhancement requests
 */
export function useOptimizedAIEnhancement() {
  const { getCachedResult, cacheResult } = useAICache();
  const { getAvailableProvider, recordRequest } = useRateLimit();
  const { debouncedExecute, isDebouncing } = useAIDebounce(1000);
  const { memoryPressure } = useMemoryMonitor();

  const enhanceWithOptimizations = useCallback(
    async (
      enhanceFunction: (provider: string) => Promise<AIEnhancementResult>,
      resumeText: string,
      settings: AISettings,
      fallbackProviders: string[] = [],
    ): Promise<AIEnhancementResult> => {
      // Check cache first
      const cachedResult = getCachedResult(resumeText, settings);
      if (cachedResult) {
        return cachedResult;
      }

      // Get available provider
      const defaultFallbacks = ["openai", "anthropic", "gemini"].filter(
        (p) => p !== settings.provider,
      );
      const availableProvider = getAvailableProvider(
        settings.provider,
        fallbackProviders.length > 0 ? fallbackProviders : defaultFallbacks,
      );

      if (!availableProvider) {
        throw new Error(
          "All AI providers are currently rate limited. Please try again later.",
        );
      }

      // Execute with debouncing
      const result = await debouncedExecute(async () => {
        recordRequest(availableProvider);
        return await enhanceFunction(availableProvider);
      });

      // Cache the result (unless memory pressure is high)
      if (memoryPressure !== "high") {
        cacheResult(resumeText, settings, result);
      }

      return result;
    },
    [
      getCachedResult,
      cacheResult,
      getAvailableProvider,
      recordRequest,
      debouncedExecute,
      memoryPressure,
    ],
  );

  return {
    enhanceWithOptimizations,
    isDebouncing,
    memoryPressure,
  };
}

/**
 * Hook for tracking AI performance metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    requestCount: 0,
    cacheHits: 0,
    avgResponseTime: 0,
    errorRate: 0,
  });

  const startTime = useRef<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const startRequest = useCallback(() => {
    startTime.current = performance.now();
    setMetrics((prev) => ({ ...prev, requestCount: prev.requestCount + 1 }));
  }, []);

  const endRequest = useCallback((success: boolean, fromCache = false) => {
    const duration = performance.now() - startTime.current;
    const networkInfo = (
      navigator as unknown as {
        connection?: { effectiveType: string; downlink: number };
        mozConnection?: unknown;
        webkitConnection?: unknown;
      }
    ).connection;

    setMetrics((prev) => ({
      ...prev,
      cacheHits: fromCache ? prev.cacheHits + 1 : prev.cacheHits,
      avgResponseTime:
        (prev.avgResponseTime * (prev.requestCount - 1) + duration) /
        prev.requestCount,
      errorRate: success
        ? prev.errorRate
        : (prev.errorRate * (prev.requestCount - 1) + 1) / prev.requestCount,
    }));
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      requestCount: 0,
      cacheHits: 0,
      avgResponseTime: 0,
      errorRate: 0,
    });
  }, []);

  return {
    metrics,
    startRequest,
    endRequest,
    resetMetrics,
  };
}

/**
 * Hook for progressive enhancement loading
 */
export function useProgressiveLoading() {
  const [stage, setStage] = useState<
    "idle" | "parsing" | "analyzing" | "enhancing" | "complete"
  >("idle");
  const [progress, setProgress] = useState(0);

  const updateStage = useCallback(
    (newStage: typeof stage, progressValue?: number) => {
      setStage(newStage);
      if (progressValue !== undefined) {
        setProgress(progressValue);
      } else {
        // Auto-calculate progress based on stage
        const stageProgress = {
          idle: 0,
          parsing: 25,
          analyzing: 50,
          enhancing: 75,
          complete: 100,
        };
        setProgress(stageProgress[newStage]);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStage("idle");
    setProgress(0);
  }, []);

  return {
    stage,
    progress,
    updateStage,
    reset,
  };
}
