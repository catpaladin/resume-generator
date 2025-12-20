import type { APIRoute } from "astro";

export const getStaticPaths = () => {
  return [
    { params: { provider: "openai.svg" } },
    { params: { provider: "anthropic.svg" } },
    { params: { provider: "google.svg" } },
    { params: { provider: "deepseek.svg" } },
    { params: { provider: "mistral.svg" } },
    { params: { provider: "groq.svg" } },
    { params: { provider: "perplexity.svg" } },
    { params: { provider: "xai.svg" } },
    { params: { provider: "cohere.svg" } },
    { params: { provider: "meta.svg" } },
    { params: { provider: "replicate.svg" } },
    { params: { provider: "together.svg" } },
    { params: { provider: "fireworks.svg" } },
    { params: { provider: "deepinfra.svg" } },
    { params: { provider: "openrouter.svg" } },
    { params: { provider: "default.svg" } },
  ];
};

export const GET: APIRoute = async ({ params }) => {
  const { provider } = params;
  if (!provider) {
    return new Response("Provider missing", { status: 400 });
  }

  try {
    const response = await fetch(`https://models.dev/logos/${provider}`);
    if (!response.ok) {
      // Fallback to default logo if provider logo not found
      const fallbackResponse = await fetch(
        "https://models.dev/logos/default.svg",
      );
      const fallbackData = await fallbackResponse.arrayBuffer();
      return new Response(fallbackData, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const data = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type") || "image/svg+xml";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error(`[Logo Proxy] Error fetching logo for ${provider}:`, error);
    return new Response("Error fetching logo", { status: 500 });
  }
};
