import { NextRequest, NextResponse } from "next/server";
import type {
  AIEnhancementOptions,
  AIEnhancementResult,
  AIEnhancementRequest,
} from "@/types/ai-enhancement";
import type { ResumeData } from "@/types/resume";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      options,
      originalText,
      parsedData,
      apiKey,
    }: {
      options: AIEnhancementOptions;
      originalText: string;
      parsedData: ResumeData;
      apiKey: string;
    } = body;

    if (!options.provider) {
      return NextResponse.json(
        { error: "No AI provider specified" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `No API key provided for ${options.provider}` },
        { status: 401 },
      );
    }

    const startTime = Date.now();

    // Create enhancement request
    const enhancementRequest: AIEnhancementRequest = {
      originalText,
      parsedData,
      jobDescription: options.jobDescription,
      userInstructions: options.userInstructions,
      focusAreas: options.focusAreas || [],
      enhancementLevel: options.enhancementLevel,
    };

    let result: Pick<AIEnhancementResult, "originalData" | "enhancedData" | "suggestions" | "confidence">;

    // Call the appropriate AI provider API
    switch (options.provider) {
      case "openai":
        result = await enhanceWithOpenAI(
          enhancementRequest,
          apiKey,
          options.model,
        );
        break;
      case "anthropic":
        result = await enhanceWithAnthropic(
          enhancementRequest,
          apiKey,
          options.model,
        );
        break;
      case "gemini":
        result = await enhanceWithGemini(
          enhancementRequest,
          apiKey,
          options.model,
        );
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${options.provider}` },
          { status: 400 },
        );
    }

    const processingTime = Date.now() - startTime;

    // Add metadata to result
    const enhancementResult: AIEnhancementResult = {
      ...result,
      processingTime,
      provider: options.provider,
      model: options.model || getDefaultModel(options.provider),
      timestamp: new Date(),
      success: true,
    };

    return NextResponse.json(enhancementResult);
  } catch (error) {
    console.error("AI enhancement error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Enhancement failed",
      },
      { status: 500 },
    );
  }
}

async function enhanceWithOpenAI(
  request: AIEnhancementRequest,
  apiKey: string,
  model?: string,
): Promise<Pick<AIEnhancementResult, "originalData" | "enhancedData" | "suggestions" | "confidence">> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(request.enhancementLevel),
        },
        {
          role: "user",
          content: getUserPrompt(request),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  return parseEnhancementResponse(content, request);
}

async function enhanceWithAnthropic(
  request: AIEnhancementRequest,
  apiKey: string,
  model?: string,
): Promise<Pick<AIEnhancementResult, "originalData" | "enhancedData" | "suggestions" | "confidence">> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `${getSystemPrompt(request.enhancementLevel)}\n\n${getUserPrompt(request)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error("No content received from Anthropic");
  }

  return parseEnhancementResponse(content, request);
}

async function enhanceWithGemini(
  request: AIEnhancementRequest,
  apiKey: string,
  model?: string,
): Promise<Pick<AIEnhancementResult, "originalData" | "enhancedData" | "suggestions" | "confidence">> {
  const modelName = model || "gemini-pro";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${getSystemPrompt(request.enhancementLevel)}\n\n${getUserPrompt(request)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text;

  if (!content) {
    throw new Error("No content received from Gemini");
  }

  return parseEnhancementResponse(content, request);
}

function getSystemPrompt(enhancementLevel: string): string {
  const basePrompt = `You are an expert resume enhancement AI. Your task is to improve resume content while maintaining accuracy and authenticity.

Rules:
1. NEVER fabricate experience, skills, or achievements
2. Only enhance existing content - don't add new roles or experiences
3. Improve clarity, impact, and ATS compatibility
4. Use action verbs and quantify achievements where possible
5. Return valid JSON with the specified structure`;

  const levelPrompts = {
    light: "Focus on grammar, clarity, and minor wording improvements.",
    moderate: "Enhance impact, add relevant keywords, and improve structure.",
    comprehensive: "Comprehensive optimization for ATS, impact, and professional presentation.",
  };

  return `${basePrompt}\n\nEnhancement Level: ${levelPrompts[enhancementLevel as keyof typeof levelPrompts] || levelPrompts.moderate}`;
}

function getUserPrompt(request: AIEnhancementRequest): string {
  let prompt = `Please enhance this resume data:\n\n${JSON.stringify(request.parsedData, null, 2)}`;

  if (request.jobDescription) {
    prompt += `\n\nTarget Job Description:\n${request.jobDescription}`;
  }

  if (request.userInstructions) {
    prompt += `\n\nSpecial Instructions:\n${request.userInstructions}`;
  }

  if (request.focusAreas && request.focusAreas.length > 0) {
    prompt += `\n\nFocus Areas: ${request.focusAreas.join(", ")}`;
  }

  prompt += `\n\nReturn a JSON object with:
{
  "originalData": <original resume data>,
  "enhancedData": <enhanced resume data>,
  "suggestions": [
    {
      "id": "unique-id",
      "field": "field name",
      "section": "resume section",
      "originalValue": "original text",
      "suggestedValue": "enhanced text",
      "reasoning": "why this change improves the resume",
      "confidence": 0.95,
      "type": "improvement"
    }
  ],
  "confidence": 0.9
}`;

  return prompt;
}

function parseEnhancementResponse(
  content: string,
  request: AIEnhancementRequest,
): Pick<AIEnhancementResult, "originalData" | "enhancedData" | "suggestions" | "confidence"> {
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      originalData: request.parsedData,
      enhancedData: parsed.enhancedData || request.parsedData,
      suggestions: parsed.suggestions || [],
      confidence: parsed.confidence || 0.8,
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);

    // Fallback: return original data with error note
    return {
      originalData: request.parsedData,
      enhancedData: request.parsedData,
      suggestions: [
        {
          id: "parse-error",
          field: "parsing",
          section: "personalInfo" as keyof ResumeData,
          originalValue: "AI response",
          suggestedValue: "Could not parse AI response",
          reasoning: "The AI response could not be parsed properly",
          confidence: 0.1,
          type: "improvement" as const,
        },
      ],
      confidence: 0.1,
    };
  }
}

function getDefaultModel(provider: string): string {
  const defaults = {
    openai: "gpt-4",
    anthropic: "claude-3-sonnet-20240229",
    gemini: "gemini-pro",
  };
  return defaults[provider as keyof typeof defaults] || "unknown";
}
