import type { ResumeData } from "./resume";

export interface AISuggestion {
  id: string;
  field: string;
  section: keyof ResumeData;
  originalValue: string;
  suggestedValue: string;
  reasoning: string;
  confidence: number;
  accepted?: boolean;
  type: "improvement" | "addition" | "correction" | "enhancement";
}

export interface AIEnhancementResult {
  originalData: ResumeData;
  enhancedData: ResumeData;
  suggestions: AISuggestion[];
  confidence: number;
  processingTime: number;
  provider: string;
  model: string;
  timestamp: Date;
  success: boolean;
  error?: AIError;
  metadata?: {
    tokensUsed?: number;
    cost?: number;
    [key: string]: unknown;
  };
}

export interface AIEnhancementRequest {
  originalText: string;
  parsedData: ResumeData;
  jobDescription?: string;
  userInstructions?: string;
  focusAreas?: string[];
  enhancementLevel: "light" | "moderate" | "comprehensive";
}

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  model?: string;
  baseURL?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AIProvider {
  name: string;
  configure(config: AIProviderConfig): void;
  testConnection(): Promise<boolean>;
  enhanceResume(request: AIEnhancementRequest): Promise<AIEnhancementResult>;
  estimateCost(request: AIEnhancementRequest): Promise<number>;
  getSupportedModels(): Promise<string[]>;
}

export interface AIError {
  type:
    | "rate_limit"
    | "api_key_invalid"
    | "network_error"
    | "parsing_error"
    | "quota_exceeded"
    | "model_unavailable";
  message: string;
  provider: string;
  retryAfter?: number;
  suggestion?: string;
}

export interface AIEnhancementOptions {
  provider: "openai" | "anthropic" | "gemini";
  model?: string;
  enhancementLevel: "light" | "moderate" | "comprehensive";
  focusAreas?: string[];
  jobDescription?: string;
  userInstructions?: string;
  enableFallback?: boolean;
  maxRetries?: number;
}
