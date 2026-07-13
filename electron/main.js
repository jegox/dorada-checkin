import http from "http";
import path from "path";
import { app, BrowserWindow, Menu, protocol } from "electron";
import { registerIpcHandlers } from "./ipc/handlers.js";

// Registrar el esquema app:// como privilegiado ANTES de que la app esté lista
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAccessControlHeaders: true,
      stream: true,
    },
  },
]);

const isPreview = process.argv.includes("--preview");

// Espera a que el servidor de Next.js esté listo (solo en dev)
const waitForNextServer = (port = 3000, timeout = 60000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          resolve(true);
        } else {
          setTimeout(check, 500);
        }
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeout) {
          resolve(false);
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
};

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(app.getAppPath(), "./electron/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true, // M-2: aislamiento OS del proceso renderer
    },
    title: "Dorada Check",
  });

  win.setMenuBarVisibility(false);

  if (app.isPackaged || isPreview) {
    // Producción: sirve los archivos estáticos de Next.js desde /out
    win.loadURL("app://app/index.html");
  } else {
    // Desarrollo: apunta al servidor de Next.js
    await waitForNextServer();
    win.loadURL("http://localhost:3000");
    win.webContents.on("did-fail-load", () => {
      win.webContents.reloadIgnoringCache();
    });
  }

  win.on("ready-to-show", () => {
    win.setMenuBarVisibility(false);
  });

  return win;
};

app.on("ready", () => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers();

  // Protocolo app:// para servir archivos estáticos de Next.js en producción
  protocol.handle("app", async (req) => {
    const { pathname } = new URL(req.url);
    const decodedPath = decodeURIComponent(pathname);
    const baseDir = app.isPackaged
      ? path.join(process.resourcesPath, "app.asar", "out")
      : path.join(app.getAppPath(), "out");

    const ext = path.extname(decodedPath);
    let filePath;

    if (ext) {
      // Es un asset (JS, CSS, imagen, fuente)
      filePath = path.join(baseDir, decodedPath);
    } else {
      // Es una ruta de navegación, buscar index.html o la página correspondiente
      const nextIdx = decodedPath.indexOf("/_next");
      const normalized = nextIdx > 0 ? decodedPath.slice(nextIdx) : decodedPath;
      filePath = path.join(baseDir, `${normalized}.html`);
      // Fallback a index.html si no existe la página
      const { existsSync } = await import("fs");
      if (!existsSync(filePath)) {
        filePath = path.join(baseDir, "index.html");
      }
    }

    return new Response((await import("fs")).readFileSync(filePath), {
      headers: { "content-type": getMimeType(ext || ".html") },
    });
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function getMimeType(ext) {
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };
  return types[ext] ?? "application/octet-stream";
}
