import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: provider, apiKey" },
        { status: 400 },
      );
    }

    let models;

    switch (provider) {
      case "openai":
        models = await fetchOpenAIModels(apiKey);
        break;
      case "anthropic":
        models = await fetchAnthropicModels(apiKey);
        break;
      case "gemini":
        models = await fetchGeminiModels(apiKey);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 },
        );
    }

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Models API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch models",
      },
      { status: 500 },
    );
  }
}

async function fetchOpenAIModels(apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();

  // Filter for chat completion models
  return data.data
    .filter(
      (model: { id: string }) =>
        model.id.includes("gpt") ||
        model.id.includes("o3") ||
        model.id.includes("o4") ||
        model.id.includes("davinci"),
    )
    .map((model: { id: string; context_length?: number }) => ({
      id: model.id,
      name: formatModelName(model.id),
      description: getModelDescription(model.id, "openai"),
      context_length: model.context_length,
      isRecommended: isRecommendedModel(model.id, "openai"),
      isDeprecated: isDeprecatedModel(model.id, "openai"),
    }));
}

async function fetchAnthropicModels(apiKey: string) {
  const response = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();

  return data.data.map((model: { id: string; max_tokens?: number }) => ({
    id: model.id,
    name: formatModelName(model.id),
    description: getModelDescription(model.id, "anthropic"),
    context_length: model.max_tokens,
    isRecommended: isRecommendedModel(model.id, "anthropic"),
    isDeprecated: isDeprecatedModel(model.id, "anthropic"),
  }));
}

async function fetchGeminiModels(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();

  const generationModels =
    data.models
      ?.filter(
        (model: { supportedGenerationMethods?: string[]; name: string }) =>
          model.supportedGenerationMethods?.includes("generateContent") &&
          model.name.includes("gemini"),
      )
      .map(
        (model: {
          name: string;
          description?: string;
          inputTokenLimit?: number;
        }) => ({
          id: model.name.replace("models/", ""),
          name: formatModelName(model.name.replace("models/", "")),
          description:
            model.description ||
            getModelDescription(model.name.replace("models/", ""), "gemini"),
          context_length: model.inputTokenLimit,
          isRecommended: isRecommendedModel(
            model.name.replace("models/", ""),
            "gemini",
          ),
          isDeprecated: isDeprecatedModel(
            model.name.replace("models/", ""),
            "gemini",
          ),
        }),
      ) || [];

  return generationModels;
}

// Helper functions
function formatModelName(id: string): string {
  return id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(
      /\d{8,}/g,
      (match) =>
        `(${match.slice(0, 4)}-${match.slice(4, 6)}-${match.slice(6)})`,
    )
    .trim();
}

function getModelDescription(id: string, provider: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    openai: {
      "gpt-4.1":
        "Most capable model with major gains in coding and instruction following",
      "gpt-4o": "Multimodal model integrating text and images",
      "o3-pro": "Advanced reasoning model for complex problems",
      "o4-mini": "Efficient reasoning model",
    },
    anthropic: {
      "claude-opus-4.1": "Most capable and intelligent model",
      "claude-sonnet-4": "High-performance with exceptional reasoning",
      "claude-sonnet-3.7": "Extended thinking capabilities",
    },
    gemini: {
      "gemini-2.5-pro": "Most advanced AI model",
      "gemini-2.5-flash": "Best price-performance ratio",
      "gemini-2.0-flash": "Next-gen features with 1M token context",
    },
  };

  return descriptions[provider]?.[id] || "AI language model";
}

function isRecommendedModel(id: string, provider: string): boolean {
  const recommended = {
    openai: ["gpt-4.1", "gpt-4o", "o3-pro"],
    anthropic: [
      "claude-opus-4-1-20250805",
      "claude-opus-4-20250514",
      "claude-sonnet-4-20250514",
    ],
    gemini: ["gemini-2.5-pro", "gemini-2.5-flash"],
  };

  return (
    recommended[provider as keyof typeof recommended]?.some((rec) =>
      id.includes(rec),
    ) || false
  );
}

function isDeprecatedModel(id: string, provider: string): boolean {
  const deprecated = {
    openai: [
      "gpt-4-turbo",
      "gpt-3.5-turbo",
      "davinci",
      "curie",
      "babbage",
      "ada",
    ],
    anthropic: ["claude-2", "claude-instant"],
    gemini: [
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro",
      "gemini-pro-vision",
    ],
  };

  return (
    deprecated[provider as keyof typeof deprecated]?.some((dep) =>
      id.includes(dep),
    ) || false
  );
}
