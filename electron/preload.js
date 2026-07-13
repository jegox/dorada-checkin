const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("ping"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  // C-5: solo URLs HTTP/HTTPS permitidas
  openExternal: (url) => {
    if (typeof url === "string" && /^https?:\/\//.test(url)) {
      shell.openExternal(url);
    }
  },
});
