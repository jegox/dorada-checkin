const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("ping"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getDatabaseRuntimeStatus: () => ipcRenderer.invoke("db:get-runtime-status"),
  getDatabaseUrlFromStorage: () => ipcRenderer.invoke("db:storage-read"),
  saveDatabaseUrlToStorage: (databaseUrl) => ipcRenderer.invoke("db:storage-save", databaseUrl),
  clearDatabaseUrlFromStorage: () => ipcRenderer.invoke("db:storage-clear"),
  // C-5: solo URLs HTTP/HTTPS permitidas
  openExternal: (url) => {
    if (typeof url === "string" && /^https?:\/\//.test(url)) {
      shell.openExternal(url);
    }
  },
});
