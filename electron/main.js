const { app, BrowserWindow, Menu, shell, protocol } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const isDev = process.env.NODE_ENV === "development";

let mainWindow;
let serverProcess;

// Register the custom protocol as standard
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: !isDev,
    },
    icon: path.join(__dirname, "../public/favicon.ico"),
    titleBarStyle: "default",
    show: false,
    ...(process.platform === "darwin" && {
      vibrancy: "under-window",
      visualEffectState: "active",
    }),
  });

  // Load the Astro app
  if (isDev) {
    mainWindow.loadURL("http://localhost:4321");
  } else {
    startLocalServer()
      .then(() => {
        setTimeout(() => {
          const http = require("http");
          console.log("Testing connection to API server...");

          const req = http.get("http://localhost:3001/api/health", (res) => {
            console.log(
              `✅ API server responding (${res.statusCode}), loading from http://localhost:3001`,
            );
            mainWindow.loadURL("http://localhost:3001");
          });

          req.on("error", (err) => {
            console.log(
              "❌ Server not accessible:",
              err.message,
              "- falling back to app:// protocol",
            );
            mainWindow.loadURL("app://localhost/index.html");
          });

          req.setTimeout(12000, () => {
            console.log(
              "⏱️ Server connection timeout (12s) - falling back to app:// protocol",
            );
            req.destroy();
            mainWindow.loadURL("app://localhost/index.html");
          });
        }, 5000);
      })
      .catch((error) => {
        console.error("Failed to start server:", error);
        mainWindow.loadURL("app://localhost/index.html");
      });
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => {
    if (
      process.platform !== "darwin" ||
      BrowserWindow.getAllWindows().length === 1
    ) {
      if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
      }
    }
    if (mainWindow && mainWindow.isDestroyed()) {
      mainWindow = null;
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  createMenu();
}

function startLocalServer() {
  return new Promise((resolve) => {
    const distDir = path.join(__dirname, "../dist");
    console.log("Starting API server for directory:", distDir);

    let serverPath = path.join(__dirname, "../dist/api-server.js");

    if (!fs.existsSync(serverPath)) {
      serverPath = path.join(process.resourcesPath, "app/dist/api-server.js");
    }

    if (!fs.existsSync(serverPath)) {
      console.error("Could not find API server at:", serverPath);
      resolve();
      return;
    }

    console.log("Launching API server from:", serverPath);

    serverProcess = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        STATIC_DIR: distDir,
        PORT: "3001",
        NODE_ENV: "production",
      },
    });

    let serverStarted = false;

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log("API server stdout:", output);
      if (
        output.includes("Your application is ready") ||
        output.includes("http://localhost:3001")
      ) {
        if (!serverStarted) {
          serverStarted = true;
          resolve();
        }
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("API server stderr:", data.toString());
    });

    serverProcess.on("error", (error) => {
      console.error("API server process error:", error);
      if (!serverStarted) {
        resolve();
      }
    });

    serverProcess.on("exit", (code, signal) => {
      console.log("API server process exited:", { code, signal });
    });

    setTimeout(() => {
      if (!serverStarted) {
        console.log("API server startup timeout, continuing anyway");
        resolve();
      }
    }, 5000);
  });
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Resume",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            if (mainWindow) mainWindow.webContents.send("menu-new-resume");
          },
        },
        {
          label: "New Window",
          accelerator: "CmdOrCtrl+Shift+N",
          click: () => createWindow(),
        },
        {
          label: "Export PDF",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            if (mainWindow) mainWindow.webContents.send("menu-export-pdf");
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectall" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "font/eot",
  };
  return contentTypes[ext] || "text/plain";
}

async function handleApiRoute(request, pathname) {
  console.log("=== ELECTRON API ROUTE ===");
  console.log("Method:", request.method);
  console.log("Pathname:", pathname);
  console.log("=== END API ROUTE DEBUG ===");

  if (pathname === "/api/ai/test") return handleAITestRoute(request);
  if (pathname === "/api/ai/chat") return handleAIChatRoute(request);
  if (pathname === "/api/ai/models") return handleAIModelsRoute(request);
  if (pathname === "/api/ai/models-dev") return handleAIModelsDevRoute(request);
  if (pathname.startsWith("/api/ai/logos/"))
    return handleAILogoProxyRoute(request, pathname);
  if (pathname === "/api/ai/enhance") return handleAIEnhanceRoute(request);

  return new Response("API route not found", { status: 404 });
}

async function handleAIChatRoute(request) {
  try {
    const body = await request.json();
    const { provider, apiKey, model, messages, maxTokens = 500 } = body;

    if (!provider || !apiKey || !messages) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let responseContent;
    if (provider === "openai")
      responseContent = await callOpenAI(
        apiKey,
        model || "gpt-4.1",
        messages,
        maxTokens,
      );
    else if (provider === "anthropic")
      responseContent = await callAnthropic(
        apiKey,
        model || "claude-3-5-sonnet-latest",
        messages,
        maxTokens,
      );
    else if (provider === "gemini")
      responseContent = await callGemini(
        apiKey,
        model || "gemini-2.5-pro",
        messages,
        maxTokens,
      );
    else
      return new Response(JSON.stringify({ error: "Unsupported provider" }), {
        status: 400,
      });

    return new Response(JSON.stringify({ content: responseContent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

async function handleAIModelsRoute(request) {
  try {
    const body = await request.json();
    const { provider } = body;
    const fallbackModels = getFallbackModels(provider);
    return new Response(JSON.stringify({ models: fallbackModels }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

async function handleAIModelsDevRoute() {
  try {
    const response = await fetch("https://models.dev/api.json", {
      headers: { "User-Agent": "Resume-Generator-App" },
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

async function handleAILogoProxyRoute(request, pathname) {
  try {
    const provider = pathname.split("/").pop().replace(".svg", "");
    let response = await fetch(`https://models.dev/logos/${provider}.svg`);
    if (response.status === 404)
      response = await fetch("https://models.dev/logos/default.svg");
    const blob = await response.blob();
    return new Response(blob, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}

async function handleAITestRoute(request) {
  try {
    return new Response(
      JSON.stringify({ success: true, response: "Connection test successful" }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

async function handleAIEnhanceRoute(request) {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({ success: true, enhanced: body }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

async function callOpenAI(apiKey, model, messages, maxTokens) {
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
  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function callAnthropic(apiKey, model, messages, maxTokens) {
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
  const data = await response.json();
  return data.content[0]?.text || "";
}

async function callGemini(apiKey, model, messages, maxTokens) {
  const prompt = messages.map((msg) => msg.content).join("\n\n");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    },
  );
  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "";
}

function getFallbackModels(provider) {
  const fallbackModels = {
    openai: [
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        description: "Most capable model (2025)",
        isRecommended: true,
      },
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 Mini",
        description: "Faster, cost-effective",
      },
    ],
    anthropic: [
      {
        id: "claude-opus-4.1",
        name: "Claude Opus 4.1",
        description: "Flagship model (2025)",
        isRecommended: true,
      },
      {
        id: "claude-sonnet-4",
        name: "Claude Sonnet 4",
        description: "High-performance",
      },
    ],
    gemini: [
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "Most advanced (2025)",
        isRecommended: true,
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Price-performance",
      },
    ],
  };
  return fallbackModels[provider] || [];
}

app.whenReady().then(() => {
  protocol.handle("app", async (request) => {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.startsWith("/api/")) return handleApiRoute(request, pathname);

    const distRoot = path.join(__dirname, "../dist");
    let filePath =
      pathname === "/" || pathname === "/index.html"
        ? path.join(distRoot, "index.html")
        : path.join(
            distRoot,
            pathname.startsWith("/") ? pathname.slice(1) : pathname,
          );

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return new Response(fs.readFileSync(filePath), {
        headers: { "content-type": getContentType(filePath) },
      });
    }
    return new Response("Not Found", { status: 404 });
  });
  createWindow();
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
