export {};

declare global {
  interface Window {
    electronAPI: {
      testDatabaseConnection: (databaseUrl?: string) => Promise<{
        ok: boolean;
        reason: string;
        code: string;
        message: string;
        database?: string | null;
        schema?: string | null;
        targetSchema?: string | null;
        searchPath?: string | null;
      }>;
      ping: () => Promise<string>;
      getAppVersion: () => Promise<string>;
      getDatabaseRuntimeStatus: () => Promise<{
        processHasUrl: boolean;
        localStorageHasUrl: boolean;
        storageFilePath: string;
        encryptionAvailable: boolean;
        source: "runtime" | "local-storage" | "none";
      }>;
      getDatabaseUrlFromStorage: () => Promise<string | null>;
      saveDatabaseUrlToStorage: (databaseUrl: string) => Promise<{ ok: true }>;
      clearDatabaseUrlFromStorage: () => Promise<{ ok: true }>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}
