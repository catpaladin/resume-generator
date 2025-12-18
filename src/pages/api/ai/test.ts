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

    // For testing connection, we just return success
    // In a real scenario, we might call the provider's models list or a dummy prompt
    return new Response(
      JSON.stringify({ success: true, response: "Connection test successful" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Test API Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Connection test failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
