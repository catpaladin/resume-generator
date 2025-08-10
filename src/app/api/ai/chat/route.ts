import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model, messages, maxTokens = 500 } = await request.json();

    if (!provider || !apiKey || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, apiKey, messages' },
        { status: 400 }
      );
    }

    let response;
    
    switch (provider) {
      case 'openai':
        response = await callOpenAI(apiKey, model || 'gpt-4', messages, maxTokens);
        break;
      case 'anthropic':
        response = await callAnthropic(apiKey, model || 'claude-3-5-sonnet-20240620', messages, maxTokens);
        break;
      case 'gemini':
        response = await callGemini(apiKey, model || 'gemini-pro', messages, maxTokens);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ content: response });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

interface Message {
  role: string;
  content: string;
}

async function callOpenAI(apiKey: string, model: string, messages: Message[], maxTokens: number): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
  return data.choices[0]?.message?.content || '';
}

async function callAnthropic(apiKey: string, model: string, messages: Message[], maxTokens: number): Promise<string> {
  // Convert OpenAI format messages to Anthropic format
  const prompt = messages.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`).join('\n\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

async function callGemini(apiKey: string, model: string, messages: Message[], maxTokens: number): Promise<string> {
  // Convert messages to Gemini format
  const prompt = messages.map(msg => msg.content).join('\n\n');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}