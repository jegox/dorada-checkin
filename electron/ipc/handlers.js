import { ipcMain, app } from "electron";

export function registerIpcHandlers() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("get-app-version", () => app.getVersion());
}
