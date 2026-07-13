// Tipos compartidos para el IPC entre main y renderer
export interface ElectronAPI {
  ping: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}
