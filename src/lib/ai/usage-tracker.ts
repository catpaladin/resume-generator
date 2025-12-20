import type {
  AIEnhancementResult,
  AIProviderConfig,
} from "@/types/ai-enhancement";
import type { AISettings } from "@/types/resume";

export interface UsageEvent {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  operation: "enhancement" | "test_connection" | "cost_estimation";
  tokensUsed: number;
  estimatedCost: number;
  processingTime: number;
  success: boolean;
  errorType?: string;
  enhancementLevel?: string;
  suggestionsCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
  confidence?: number;
  contentLength?: number;
  hasJobDescription?: boolean;
  focusAreas?: string[];
}

export interface UsageStats {
  totalEvents: number;
  totalTokens: number;
  totalCost: number;
  totalProcessingTime: number;
  successRate: number;
  avgConfidence: number;
  avgProcessingTime: number;
  providerUsage: Record<string, number>;
  operationCounts: Record<string, number>;
  enhancementLevelUsage: Record<string, number>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface CostMonitoring {
  dailyLimit?: number;
  monthlyLimit?: number;
  alertThresholds: {
    daily?: number;
    monthly?: number;
  };
  currentSpending: {
    today: number;
    thisMonth: number;
  };
  projectedSpending: {
    daily: number;
    monthly: number;
  };
}

class AIUsageTracker {
  private storageKey = "ai-usage-history";
  private costMonitoringKey = "ai-cost-monitoring";
  private events: UsageEvent[] = [];
  private costSettings: CostMonitoring;

  constructor() {
    this.loadFromStorage();
    this.costSettings = this.loadCostSettings();
  }

  /**
   * Records a new usage event
   */
  recordEvent(event: Omit<UsageEvent, "id" | "timestamp">): UsageEvent {
    const fullEvent: UsageEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.events.unshift(fullEvent);

    // Keep only last 1000 events to prevent storage bloat
    if (this.events.length > 1000) {
      this.events = this.events.slice(0, 1000);
    }

    this.saveToStorage();
    this.checkCostAlerts(fullEvent);

    return fullEvent;
  }

  /**
   * Records an AI enhancement operation
   */
  recordEnhancement(
    result: AIEnhancementResult,
    settings: AISettings,
    processingTime: number,
    contentLength: number,
  ): UsageEvent {
    const suggestionsCount = result.suggestions.length;
    const acceptedCount = result.suggestions.filter((s) => s.accepted).length;
    const rejectedCount = suggestionsCount - acceptedCount;
    const avgConfidence =
      suggestionsCount > 0
        ? result.suggestions.reduce((sum, s) => sum + s.confidence, 0) /
          suggestionsCount
        : 0;

    return this.recordEvent({
      provider: result.provider || settings.provider,
      model: result.model || settings.model || "default",
      operation: "enhancement",
      tokensUsed: result.metadata?.tokensUsed || 0,
      estimatedCost: result.metadata?.cost || 0,
      processingTime,
      success: result.success,
      errorType: result.error?.type,
      enhancementLevel: settings.enhancementLevel,
      suggestionsCount,
      acceptedCount,
      rejectedCount,
      confidence: avgConfidence,
      contentLength,
      hasJobDescription: Boolean(settings.jobDescription),
      focusAreas: settings.focusAreas,
    });
  }

  /**
   * Records a connection test
   */
  recordConnectionTest(
    provider: string,
    model: string,
    success: boolean,
    processingTime: number,
    errorType?: string,
  ): UsageEvent {
    return this.recordEvent({
      provider,
      model,
      operation: "test_connection",
      tokensUsed: 10, // Minimal tokens for test
      estimatedCost: 0.001,
      processingTime,
      success,
      errorType,
    });
  }

  /**
   * Gets usage statistics for a time period
   */
  getStats(days: number = 30): UsageStats {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const filteredEvents = this.events.filter(
      (event) => event.timestamp >= startDate && event.timestamp <= endDate,
    );

    if (filteredEvents.length === 0) {
      return {
        totalEvents: 0,
        totalTokens: 0,
        totalCost: 0,
        totalProcessingTime: 0,
        successRate: 0,
        avgConfidence: 0,
        avgProcessingTime: 0,
        providerUsage: {},
        operationCounts: {},
        enhancementLevelUsage: {},
        timeRange: { start: startDate, end: endDate },
      };
    }

    const totalTokens = filteredEvents.reduce(
      (sum, e) => sum + e.tokensUsed,
      0,
    );
    const totalCost = filteredEvents.reduce(
      (sum, e) => sum + e.estimatedCost,
      0,
    );
    const totalProcessingTime = filteredEvents.reduce(
      (sum, e) => sum + e.processingTime,
      0,
    );
    const successfulEvents = filteredEvents.filter((e) => e.success);
    const enhancementEvents = filteredEvents.filter(
      (e) => e.operation === "enhancement",
    );

    const avgConfidence =
      enhancementEvents.length > 0
        ? enhancementEvents.reduce((sum, e) => sum + (e.confidence || 0), 0) /
          enhancementEvents.length
        : 0;

    const providerUsage = filteredEvents.reduce(
      (stats, event) => {
        stats[event.provider] = (stats[event.provider] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    const operationCounts = filteredEvents.reduce(
      (stats, event) => {
        stats[event.operation] = (stats[event.operation] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    const enhancementLevelUsage = enhancementEvents.reduce(
      (stats, event) => {
        if (event.enhancementLevel) {
          stats[event.enhancementLevel] =
            (stats[event.enhancementLevel] || 0) + 1;
        }
        return stats;
      },
      {} as Record<string, number>,
    );

    return {
      totalEvents: filteredEvents.length,
      totalTokens,
      totalCost,
      totalProcessingTime,
      successRate: successfulEvents.length / filteredEvents.length,
      avgConfidence,
      avgProcessingTime: totalProcessingTime / filteredEvents.length,
      providerUsage,
      operationCounts,
      enhancementLevelUsage,
      timeRange: { start: startDate, end: endDate },
    };
  }

  /**
   * Gets recent events
   */
  getRecentEvents(limit: number = 50): UsageEvent[] {
    return this.events.slice(0, limit);
  }

  /**
   * Gets current cost monitoring status
   */
  getCostMonitoring(): CostMonitoring {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEvents = this.events.filter((e) => e.timestamp >= startOfDay);
    const monthEvents = this.events.filter((e) => e.timestamp >= startOfMonth);

    const todaySpending = todayEvents.reduce(
      (sum, e) => sum + e.estimatedCost,
      0,
    );
    const monthSpending = monthEvents.reduce(
      (sum, e) => sum + e.estimatedCost,
      0,
    );

    // Simple projection based on current usage
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    const dayOfMonth = today.getDate();
    const projectedMonthly = (monthSpending / dayOfMonth) * daysInMonth;

    return {
      ...this.costSettings,
      currentSpending: {
        today: todaySpending,
        thisMonth: monthSpending,
      },
      projectedSpending: {
        daily: todaySpending,
        monthly: projectedMonthly,
      },
    };
  }

  /**
   * Updates cost monitoring settings
   */
  setCostMonitoring(settings: Partial<CostMonitoring>): void {
    this.costSettings = { ...this.costSettings, ...settings };
    this.saveCostSettings();
  }

  /**
   * Checks if cost limits are being approached
   */
  private checkCostAlerts(event: UsageEvent): void {
    const monitoring = this.getCostMonitoring();

    // Check daily threshold
    if (
      monitoring.alertThresholds.daily &&
      monitoring.currentSpending.today >= monitoring.alertThresholds.daily
    ) {
      this.triggerCostAlert(
        "daily",
        monitoring.currentSpending.today,
        monitoring.alertThresholds.daily,
      );
    }

    // Check monthly threshold
    if (
      monitoring.alertThresholds.monthly &&
      monitoring.currentSpending.thisMonth >= monitoring.alertThresholds.monthly
    ) {
      this.triggerCostAlert(
        "monthly",
        monitoring.currentSpending.thisMonth,
        monitoring.alertThresholds.monthly,
      );
    }

    // Check if approaching limits
    if (
      monitoring.dailyLimit &&
      monitoring.currentSpending.today >= monitoring.dailyLimit * 0.8
    ) {
      this.triggerCostAlert(
        "daily_warning",
        monitoring.currentSpending.today,
        monitoring.dailyLimit,
      );
    }
  }

  /**
   * Triggers cost alert (can be extended to show notifications)
   */
  private triggerCostAlert(
    type: string,
    currentSpending: number,
    threshold: number,
  ): void {
    if (typeof window === "undefined") return;

    console.warn(`AI Usage Cost Alert: ${type}`, {
      currentSpending,
      threshold,
      percentage: (currentSpending / threshold) * 100,
    });

    // Emit custom event for UI components to listen to
    window.dispatchEvent(
      new CustomEvent("ai-cost-alert", {
        detail: { type, currentSpending, threshold },
      }),
    );
  }

  /**
   * Exports usage data for analysis
   */
  exportData(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = [
        "timestamp",
        "provider",
        "model",
        "operation",
        "tokensUsed",
        "estimatedCost",
        "processingTime",
        "success",
        "suggestionsCount",
        "acceptedCount",
        "confidence",
      ];

      const rows = this.events.map((event) => [
        event.timestamp.toISOString(),
        event.provider,
        event.model,
        event.operation,
        event.tokensUsed,
        event.estimatedCost,
        event.processingTime,
        event.success,
        event.suggestionsCount || "",
        event.acceptedCount || "",
        event.confidence || "",
      ]);

      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Clears old usage data
   */
  clearOldData(daysToKeep: number = 90): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    this.events = this.events.filter((event) => event.timestamp >= cutoffDate);
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        this.events = [];
        return;
      }

      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.events = parsed.map(
          (event: { timestamp: string; [key: string]: unknown }) => ({
            ...event,
            timestamp: new Date(event.timestamp),
          }),
        );
      }
    } catch (error) {
      console.error("Failed to load usage data from storage:", error);
      this.events = [];
    }
  }

  private saveToStorage(): void {
    try {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        return;
      }

      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      console.error("Failed to save usage data to storage:", error);
    }
  }

  private loadCostSettings(): CostMonitoring {
    try {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        return {
          alertThresholds: {},
          currentSpending: { today: 0, thisMonth: 0 },
          projectedSpending: { daily: 0, monthly: 0 },
        };
      }

      const stored = localStorage.getItem(this.costMonitoringKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load cost settings:", error);
    }

    return {
      alertThresholds: {},
      currentSpending: { today: 0, thisMonth: 0 },
      projectedSpending: { daily: 0, monthly: 0 },
    };
  }

  private saveCostSettings(): void {
    try {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        return;
      }

      localStorage.setItem(
        this.costMonitoringKey,
        JSON.stringify(this.costSettings),
      );
    } catch (error) {
      console.error("Failed to save cost settings:", error);
    }
  }
}

// Export singleton instance
export const usageTracker = new AIUsageTracker();
