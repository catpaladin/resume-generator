import type { AISettings } from "@/types/resume";
import type { AIProviderConfig, AIError } from "@/types/ai-enhancement";
import { aiService } from "./ai-service";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  provider: string;
  model?: string;
  responseTime: number;
  error?: AIError;
  metadata?: {
    tokensUsed?: number;
    cost?: number;
    apiVersion?: string;
  };
}

/**
 * Validates AI settings configuration
 */
export function validateAISettings(settings: AISettings): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Provider validation
  if (!settings.provider) {
    errors.push({
      field: "provider",
      message: "AI provider is required",
      code: "PROVIDER_REQUIRED",
      severity: "error",
    });
  } else if (!["openai", "anthropic", "gemini"].includes(settings.provider)) {
    errors.push({
      field: "provider",
      message: "Invalid AI provider. Must be openai, anthropic, or gemini",
      code: "PROVIDER_INVALID",
      severity: "error",
    });
  }

  // API key validation
  if (!settings.hasApiKey) {
    errors.push({
      field: "apiKey",
      message: "API key is required for AI enhancement",
      code: "API_KEY_REQUIRED",
      severity: "error",
    });
  }

  // Model validation
  if (settings.customModel && settings.customModel.trim()) {
    // Validate custom model format
    if (settings.customModel.length < 3 || settings.customModel.length > 50) {
      errors.push({
        field: "customModel",
        message: "Custom model name must be between 3 and 50 characters",
        code: "MODEL_NAME_INVALID",
        severity: "error",
      });
    }

    // Check for suspicious model names
    const suspiciousPatterns = [
      /[<>{}[\]]/, // HTML/XML brackets
      /javascript:/i, // Script injection
      /data:/i, // Data URLs
    ];

    if (
      suspiciousPatterns.some((pattern) => pattern.test(settings.customModel!))
    ) {
      errors.push({
        field: "customModel",
        message: "Model name contains invalid characters",
        code: "MODEL_NAME_SUSPICIOUS",
        severity: "error",
      });
    }
  }

  // Enhancement level validation
  if (
    settings.enhancementLevel &&
    !["light", "moderate", "comprehensive"].includes(settings.enhancementLevel)
  ) {
    errors.push({
      field: "enhancementLevel",
      message: "Invalid enhancement level",
      code: "ENHANCEMENT_LEVEL_INVALID",
      severity: "error",
    });
  }

  // Job description validation
  if (settings.jobDescription && settings.jobDescription.length > 10000) {
    warnings.push({
      field: "jobDescription",
      message: "Job description is very long and may increase processing time",
      code: "JOB_DESCRIPTION_LONG",
      suggestion: "Consider summarizing the key requirements",
    });
  }

  // User instructions validation
  if (settings.userInstructions) {
    if (settings.userInstructions.length > 500) {
      errors.push({
        field: "userInstructions",
        message: "User instructions must be under 500 characters",
        code: "USER_INSTRUCTIONS_TOO_LONG",
        severity: "error",
      });
    }

    // Check for potentially harmful instructions
    const harmfulPatterns = [
      /ignore.{0,10}(previous|above|system)/i,
      /forget.{0,10}(instructions|rules)/i,
      /act.{0,10}as.{0,10}(admin|root|developer)/i,
      /pretend.{0,10}(you|to).{0,10}(are|be)/i,
    ];

    if (
      harmfulPatterns.some((pattern) =>
        pattern.test(settings.userInstructions!),
      )
    ) {
      warnings.push({
        field: "userInstructions",
        message: "Instructions may conflict with AI safety guidelines",
        code: "USER_INSTRUCTIONS_SUSPICIOUS",
        suggestion: "Focus on resume-specific enhancement preferences",
      });
    }
  }

  // Focus areas validation
  if (settings.focusAreas && settings.focusAreas.length > 3) {
    warnings.push({
      field: "focusAreas",
      message: "Too many focus areas may dilute enhancement quality",
      code: "FOCUS_AREAS_TOO_MANY",
      suggestion: "Select 1-2 most important focus areas",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Tests connection to AI provider
 */
export async function testAIProviderConnection(
  settings: AISettings,
  apiKey: string,
): Promise<ConnectionTestResult> {
  const startTime = Date.now();

  try {
    // Configure the provider
    const config: AIProviderConfig = {
      name: settings.provider,
      apiKey,
      model: settings.customModel || settings.model,
      maxRetries: 1,
      timeout: 10000, // 10 second timeout for tests
    };

    await aiService.configureProvider(settings);

    // Test connection with a simple request
    const testResult = await aiService.testConnection();
    const responseTime = Date.now() - startTime;

    if (testResult) {
      return {
        success: true,
        provider: settings.provider,
        model: settings.customModel || settings.model,
        responseTime,
        metadata: {
          apiVersion: "latest", // Would be returned by actual API
        },
      };
    } else {
      return {
        success: false,
        provider: settings.provider,
        responseTime,
        error: {
          type: "network_error",
          message: "Connection test failed - no response received",
          provider: settings.provider,
          suggestion: "Check your API key and network connection",
        },
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      success: false,
      provider: settings.provider,
      responseTime,
      error: {
        type: "api_key_invalid",
        message:
          error instanceof Error ? error.message : "Connection test failed",
        provider: settings.provider,
        suggestion:
          "Verify your API key is correct and has necessary permissions",
      },
    };
  }
}

/**
 * Validates and sanitizes user instructions
 */
export function sanitizeUserInstructions(instructions: string): string {
  if (!instructions) return "";

  // Remove potentially harmful patterns
  let sanitized = instructions
    .replace(/ignore.{0,10}(previous|above|system)/gi, "[filtered]")
    .replace(/forget.{0,10}(instructions|rules)/gi, "[filtered]")
    .replace(/act.{0,10}as.{0,10}(admin|root|developer)/gi, "[filtered]")
    .replace(/pretend.{0,10}(you|to).{0,10}(are|be)/gi, "[filtered]");

  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 497) + "...";
  }

  // Ensure it's resume-focused
  if (
    sanitized &&
    !sanitized.toLowerCase().includes("resume") &&
    !sanitized.toLowerCase().includes("achievement") &&
    !sanitized.toLowerCase().includes("bullet") &&
    !sanitized.toLowerCase().includes("experience")
  ) {
    sanitized = `Resume enhancement: ${sanitized}`;
  }

  return sanitized.trim();
}

/**
 * Estimates processing cost for given settings and content
 */
export async function estimateProcessingCost(
  settings: AISettings,
  contentLength: number,
): Promise<{
  estimatedCost: number;
  tokenEstimate: number;
  provider: string;
  confidence: number;
}> {
  // Rough token estimation (4 characters ≈ 1 token)
  const inputTokens = Math.ceil(contentLength / 4);
  const outputTokens = Math.ceil(inputTokens * 0.3); // Assume 30% output size

  // Cost estimates (as of 2024, subject to change)
  const costPerProvider: Record<string, { input: number; output: number }> = {
    openai: { input: 0.15 / 1000000, output: 0.6 / 1000000 }, // GPT-4o-mini
    anthropic: { input: 3 / 1000000, output: 15 / 1000000 }, // Claude 3.5 Sonnet
    gemini: { input: 1.25 / 1000000, output: 5 / 1000000 }, // Gemini 1.5 Pro
  };

  const providerCosts =
    costPerProvider[settings.provider] || costPerProvider.openai;
  const estimatedCost =
    inputTokens * providerCosts.input + outputTokens * providerCosts.output;

  // Adjust for enhancement level
  const levelMultiplier = {
    light: 0.7,
    moderate: 1.0,
    comprehensive: 1.5,
  }[settings.enhancementLevel || "moderate"];

  return {
    estimatedCost: estimatedCost * levelMultiplier,
    tokenEstimate: inputTokens + outputTokens,
    provider: settings.provider,
    confidence: 0.8, // Estimation confidence
  };
}

/**
 * Validates job description content
 */
export function validateJobDescription(
  jobDescription: string,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!jobDescription.trim()) {
    return { isValid: true, errors, warnings };
  }

  // Length validation
  if (jobDescription.length < 50) {
    warnings.push({
      field: "jobDescription",
      message: "Job description is quite short",
      code: "JOB_DESCRIPTION_SHORT",
      suggestion:
        "Include more details about requirements and responsibilities for better targeting",
    });
  }

  if (jobDescription.length > 10000) {
    warnings.push({
      field: "jobDescription",
      message: "Job description is very long",
      code: "JOB_DESCRIPTION_LONG",
      suggestion: "Consider focusing on the most relevant requirements",
    });
  }

  // Content quality checks
  const wordCount = jobDescription.split(/\s+/).length;
  if (wordCount < 20) {
    warnings.push({
      field: "jobDescription",
      message: "Job description lacks detail",
      code: "JOB_DESCRIPTION_SPARSE",
      suggestion: "Include key skills, responsibilities, and qualifications",
    });
  }

  // Check for common job posting elements
  const hasRequirements = /require|must|should|prefer|ideal/i.test(
    jobDescription,
  );
  const hasSkills = /skill|experience|knowledge|proficient|familiar/i.test(
    jobDescription,
  );
  const hasResponsibilities =
    /responsible|manage|develop|lead|work|collaborate/i.test(jobDescription);

  if (!hasRequirements && !hasSkills && !hasResponsibilities) {
    warnings.push({
      field: "jobDescription",
      message: "Job description may not contain typical job posting elements",
      code: "JOB_DESCRIPTION_ATYPICAL",
      suggestion: "Ensure this is a genuine job posting for best results",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Comprehensive settings validation with recommendations
 */
export async function validateAndOptimizeSettings(
  settings: AISettings,
  apiKey?: string,
): Promise<{
  validation: ValidationResult;
  connectionTest?: ConnectionTestResult;
  optimization: {
    recommended: Partial<AISettings>;
    reasoning: string[];
  };
}> {
  const validation = validateAISettings(settings);
  let connectionTest: ConnectionTestResult | undefined;

  // Test connection if API key is provided and settings are valid
  if (apiKey && validation.isValid) {
    try {
      connectionTest = await testAIProviderConnection(settings, apiKey);
    } catch (error) {
      // Connection test failed, but we'll still provide validation results
    }
  }

  // Generate optimization recommendations
  const recommended: Partial<AISettings> = {};
  const reasoning: string[] = [];

  // Recommend enhancement level based on user's focus
  if (!settings.enhancementLevel) {
    recommended.enhancementLevel = "moderate";
    reasoning.push(
      "Moderate enhancement level provides the best balance of quality and processing time",
    );
  }

  // Recommend enabling fallback for reliability
  if (settings.enableFallback === false) {
    recommended.enableFallback = true;
    reasoning.push(
      "Enabling fallback providers improves reliability and reduces failure rates",
    );
  }

  // Suggest focus areas if job description is provided but no focus areas
  if (
    settings.jobDescription &&
    (!settings.focusAreas || settings.focusAreas.length === 0)
  ) {
    const jobDesc = settings.jobDescription.toLowerCase();
    if (
      jobDesc.includes("technical") ||
      jobDesc.includes("engineer") ||
      jobDesc.includes("developer")
    ) {
      recommended.focusAreas = ["technical"];
      reasoning.push(
        "Technical focus area recommended based on job description content",
      );
    } else if (
      jobDesc.includes("management") ||
      jobDesc.includes("lead") ||
      jobDesc.includes("manager")
    ) {
      recommended.focusAreas = ["leadership"];
      reasoning.push(
        "Leadership focus area recommended based on job description content",
      );
    }
  }

  return {
    validation,
    connectionTest,
    optimization: {
      recommended,
      reasoning,
    },
  };
}
