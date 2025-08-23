import type { ResumeData, AISettings } from "@/types/resume";
import type {
  AIEnhancementResult,
  AIEnhancementOptions,
} from "@/types/ai-enhancement";
import {
  ImportManager,
  type ImportResult,
  type ImportOptions,
} from "./import-manager";
import { enhanceResumeWithAI } from "../ai/ai-service";

export interface AIImportProgress {
  stage:
    | "reading"
    | "parsing"
    | "validating"
    | "ai_enhancing"
    | "complete"
    | "error";
  progress: number; // 0-100
  message: string;
}

export interface AIImportOptions extends ImportOptions {
  enableAI?: boolean;
  aiSettings?: AISettings;
  aiOptions?: Partial<AIEnhancementOptions>;
  onAIProgress?: (progress: AIImportProgress) => void;
}

export interface AIImportResult extends ImportResult {
  aiEnhancement?: AIEnhancementResult;
  aiUsed?: boolean;
  totalProcessingTime?: number;
  aiEnhancementAvailable?: boolean;
}

export class AIEnhancedImportManager extends ImportManager {
  private aiOptions: AIImportOptions;

  constructor(options: AIImportOptions = {}) {
    super(options);
    this.aiOptions = {
      enableAI: false,
      ...options,
    };
  }

  async importFile(file: File): Promise<AIImportResult> {
    const startTime = Date.now();

    try {
      // Stage 1-4: Standard import process
      const baseResult = await super.importFile(file);

      if (!baseResult.success) {
        return baseResult;
      }

      // Check if AI enhancement is enabled and available
      if (!this.shouldEnhanceWithAI(baseResult)) {
        return {
          ...baseResult,
          aiUsed: false,
          totalProcessingTime: Date.now() - startTime,
          aiEnhancementAvailable: baseResult.aiEnhancementAvailable,
        };
      }

      // Stage 5: AI Enhancement
      this.reportAIProgress("ai_enhancing", 75, "Enhancing with AI...");

      try {
        const aiEnhancement = await this.enhanceWithAI(
          baseResult.originalContent!,
          baseResult.data!,
        );

        this.reportAIProgress("complete", 100, "AI enhancement completed!");

        return {
          ...baseResult,
          aiEnhancement,
          aiUsed: true,
          totalProcessingTime: Date.now() - startTime,
          data: aiEnhancement.enhancedData, // Use enhanced data as primary
          aiEnhancementAvailable: baseResult.aiEnhancementAvailable,
        };
      } catch (aiError) {
        console.warn(
          "AI enhancement failed, continuing with original data:",
          aiError,
        );

        // Return original result with AI error info
        return {
          ...baseResult,
          aiUsed: false,
          totalProcessingTime: Date.now() - startTime,
          aiEnhancementAvailable: baseResult.aiEnhancementAvailable,
          warnings: [
            ...(baseResult.warnings || []),
            `AI enhancement failed: ${aiError instanceof Error ? aiError.message : String(aiError)}`,
          ],
        };
      }
    } catch (error) {
      this.reportAIProgress("error", 0, "Import failed");
      throw error;
    }
  }

  /**
   * Enhance resume data using AI
   */
  private async enhanceWithAI(
    originalText: string,
    parsedData: ResumeData,
  ): Promise<AIEnhancementResult> {
    if (!this.aiOptions.aiSettings) {
      throw new Error("AI settings not provided");
    }

    const enhancementOptions: AIEnhancementOptions = {
      provider: this.aiOptions.aiSettings.provider,
      model:
        this.aiOptions.aiSettings.customModel ||
        this.aiOptions.aiSettings.model,
      enhancementLevel:
        this.aiOptions.aiSettings.enhancementLevel || "moderate",
      focusAreas: this.aiOptions.aiSettings.focusAreas || [],
      jobDescription: this.aiOptions.aiSettings.jobDescription,
      userInstructions: this.aiOptions.aiSettings.userInstructions,
      enableFallback: this.aiOptions.aiSettings.enableFallback ?? true,
      maxRetries: 3,
      ...this.aiOptions.aiOptions,
    };

    return enhanceResumeWithAI(enhancementOptions, originalText, parsedData);
  }

  /**
   * Determine if AI enhancement should be applied
   */
  private shouldEnhanceWithAI(importResult: ImportResult): boolean {
    return !!(
      this.aiOptions.enableAI &&
      this.aiOptions.aiSettings?.hasApiKey &&
      importResult.aiEnhancementAvailable &&
      importResult.originalContent &&
      importResult.data
    );
  }

  /**
   * Report AI-specific progress
   */
  private reportAIProgress(
    stage: AIImportProgress["stage"],
    progress: number,
    message: string,
  ): void {
    if (this.aiOptions.onAIProgress) {
      this.aiOptions.onAIProgress({
        stage,
        progress,
        message,
      });
    }

    // Also report to base progress callback
    if (this.aiOptions.onProgress) {
      this.aiOptions.onProgress({
        stage: stage === "ai_enhancing" ? "validating" : stage,
        progress,
        message,
      });
    }
  }

  /**
   * Update AI options
   */
  updateAIOptions(newOptions: Partial<AIImportOptions>): void {
    this.aiOptions = { ...this.aiOptions, ...newOptions };
    this.updateOptions(newOptions); // Update base options too
  }

  /**
   * Get current AI options
   */
  getAIOptions(): AIImportOptions {
    return { ...this.aiOptions };
  }
}

// Export helper functions
export async function importResumeFileWithAI(
  file: File,
  options: AIImportOptions,
): Promise<AIImportResult> {
  const manager = new AIEnhancedImportManager(options);
  return manager.importFile(file);
}

// Export default instance for simple usage
export const defaultAIImportManager = new AIEnhancedImportManager();
