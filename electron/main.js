import http from "http";
import path from "path";
import { app, BrowserWindow, Menu } from "electron";
import { registerIpcHandlers } from "./ipc/handlers.js";
import {
  getDatabaseStorageFilePath,
  readDatabaseUrlFromStorage,
} from "./runtime/database-credentials.js";

const isPreview = process.argv.includes("--preview");
let nextHttpServer = null;

const loadRuntimeDatabaseUrl = async () => {
  if (process.env.DATABASE_URL) return "runtime";

  try {
    const userDataPath = app.getPath("userData");
    const value = await readDatabaseUrlFromStorage(userDataPath);
    if (!value) return null;

    process.env.DATABASE_URL = value;
    console.log("[runtime-env] DATABASE_URL cargada desde storage local");
    return "local-storage";
  } catch (error) {
    console.error("[runtime-env] Error leyendo storage local:", error);
    return null;
  }
};

const loadFallbackErrorPage = (win, message) => {
  const storagePath = getDatabaseStorageFilePath(app.getPath("userData"));
  win.loadURL(
    "data:text/html," +
      encodeURIComponent(
        `<html><body style="font-family:Arial;padding:24px"><h2>Dorada Check</h2><p>${message}</p><p>Configura la URL desde Configuración para guardarla en storage local (<b>${storagePath}</b>).</p></body></html>`,
      ),
  );
};

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

const startNextProductionServer = async (port = 3000) => {
  if (nextHttpServer?.listening) return true;

  try {
    const appRoot = app.getAppPath();
    const nextModule = await import("next");
    const next = nextModule.default;

    const nextApp = next({
      dev: false,
      dir: appRoot,
      hostname: "127.0.0.1",
      port,
    });
    const handle = nextApp.getRequestHandler();

    await nextApp.prepare();

    nextHttpServer = http.createServer((req, res) => {
      handle(req, res);
    });

    await new Promise((resolve, reject) => {
      const onError = (err) => {
        nextHttpServer.off("listening", onListening);
        reject(err);
      };
      const onListening = () => {
        nextHttpServer.off("error", onError);
        resolve(true);
      };

      nextHttpServer.once("error", onError);
      nextHttpServer.once("listening", onListening);
      nextHttpServer.listen(port, "127.0.0.1");
    });

    return true;
  } catch (error) {
    console.error("[next-start] No se pudo iniciar Next en modo empaquetado:", error);
    return false;
  }
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

  win.webContents.on("did-fail-load", (_event, code, description, url, isMainFrame) => {
    if (!isMainFrame) return;
    console.error(`[renderer-load] code=${code} url=${url} description=${description}`);
    if (app.isPackaged || isPreview) {
      loadFallbackErrorPage(win, "No se pudo cargar la interfaz de la aplicación.");
    }
  });

  win.webContents.on("render-process-gone", (_event, details) => {
    console.error("[renderer-crash]", details);
  });

  if (app.isPackaged || isPreview) {
    const envSource = await loadRuntimeDatabaseUrl();

    if (!envSource) {
      loadFallbackErrorPage(win, "No se encontró DATABASE_URL para conectarse a la base de datos.");
      return win;
    }

    const isReady = await startNextProductionServer(3000);
    if (!isReady) {
      loadFallbackErrorPage(win, "No se pudo iniciar el servidor interno de la aplicación.");
      return win;
    }
    win.loadURL("http://127.0.0.1:3000");
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

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (nextHttpServer?.listening) {
    nextHttpServer.close();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
