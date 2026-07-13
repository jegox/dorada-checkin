export {};

declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<string>;
      getAppVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}
