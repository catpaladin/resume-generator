import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const response = await fetch("https://models.dev/api.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch from models.dev: ${response.status}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[ModelsDev Proxy] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
