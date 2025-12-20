import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { provider, apiKey, model, messages, maxTokens = 500 } = body;

    if (!provider || !apiKey || !messages) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: provider, apiKey, messages",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let responseContent: string;
    switch (provider) {
      case "openai":
        responseContent = await callOpenAI(
          apiKey,
          model || "gpt-4",
          messages,
          maxTokens,
        );
        break;
      case "anthropic":
        responseContent = await callAnthropic(
          apiKey,
          model || "claude-3-5-sonnet-20240620",
          messages,
          maxTokens,
        );
        break;
      case "gemini":
        responseContent = await callGemini(
          apiKey,
          model || "gemini-pro",
          messages,
          maxTokens,
        );
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported provider: ${provider}` }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    return new Response(JSON.stringify({ content: responseContent }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

async function callOpenAI(
  apiKey: string,
  model: string,
  messages: any[],
  maxTokens: number,
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: any[],
  maxTokens: number,
) {
  const prompt = messages
    .map(
      (msg) => `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`,
    )
    .join("\n\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "";
}

async function callGemini(
  apiKey: string,
  model: string,
  messages: any[],
  maxTokens: number,
) {
  const prompt = messages.map((msg) => msg.content).join("\n\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "";
}
