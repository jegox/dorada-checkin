import { ipcMain, app, safeStorage } from "electron";
import {
  getDatabaseStorageFilePath,
  isValidDatabaseUrl,
  readDatabaseUrlFromStorage,
  removeDatabaseUrlFromStorage,
  saveDatabaseUrlToStorage,
} from "../runtime/database-credentials.js";

export function registerIpcHandlers() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("get-app-version", () => app.getVersion());

  ipcMain.handle("db:get-runtime-status", async () => {
    const userDataPath = app.getPath("userData");
    const processHasUrl = Boolean(process.env.DATABASE_URL);
    const localStorageUrl = await readDatabaseUrlFromStorage(userDataPath);

    return {
      processHasUrl,
      localStorageHasUrl: Boolean(localStorageUrl),
      storageFilePath: getDatabaseStorageFilePath(userDataPath),
      encryptionAvailable: safeStorage.isEncryptionAvailable(),
      source: processHasUrl ? "runtime" : localStorageUrl ? "local-storage" : "none",
    };
  });

  ipcMain.handle("db:storage-save", async (_event, databaseUrl) => {
    const userDataPath = app.getPath("userData");
    const value = String(databaseUrl || "").trim();
    if (!isValidDatabaseUrl(value)) {
      throw new Error("La URL debe iniciar con postgres:// o postgresql://");
    }

    await saveDatabaseUrlToStorage(userDataPath, value);
    process.env.DATABASE_URL = value;

    return { ok: true };
  });

  ipcMain.handle("db:storage-read", async () => {
    const userDataPath = app.getPath("userData");
    const value = await readDatabaseUrlFromStorage(userDataPath);
    return value;
  });

  ipcMain.handle("db:storage-clear", async () => {
    const userDataPath = app.getPath("userData");
    await removeDatabaseUrlFromStorage(userDataPath);
    delete process.env.DATABASE_URL;
    return { ok: true };
  });
}
