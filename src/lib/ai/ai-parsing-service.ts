import type { ResumeData } from "@/types/resume";

export interface AIParsingOptions {
  provider: "openai" | "anthropic" | "gemini";
  model?: string;
  apiKey: string;
}

export interface AIParsingResult {
  success: boolean;
  data?: ResumeData;
  confidence: number;
  improvements: string[];
  error?: string;
}

/**
 * Use AI to parse raw text into structured resume data
 * This is different from enhancement - it's about better extraction/parsing
 * Routes through the Next.js API to avoid CORS issues
 */
export async function parseResumeWithAI(
  rawText: string,
  basicParsedData: ResumeData,
  options: AIParsingOptions,
): Promise<AIParsingResult> {
  const { provider, apiKey, model } = options;

  try {
    // Use the existing Next.js API route to avoid CORS issues
    const response = await fetch("/api/ai/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        options: {
          provider,
          model,
          enhancementLevel: "moderate", // We'll override the prompt
          enableFallback: true,
        },
        originalText: rawText,
        parsedData: basicParsedData,
        apiKey,
        // Flag to indicate this is parsing, not enhancement
        isParsingMode: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed: ${response.statusText}`,
      );
    }

    const result = await response.json();

    // Transform the enhancement result to parsing result format
    return {
      success: true,
      data: result.enhancedData,
      confidence: result.confidence || 0.8,
      improvements:
        result.suggestions?.map(
          (s: { reasoning?: string }) => s.reasoning || "",
        ) || [],
    };
  } catch (error) {
    console.error("AI parsing failed:", error);
    return {
      success: false,
      confidence: 0,
      improvements: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
