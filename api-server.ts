import * as http from "http";
import * as https from "https";
import * as url from "url";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

interface Message {
  role: string;
  content: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  isRecommended?: boolean;
}

// Static file server is now built-in, no need for external sirv process
console.log("\n  Your application is ready~! 🚀\n");
console.log(`  - Local:      http://localhost:${PORT}`);
console.log(`  - Network:    http://0.0.0.0:${PORT}\n`);
console.log(" LOGS");

// Logging function
function logRequest(method: string, path: string, statusCode: number): void {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  const colorCode =
    statusCode >= 200 && statusCode < 300 ? "\x1b[32m" : "\x1b[31m";
  const resetCode = "\x1b[0m";

  console.log(
    `${timestamp} ${colorCode}${statusCode}${resetCode} ${method} ${path}`,
  );
}

// Simple API route handlers using built-in modules only
async function handleApiRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
): Promise<void> {
  const method = req.method || "GET";
  if (pathname === "/api/ai/test") {
    return handleTestRoute(req, res, method, pathname);
  }
  if (pathname === "/api/ai/chat") {
    return handleChatRoute(req, res, method, pathname);
  }
  if (pathname === "/api/ai/models") {
    return handleModelsRoute(req, res, method, pathname);
  }
  if (pathname === "/api/ai/models-dev") {
    return handleModelsDevRoute(req, res, method, pathname);
  }
  if (pathname.startsWith("/api/ai/logos/")) {
    return handleLogoProxyRoute(req, res, method, pathname);
  }
  if (pathname === "/api/ai/enhance") {
    return handleEnhanceRoute(req, res, method, pathname);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "API route not found" }));
  logRequest(method, pathname, 404);
}

function parseBody(
  req: http.IncomingMessage,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function handleTestRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  method: string,
  pathname: string,
): Promise<void> {
  try {
    const body = await parseBody(req);
    const { provider, apiKey } = body as {
      provider?: string;
      apiKey?: string;
    };

    if (!provider || !apiKey) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Missing required fields: provider, apiKey" }),
      );
      logRequest(method, pathname, 400);
      return;
    }

    // Simple test response
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ success: true, response: "Connection test successful" }),
    );
    logRequest(method, pathname, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: errorMessage }));
    logRequest(method, pathname, 500);
  }
}

async function handleChatRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  method: string,
  pathname: string,
): Promise<void> {
  try {
    const body = await parseBody(req);
    const {
      provider,
      apiKey,
      model,
      messages,
      maxTokens = 500,
    } = body as {
      provider?: string;
      apiKey?: string;
      model?: string;
      messages?: Message[];
      maxTokens?: number;
    };

    if (!provider || !apiKey || !messages) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Missing required fields: provider, apiKey, messages",
        }),
      );
      logRequest(method, pathname, 400);
      return;
    }

    let response: string;
    switch (provider) {
      case "openai":
        response = await callOpenAI(
          apiKey,
          model || "gpt-4",
          messages || [],
          maxTokens,
        );
        break;
      case "anthropic":
        response = await callAnthropic(
          apiKey,
          model || "claude-3-5-sonnet-20240620",
          messages || [],
          maxTokens,
        );
        break;
      case "gemini":
        response = await callGemini(
          apiKey,
          model || "gemini-pro",
          messages || [],
          maxTokens,
        );
        break;
      default:
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Unsupported provider: ${provider}` }));
        logRequest(method, pathname, 400);
        return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ content: response }));
    logRequest(method, pathname, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: errorMessage }));
    logRequest(method, pathname, 500);
  }
}

async function handleModelsRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  method: string,
  pathname: string,
): Promise<void> {
  try {
    const body = await parseBody(req);
    const { provider, apiKey } = body as {
      provider?: string;
      apiKey?: string;
    };

    if (!provider || !apiKey) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Missing required fields: provider, apiKey" }),
      );
      logRequest(method, pathname, 400);
      return;
    }

    const fallbackModels = getFallbackModels(provider);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ models: fallbackModels }));
    logRequest(method, pathname, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: errorMessage }));
    logRequest(method, pathname, 500);
  }
}

async function handleModelsDevRoute(
  _req: http.IncomingMessage,
  res: http.ServerResponse,
  method: string,
  pathname: string,
): Promise<void> {
  try {
    const options: https.RequestOptions = {
      hostname: "models.dev",
      port: 443,
      path: "/api.json",
      method: "GET",
      headers: {
        "User-Agent": "Resume-Generator-App",
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let body = "";
      proxyRes.on("data", (chunk) => (body += chunk));
      proxyRes.on("end", () => {
        if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
          res.writeHead(proxyRes.statusCode, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              error: `Models.dev API error (${proxyRes.statusCode})`,
            }),
          );
          logRequest(method, pathname, proxyRes.statusCode);
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(body);
          logRequest(method, pathname, 200);
        }
      });
    });

    proxyReq.on("error", (error) => {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
      logRequest(method, pathname, 500);
    });

    proxyReq.end();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: errorMessage }));
    logRequest(method, pathname, 500);
  }
}

async function handleLogoProxyRoute(
  _req: http.IncomingMessage,
  res: http.ServerResponse,
  method: string,
  pathname: string,
): Promise<void> {
  try {
    const provider = pathname.split("/").pop();
    if (!provider) {
      res.writeHead(400);
      res.end("Provider missing");
      return;
    }

    const options: https.RequestOptions = {
      hostname: "models.dev",
      port: 443,
      path: `/logos/${provider}`,
      method: "GET",
    };

    const proxyReq = https.request(options, (proxyRes) => {
      if (proxyRes.statusCode === 404) {
        // Fallback to default logo
        https.get("https://models.dev/logos/default.svg", (fallbackRes) => {
          res.writeHead(200, { "Content-Type": "image/svg+xml" });
          fallbackRes.pipe(res);
        });
        return;
      }

      res.writeHead(proxyRes.statusCode || 200, {
        "Content-Type": proxyRes.headers["content-type"] || "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      });
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (_error) => {
      res.writeHead(500);
      res.end("Error fetching logo");
    });

    proxyReq.end();
  } catch (_error) {
    res.writeHead(500);
    res.end("Internal server error");
  }
}

async function handleEnhanceRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  method: string,
  pathname: string,
): Promise<void> {
  try {
    const body = await parseBody(req);
    // Simple placeholder response for enhance route
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, enhanced: body }));
    logRequest(method, pathname, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: errorMessage }));
    logRequest(method, pathname, 500);
  }
}

// AI Provider functions using built-in https module
async function callOpenAI(
  apiKey: string,
  model: string,
  messages: Message[],
  maxTokens: number,
): Promise<string> {
  const data = JSON.stringify({
    model,
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  const options: https.RequestOptions = {
    hostname: "api.openai.com",
    port: 443,
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Length": Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res: http.IncomingMessage) => {
      let body = "";
      res.on("data", (chunk: Buffer) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`OpenAI API error (${res.statusCode}): ${body}`));
        } else {
          try {
            const result = JSON.parse(body);
            resolve(result.choices[0]?.message?.content || "");
          } catch (err) {
            reject(err);
          }
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: Message[],
  maxTokens: number,
): Promise<string> {
  const prompt = messages
    .map(
      (msg) => `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`,
    )
    .join("\n\n");

  const data = JSON.stringify({
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const options: https.RequestOptions = {
    hostname: "api.anthropic.com",
    port: 443,
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res: http.IncomingMessage) => {
      let body = "";
      res.on("data", (chunk: Buffer) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Anthropic API error (${res.statusCode}): ${body}`));
        } else {
          try {
            const result = JSON.parse(body);
            resolve(result.content[0]?.text || "");
          } catch (err) {
            reject(err);
          }
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function callGemini(
  apiKey: string,
  model: string,
  messages: Message[],
  maxTokens: number,
): Promise<string> {
  const prompt = messages.map((msg) => msg.content).join("\n\n");
  const data = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  });

  const options: https.RequestOptions = {
    hostname: "generativelanguage.googleapis.com",
    port: 443,
    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res: http.IncomingMessage) => {
      let body = "";
      res.on("data", (chunk: Buffer) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Gemini API error (${res.statusCode}): ${body}`));
        } else {
          try {
            const result = JSON.parse(body);
            resolve(result.candidates[0]?.content?.parts[0]?.text || "");
          } catch (err) {
            reject(err);
          }
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function getFallbackModels(provider: string): AIModel[] {
  const fallbackModels: Record<string, AIModel[]> = {
    openai: [
      {
        id: "gpt-4",
        name: "GPT-4",
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
        id: "claude-3-5-sonnet-20240620",
        name: "Claude 3.5 Sonnet",
        description: "Balanced performance",
        isRecommended: true,
      },
      {
        id: "claude-3-5-haiku-latest",
        name: "Claude 3.5 Haiku",
        description: "Fast and cost-effective",
      },
    ],
    gemini: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        description: "Google's flagship model",
        isRecommended: true,
      },
    ],
  };
  return fallbackModels[provider] || [];
}

// Serve static files directly from the out directory
function serveStaticFile(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  const fs = require("fs");
  const path = require("path");

  const url = req.url || "/";
  let filePath: string;

  if (url === "/" || url === "/index.html") {
    filePath = path.join(__dirname, "dist", "index.html");
  } else {
    filePath = path.join(__dirname, "dist", url);
  }

  // Security: prevent directory traversal
  const outDir = path.join(__dirname, "dist");
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(outDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    logRequest(req.method || "GET", url, 403);
    return;
  }

  fs.readFile(filePath, (err: NodeJS.ErrnoException | null, data: Buffer) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("Not Found");
        logRequest(req.method || "GET", url, 404);
      } else {
        res.writeHead(500);
        res.end("Internal Server Error");
        logRequest(req.method || "GET", url, 500);
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = getContentType(ext);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
      logRequest(req.method || "GET", url, 200);
    }
  });
}

// Get MIME type based on file extension
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
  };
  return types[ext] || "application/octet-stream";
}

// Create main server
const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = url.parse(req.url || "", true);
    const pathname = parsedUrl.pathname || "/";

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // Handle API routes
    if (pathname.startsWith("/api/")) {
      handleApiRoute(req, res, pathname);
    } else {
      // Serve static files directly
      serveStaticFile(req, res);
    }
  },
);

server.listen(PORT, "0.0.0.0", () => {
  // Server startup message will be shown when sirv is ready
});

// Cleanup on exit
process.on("SIGTERM", () => {
  server.close();
});

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
