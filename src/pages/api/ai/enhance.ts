import type { APIRoute } from "astro";
import { aiService } from "@/lib/ai/ai-service";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { options, originalText, parsedData, apiKey } = body;

    if (!options || !originalText || !parsedData || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Configure the service with the provided API key
    await aiService.configureProvider({
      provider: options.provider,
      model: options.model,
      customModel: options.model,
      hasApiKey: true,
    });

    // Perform enhancement
    const result = await aiService.enhanceResume(
      options,
      originalText,
      parsedData,
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Enhancement API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
