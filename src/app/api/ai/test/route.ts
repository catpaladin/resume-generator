import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: provider, apiKey" },
        { status: 400 },
      );
    }

    // Test with a simple message
    const testMessages = [
      {
        role: "user",
        content: "Hello, this is a connection test. Please respond with 'OK'.",
      },
    ];

    let response;

    switch (provider) {
      case "openai":
        response = await testOpenAI(apiKey, model || "gpt-4", testMessages);
        break;
      case "anthropic":
        response = await testAnthropic(
          apiKey,
          model || "claude-3-5-sonnet-20240620",
          testMessages,
        );
        break;
      case "gemini":
        response = await testGemini(
          apiKey,
          model || "gemini-pro",
          testMessages,
        );
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 },
        );
    }

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("AI Test Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Connection test failed",
      },
      { status: 500 },
    );
  }
}

interface Message {
  role: string;
  content: string;
}

async function testOpenAI(
  apiKey: string,
  model: string,
  messages: Message[],
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 10,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function testAnthropic(
  apiKey: string,
  model: string,
  messages: Message[],
): Promise<string> {
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
      max_tokens: 10,
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

async function testGemini(
  apiKey: string,
  model: string,
  messages: Message[],
): Promise<string> {
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
          maxOutputTokens: 10,
          temperature: 0,
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
