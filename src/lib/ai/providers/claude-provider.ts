import type {
  AIEnhancementRequest,
  AIEnhancementResult,
  AISuggestion,
} from "@/types/ai-enhancement";
import type { ResumeData } from "@/types/resume";
import { BaseAIProvider } from "./base-provider";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeProvider extends BaseAIProvider {
  name = "Claude";
  private defaultModel = "claude-3-5-sonnet-20241022";

  async testConnection(): Promise<boolean> {
    this.ensureConfigured();

    try {
      const response = await this.makeRequest(
        [{ role: "user", content: "Hello, please respond with 'OK'" }],
        { max_tokens: 10 },
      );

      return response.content?.[0]?.text?.includes("OK") ?? false;
    } catch (error) {
      console.error("Claude connection test failed:", error);
      return false;
    }
  }

  async enhanceResume(
    request: AIEnhancementRequest,
  ): Promise<AIEnhancementResult> {
    this.ensureConfigured();
    const startTime = Date.now();

    try {
      const prompt = this.buildEnhancementPrompt(request);
      const messages: ClaudeMessage[] = [
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await this.makeRequest(messages, {
        max_tokens: 4000,
        temperature: 0.3,
      });

      const content = response.content[0]?.text;
      if (!content) {
        throw new Error("No response content from Claude");
      }

      const result = this.parseEnhancementResponse(content, request);
      const processingTime = Date.now() - startTime;

      return {
        ...result,
        processingTime,
        provider: this.name,
        model: this.config?.model || this.defaultModel,
        timestamp: new Date(),
        success: true,
      };
    } catch (error) {
      throw this.mapErrorToAIError(error);
    }
  }

  async estimateCost(request: AIEnhancementRequest): Promise<number> {
    const { CostEstimator } = await import("../cost-estimator");

    const model = this.config?.model || this.defaultModel;
    const estimate = CostEstimator.estimateEnhancementCost(
      "anthropic",
      model,
      request.originalText,
      request.jobDescription,
      request.userInstructions,
      request.enhancementLevel,
    );

    return estimate ? estimate.totalCost : 0;
  }

  async getSupportedModels(): Promise<string[]> {
    return [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];
  }

  private buildEnhancementPrompt(request: AIEnhancementRequest): string {
    let prompt = `You are a professional resume enhancement expert. Your task is to improve resume content while maintaining accuracy and authenticity.

IMPORTANT RULES:
1. Only enhance existing information, never fabricate details
2. Improve clarity, impact, and professional language
3. Quantify achievements when possible
4. Use action verbs and industry-standard terminology
5. Maintain the original structure and factual accuracy
6. Respond ONLY with valid JSON in the specified format

Please enhance this resume data while maintaining factual accuracy:

Original Resume Text:
${request.originalText}

Current Parsed Data:
${JSON.stringify(request.parsedData, null, 2)}
`;

    if (request.jobDescription) {
      prompt += `\nTarget Job Description:\n${request.jobDescription}\n`;
      prompt += `Please tailor the enhancements to match the job requirements and use relevant keywords.\n`;
    }

    if (request.userInstructions) {
      prompt += `\nAdditional Instructions:\n${request.userInstructions}\n`;
    }

    if (request.focusAreas?.length) {
      prompt += `\nFocus Areas: ${request.focusAreas.join(", ")}\n`;
    }

    prompt += `\nEnhancement Level: ${request.enhancementLevel}\n`;

    switch (request.enhancementLevel) {
      case "light":
        prompt +=
          "Apply light enhancements: fix grammar, improve clarity, use better action verbs.\n";
        break;
      case "moderate":
        prompt +=
          "Apply moderate enhancements: improve impact, add quantification where possible, enhance professional language.\n";
        break;
      case "comprehensive":
        prompt +=
          "Apply comprehensive enhancements: significantly improve impact, maximize quantification, optimize for ATS, enhance all professional language.\n";
        break;
    }

    prompt += `\nResponse format (JSON only):
{
  "enhancedData": { /* Complete enhanced ResumeData object */ },
  "suggestions": [
    {
      "field": "experience.bulletPoints[0]",
      "section": "experience", 
      "originalValue": "original text",
      "suggestedValue": "enhanced text",
      "reasoning": "explanation of improvement",
      "confidence": 0.9,
      "type": "improvement"
    }
  ],
  "confidence": 0.85
}

Please provide the enhanced resume data and detailed suggestions for each improvement made.`;

    return prompt;
  }

  private parseEnhancementResponse(
    content: string,
    request: AIEnhancementRequest,
  ): Pick<
    AIEnhancementResult,
    "originalData" | "enhancedData" | "suggestions" | "confidence"
  > {
    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Add IDs to suggestions
      const suggestions: AISuggestion[] = (parsed.suggestions || []).map(
        (suggestion: Partial<AISuggestion>) => ({
          id: this.generateSuggestionId(),
          ...suggestion,
          type: suggestion.type || "improvement",
          accepted: false,
        }),
      );

      return {
        originalData: request.parsedData,
        enhancedData: parsed.enhancedData || request.parsedData,
        suggestions,
        confidence: parsed.confidence || 0.7,
      };
    } catch (error) {
      console.error("Failed to parse Claude response:", error);

      // Fallback: return original data with error note
      return {
        originalData: request.parsedData,
        enhancedData: request.parsedData,
        suggestions: [
          {
            id: this.generateSuggestionId(),
            field: "parsing",
            section: "personal",
            originalValue: "AI Response",
            suggestedValue: "Failed to parse AI response",
            reasoning: "The AI response could not be parsed. Please try again.",
            confidence: 0.1,
            type: "correction",
            accepted: false,
          },
        ],
        confidence: 0.1,
      };
    }
  }

  private async makeRequest(
    messages: ClaudeMessage[],
    options: {
      max_tokens?: number;
      temperature?: number;
      model?: string;
    } = {},
  ): Promise<ClaudeResponse> {
    const model = options.model || this.config?.model || this.defaultModel;
    const baseURL = this.config?.baseURL || "https://api.anthropic.com/v1";

    const response = await fetch(`${baseURL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config?.apiKey || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature || 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }
}
