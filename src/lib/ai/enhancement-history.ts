import type { AIEnhancementResult, AISuggestion } from "@/types/ai-enhancement";
import type { AISettings, ResumeData } from "@/types/resume";

export interface EnhancementHistoryEntry {
  id: string;
  timestamp: Date;
  originalData: ResumeData;
  enhancedData: ResumeData;
  aiResult: AIEnhancementResult;
  settings: AISettings;
  userActions: {
    acceptedSuggestions: string[];
    rejectedSuggestions: string[];
    manualEdits: Array<{
      field: string;
      section: keyof ResumeData;
      originalValue: string;
      newValue: string;
      timestamp: Date;
    }>;
  };
  metadata: {
    fileInfo?: {
      name: string;
      size: number;
      type: string;
    };
    processingTime: number;
    confidence: number;
    costEstimate: number;
    version: string;
  };
  tags: string[];
  notes: string;
}

export interface HistoryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  providers?: string[];
  enhancementLevels?: string[];
  tags?: string[];
  minConfidence?: number;
  hasJobDescription?: boolean;
}

export interface HistoryStats {
  totalEnhancements: number;
  averageConfidence: number;
  totalCost: number;
  mostUsedProvider: string;
  mostUsedLevel: string;
  topTags: Array<{ tag: string; count: number }>;
  improvementTrends: {
    confidenceOverTime: Array<{ date: Date; confidence: number }>;
    acceptanceRateOverTime: Array<{ date: Date; rate: number }>;
  };
}

class EnhancementHistoryManager {
  private storageKey = "ai-enhancement-history";
  private maxEntries = 500; // Limit storage size
  private entries: EnhancementHistoryEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Adds a new enhancement to history
   */
  addEnhancement(
    originalData: ResumeData,
    enhancedData: ResumeData,
    aiResult: AIEnhancementResult,
    settings: AISettings,
    metadata: {
      fileInfo?: EnhancementHistoryEntry["metadata"]["fileInfo"];
      processingTime: number;
      costEstimate: number;
    },
  ): EnhancementHistoryEntry {
    const entry: EnhancementHistoryEntry = {
      id: `enhancement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      originalData,
      enhancedData,
      aiResult,
      settings,
      userActions: {
        acceptedSuggestions: [],
        rejectedSuggestions: [],
        manualEdits: [],
      },
      metadata: {
        ...metadata,
        confidence: this.calculateOverallConfidence(aiResult.suggestions),
        version: "1.0",
      },
      tags: this.generateAutoTags(settings, aiResult),
      notes: "",
    };

    this.entries.unshift(entry);

    // Keep only the most recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }

    this.saveToStorage();
    return entry;
  }

  /**
   * Updates user actions for an enhancement
   */
  updateUserActions(
    entryId: string,
    actions: Partial<EnhancementHistoryEntry["userActions"]>,
  ): void {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry) {
      entry.userActions = { ...entry.userActions, ...actions };
      this.saveToStorage();
    }
  }

  /**
   * Records a user's suggestion acceptance/rejection
   */
  recordSuggestionAction(
    entryId: string,
    suggestionId: string,
    action: "accepted" | "rejected",
  ): void {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry) {
      if (action === "accepted") {
        entry.userActions.acceptedSuggestions.push(suggestionId);
        entry.userActions.rejectedSuggestions =
          entry.userActions.rejectedSuggestions.filter(
            (id) => id !== suggestionId,
          );
      } else {
        entry.userActions.rejectedSuggestions.push(suggestionId);
        entry.userActions.acceptedSuggestions =
          entry.userActions.acceptedSuggestions.filter(
            (id) => id !== suggestionId,
          );
      }
      this.saveToStorage();
    }
  }

  /**
   * Records a manual edit by the user
   */
  recordManualEdit(
    entryId: string,
    field: string,
    section: keyof ResumeData,
    originalValue: string,
    newValue: string,
  ): void {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry) {
      entry.userActions.manualEdits.push({
        field,
        section,
        originalValue,
        newValue,
        timestamp: new Date(),
      });
      this.saveToStorage();
    }
  }

  /**
   * Updates entry tags and notes
   */
  updateMetadata(
    entryId: string,
    updates: { tags?: string[]; notes?: string },
  ): void {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry) {
      if (updates.tags) entry.tags = updates.tags;
      if (updates.notes !== undefined) entry.notes = updates.notes;
      this.saveToStorage();
    }
  }

  /**
   * Gets filtered history entries
   */
  getHistory(
    filters?: HistoryFilters,
    limit?: number,
  ): EnhancementHistoryEntry[] {
    let filtered = [...this.entries];

    if (filters) {
      if (filters.dateRange) {
        filtered = filtered.filter(
          (entry) =>
            entry.timestamp >= filters.dateRange!.start &&
            entry.timestamp <= filters.dateRange!.end,
        );
      }

      if (filters.providers?.length) {
        filtered = filtered.filter((entry) =>
          filters.providers!.includes(entry.settings.provider),
        );
      }

      if (filters.enhancementLevels?.length) {
        filtered = filtered.filter((entry) =>
          filters.enhancementLevels!.includes(
            entry.settings.enhancementLevel || "moderate",
          ),
        );
      }

      if (filters.tags?.length) {
        filtered = filtered.filter((entry) =>
          filters.tags!.some((tag) => entry.tags.includes(tag)),
        );
      }

      if (filters.minConfidence !== undefined) {
        filtered = filtered.filter(
          (entry) => entry.metadata.confidence >= filters.minConfidence!,
        );
      }

      if (filters.hasJobDescription !== undefined) {
        filtered = filtered.filter(
          (entry) =>
            Boolean(entry.settings.jobDescription) ===
            filters.hasJobDescription,
        );
      }
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }

  /**
   * Gets a specific enhancement by ID
   */
  getEnhancement(id: string): EnhancementHistoryEntry | undefined {
    return this.entries.find((entry) => entry.id === id);
  }

  /**
   * Gets history statistics
   */
  getStats(filters?: HistoryFilters): HistoryStats {
    const entries = this.getHistory(filters);

    if (entries.length === 0) {
      return {
        totalEnhancements: 0,
        averageConfidence: 0,
        totalCost: 0,
        mostUsedProvider: "",
        mostUsedLevel: "",
        topTags: [],
        improvementTrends: {
          confidenceOverTime: [],
          acceptanceRateOverTime: [],
        },
      };
    }

    const totalCost = entries.reduce(
      (sum, e) => sum + e.metadata.costEstimate,
      0,
    );
    const averageConfidence =
      entries.reduce((sum, e) => sum + e.metadata.confidence, 0) /
      entries.length;

    // Provider usage
    const providerCounts = entries.reduce(
      (counts, entry) => {
        counts[entry.settings.provider] =
          (counts[entry.settings.provider] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );
    const mostUsedProvider =
      Object.entries(providerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "";

    // Enhancement level usage
    const levelCounts = entries.reduce(
      (counts, entry) => {
        const level = entry.settings.enhancementLevel || "moderate";
        counts[level] = (counts[level] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );
    const mostUsedLevel =
      Object.entries(levelCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "";

    // Tag frequency
    const tagCounts = entries.reduce(
      (counts, entry) => {
        entry.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
        return counts;
      },
      {} as Record<string, number>,
    );
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Trends (simplified - group by week)
    const confidenceOverTime = this.calculateTrends(entries, "confidence");
    const acceptanceRateOverTime = this.calculateTrends(
      entries,
      "acceptanceRate",
    );

    return {
      totalEnhancements: entries.length,
      averageConfidence,
      totalCost,
      mostUsedProvider,
      mostUsedLevel,
      topTags,
      improvementTrends: {
        confidenceOverTime,
        acceptanceRateOverTime,
      },
    };
  }

  /**
   * Compares two enhancements
   */
  compareEnhancements(
    id1: string,
    id2: string,
  ): {
    entry1: EnhancementHistoryEntry;
    entry2: EnhancementHistoryEntry;
    comparison: {
      confidenceDiff: number;
      costDiff: number;
      suggestionCountDiff: number;
      acceptanceRateDiff: number;
      processingTimeDiff: number;
    };
  } | null {
    const entry1 = this.getEnhancement(id1);
    const entry2 = this.getEnhancement(id2);

    if (!entry1 || !entry2) return null;

    const getAcceptanceRate = (entry: EnhancementHistoryEntry) => {
      const total = entry.aiResult.suggestions.length;
      const accepted = entry.userActions.acceptedSuggestions.length;
      return total > 0 ? accepted / total : 0;
    };

    return {
      entry1,
      entry2,
      comparison: {
        confidenceDiff: entry2.metadata.confidence - entry1.metadata.confidence,
        costDiff: entry2.metadata.costEstimate - entry1.metadata.costEstimate,
        suggestionCountDiff:
          entry2.aiResult.suggestions.length -
          entry1.aiResult.suggestions.length,
        acceptanceRateDiff:
          getAcceptanceRate(entry2) - getAcceptanceRate(entry1),
        processingTimeDiff:
          entry2.metadata.processingTime - entry1.metadata.processingTime,
      },
    };
  }

  /**
   * Exports history data
   */
  exportHistory(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = [
        "timestamp",
        "provider",
        "enhancementLevel",
        "confidence",
        "costEstimate",
        "processingTime",
        "suggestionsCount",
        "acceptedCount",
        "rejectedCount",
        "tags",
        "hasJobDescription",
      ];

      const rows = this.entries.map((entry) => [
        entry.timestamp.toISOString(),
        entry.settings.provider,
        entry.settings.enhancementLevel || "moderate",
        entry.metadata.confidence,
        entry.metadata.costEstimate,
        entry.metadata.processingTime,
        entry.aiResult.suggestions.length,
        entry.userActions.acceptedSuggestions.length,
        entry.userActions.rejectedSuggestions.length,
        entry.tags.join(";"),
        Boolean(entry.settings.jobDescription),
      ]);

      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Deletes an enhancement from history
   */
  deleteEnhancement(id: string): boolean {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Clears old history entries
   */
  clearOldEntries(daysToKeep: number = 180): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    this.entries = this.entries.filter(
      (entry) => entry.timestamp >= cutoffDate,
    );
    this.saveToStorage();
  }

  private calculateOverallConfidence(suggestions: AISuggestion[]): number {
    if (suggestions.length === 0) return 0;
    return (
      suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
    );
  }

  private generateAutoTags(
    settings: AISettings,
    result: AIEnhancementResult,
  ): string[] {
    const tags: string[] = [];

    // Add provider tag
    tags.push(settings.provider);

    // Add enhancement level tag
    if (settings.enhancementLevel) {
      tags.push(settings.enhancementLevel);
    }

    // Add focus area tags
    if (settings.focusAreas?.length) {
      tags.push(...settings.focusAreas);
    }

    // Add job-targeted tag
    if (settings.jobDescription) {
      tags.push("job-targeted");
    }

    // Add confidence-based tags
    const confidence = this.calculateOverallConfidence(result.suggestions);
    if (confidence >= 0.9) tags.push("high-confidence");
    else if (confidence >= 0.7) tags.push("medium-confidence");
    else tags.push("low-confidence");

    // Add suggestion count tags
    const suggestionCount = result.suggestions.length;
    if (suggestionCount >= 15) tags.push("many-suggestions");
    else if (suggestionCount >= 8) tags.push("moderate-suggestions");
    else if (suggestionCount > 0) tags.push("few-suggestions");
    else tags.push("no-suggestions");

    return tags;
  }

  private calculateTrends(
    entries: EnhancementHistoryEntry[],
    metric: "confidence",
  ): Array<{ date: Date; confidence: number }>;
  private calculateTrends(
    entries: EnhancementHistoryEntry[],
    metric: "acceptanceRate",
  ): Array<{ date: Date; rate: number }>;
  private calculateTrends(
    entries: EnhancementHistoryEntry[],
    metric: "confidence" | "acceptanceRate",
  ): Array<{ date: Date; confidence?: number; rate?: number }> {
    // Group entries by week
    const weeklyData = entries.reduce(
      (groups, entry) => {
        const weekStart = new Date(entry.timestamp);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const key = weekStart.toISOString();

        if (!groups[key]) {
          groups[key] = { date: weekStart, entries: [] };
        }
        groups[key].entries.push(entry);
        return groups;
      },
      {} as Record<string, { date: Date; entries: EnhancementHistoryEntry[] }>,
    );

    return Object.values(weeklyData)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, entries: weekEntries }) => {
        if (metric === "confidence") {
          const avgConfidence =
            weekEntries.reduce((sum, e) => sum + e.metadata.confidence, 0) /
            weekEntries.length;
          return { date, confidence: avgConfidence };
        } else {
          const totalSuggestions = weekEntries.reduce(
            (sum, e) => sum + e.aiResult.suggestions.length,
            0,
          );
          const totalAccepted = weekEntries.reduce(
            (sum, e) => sum + e.userActions.acceptedSuggestions.length,
            0,
          );
          const rate =
            totalSuggestions > 0 ? totalAccepted / totalSuggestions : 0;
          return { date, rate };
        }
      });
  }

  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        this.entries = [];
        return;
      }

      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.entries = parsed.map(
          (entry: Partial<EnhancementHistoryEntry>) => ({
            ...entry,
            timestamp: new Date(entry.timestamp!),
            userActions: {
              ...entry.userActions!,
              manualEdits:
                entry.userActions!.manualEdits?.map(
                  (
                    edit: Partial<
                      EnhancementHistoryEntry["userActions"]["manualEdits"][0]
                    >,
                  ) => ({
                    ...edit,
                    timestamp: new Date(edit.timestamp!),
                  }),
                ) || [],
            },
          }),
        );
      }
    } catch (error) {
      console.error("Failed to load enhancement history:", error);
      this.entries = [];
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

      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (error) {
      console.error("Failed to save enhancement history:", error);
    }
  }
}

// Export singleton instance
export const enhancementHistory = new EnhancementHistoryManager();
