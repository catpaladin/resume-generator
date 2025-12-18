import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: provider, apiKey" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const models = getFallbackModels(provider);

    return new Response(JSON.stringify({ models }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Models API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

function getFallbackModels(provider: string) {
  const fallbackModels: Record<string, any[]> = {
    openai: [
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        description: "Most capable model",
        isRecommended: true,
      },
      { id: "gpt-4o", name: "GPT-4o", description: "Multimodal model" },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Faster and cost-effective",
      },
    ],
    anthropic: [
      {
        id: "claude-3-7-sonnet-latest",
        name: "Claude 3.7 Sonnet",
        description: "Extended thinking capabilities",
        isRecommended: true,
      },
      {
        id: "claude-3-5-sonnet-latest",
        name: "Claude 3.5 Sonnet",
        description: "Balanced performance",
      },
      {
        id: "claude-3-5-haiku-latest",
        name: "Claude 3.5 Haiku",
        description: "Fast and cost-effective",
      },
    ],
    gemini: [
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "Most advanced AI model",
        isRecommended: true,
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Best price-performance ratio",
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Next-gen features",
      },
    ],
  };
  return fallbackModels[provider] || [];
}
