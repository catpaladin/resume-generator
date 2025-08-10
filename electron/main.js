const {
  app,
  BrowserWindow,
  Menu,
  shell,
  dialog,
  protocol,
} = require("electron");
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
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false, // Don't show until ready-to-show
  });

  // Load the Next.js app
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // Try to start a local server, fallback to file loading
    startLocalServer()
      .then(() => {
        // Test if server is actually running
        const http = require("http");
        const req = http.get("http://localhost:3001", (res) => {
          console.log("Server is running, loading from http://localhost:3001");
          mainWindow.loadURL("http://localhost:3001");
        });

        req.on("error", (err) => {
          console.log("Server not accessible, falling back to app:// protocol");
          mainWindow.loadURL("app://localhost/index.html");
        });

        req.setTimeout(1000, () => {
          console.log(
            "Server connection timeout, falling back to app:// protocol",
          );
          req.destroy();
          mainWindow.loadURL("app://localhost/index.html");
        });
      })
      .catch((error) => {
        console.error("Failed to start server:", error);
        console.log("Loading via app:// protocol");
        mainWindow.loadURL("app://localhost/index.html");
      });
  }

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Create application menu
  createMenu();
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    const outDir = path.join(__dirname, "../out");
    console.log("Starting server for directory:", outDir);
    console.log("Directory exists:", fs.existsSync(outDir));

    // Try different paths for serve in packaged app
    let servePath;
    const possiblePaths = [
      path.join(__dirname, "../node_modules/.bin/serve"),
      path.join(__dirname, "../node_modules/serve/bin/serve.js"),
      path.join(process.resourcesPath, "serve/bin/serve.js"),
      path.join(
        process.resourcesPath,
        "app.asar.unpacked/node_modules/serve/bin/serve.js",
      ),
      path.join(__dirname, "../resources/serve/bin/serve.js"),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        servePath = p;
        console.log("Found serve at:", servePath);
        break;
      }
    }

    if (!servePath) {
      console.error(
        "Could not find serve binary, falling back to static file loading",
      );
      resolve();
      return;
    }

    serverProcess = spawn("node", [servePath, "-s", outDir, "-p", "3001"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let serverStarted = false;

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log("Server stdout:", output);
      if (
        output.includes("Accepting connections") ||
        output.includes("served at")
      ) {
        if (!serverStarted) {
          serverStarted = true;
          resolve();
        }
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("Server stderr:", data.toString());
    });

    serverProcess.on("error", (error) => {
      console.error("Server process error:", error);
      if (!serverStarted) {
        resolve(); // Continue anyway, will fallback to file:// protocol
      }
    });

    serverProcess.on("exit", (code, signal) => {
      console.log("Server process exited:", { code, signal });
    });

    // Fallback timeout
    setTimeout(() => {
      if (!serverStarted) {
        console.log("Server startup timeout, continuing anyway");
        resolve();
      }
    }, 3000);
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
            if (mainWindow) {
              mainWindow.webContents.send("menu-new-resume");
            }
          },
        },
        {
          label: "Export PDF",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu-export-pdf");
            }
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
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

  // macOS specific menu adjustments
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

    // Window menu
    template[4].submenu = [
      { role: "close" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "font/eot",
  };
  return contentTypes[ext] || "text/plain";
}

// App event listeners
app.whenReady().then(() => {
  // Register custom protocol for serving static files
  protocol.handle("app", (request) => {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);

    // Map /_next/static paths to the actual file locations
    let filePath;
    if (pathname.startsWith("/_next/")) {
      filePath = path.join(__dirname, "../out", pathname);
    } else if (pathname === "/" || pathname === "/index.html") {
      filePath = path.join(__dirname, "../out/index.html");
    } else {
      filePath = path.join(__dirname, "../out", pathname);
    }

    console.log(
      "Protocol handler - requested:",
      pathname,
      "-> mapped to:",
      filePath,
    );

    if (fs.existsSync(filePath)) {
      return new Response(fs.readFileSync(filePath), {
        headers: {
          "content-type": getContentType(filePath),
        },
      });
    } else {
      console.log("File not found:", filePath);
      return new Response("File not found", { status: 404 });
    }
  });

  createWindow();

  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Clean up server process
  if (serverProcess) {
    serverProcess.kill();
  }

  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
