import { ipcMain, app, safeStorage } from "electron";
import { Client } from "pg";
import {
  getDatabaseStorageFilePath,
  isValidDatabaseUrl,
  readDatabaseUrlFromStorage,
  removeDatabaseUrlFromStorage,
  saveDatabaseUrlToStorage,
} from "../runtime/database-credentials.js";

const DB_TEST_TIMEOUT_MS = 7000;

function getSchemaFromConnectionString(connectionString) {
  try {
    const parsed = new URL(connectionString);
    const schema = parsed.searchParams.get("schema")?.trim();
    return schema || "public";
  } catch {
    return "public";
  }
}

function normalizeDbError(error) {
  if (!error) {
    return {
      reason: "unknown",
      code: "UNKNOWN",
      message: "No se pudo conectar a PostgreSQL.",
    };
  }

  const code = String(error.code || "UNKNOWN");
  const rawMessage = String(error.message || "");

  if (code === "ENOTFOUND") {
    return {
      reason: "dns",
      code,
      message: "No se pudo resolver el host de PostgreSQL.",
    };
  }

  if (code === "ECONNREFUSED") {
    return {
      reason: "refused",
      code,
      message: "El servidor rechazó la conexión al puerto indicado.",
    };
  }

  if (code === "ETIMEDOUT") {
    return {
      reason: "timeout",
      code,
      message: "La conexión agotó el tiempo de espera.",
    };
  }

  if (code === "28P01") {
    return {
      reason: "auth",
      code,
      message: "Usuario o contraseña inválidos para PostgreSQL.",
    };
  }

  if (code === "3D000") {
    return {
      reason: "database",
      code,
      message: "La base de datos indicada no existe.",
    };
  }

  if (code === "42501") {
    return {
      reason: "permissions",
      code,
      message: "El usuario no tiene permisos suficientes.",
    };
  }

  if (/self signed certificate/i.test(rawMessage)) {
    return {
      reason: "tls",
      code,
      message: "Error TLS: certificado no confiable. Revisa sslmode en la URL.",
    };
  }

  return {
    reason: "unknown",
    code,
    message: rawMessage || "No se pudo conectar a PostgreSQL.",
  };
}

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

  ipcMain.handle("db:test-connection", async (_event, databaseUrl) => {
    const candidate = String(databaseUrl || process.env.DATABASE_URL || "").trim();

    if (!candidate) {
      return {
        ok: false,
        reason: "missing-url",
        code: "MISSING_URL",
        message: "No hay DATABASE_URL disponible para probar.",
      };
    }

    if (!isValidDatabaseUrl(candidate)) {
      return {
        ok: false,
        reason: "invalid-url",
        code: "INVALID_URL",
        message: "La URL debe iniciar con postgres:// o postgresql://",
      };
    }

    const client = new Client({
      connectionString: candidate,
      connectionTimeoutMillis: DB_TEST_TIMEOUT_MS,
      statement_timeout: DB_TEST_TIMEOUT_MS,
      query_timeout: DB_TEST_TIMEOUT_MS,
    });
    const targetSchema = getSchemaFromConnectionString(candidate);

    try {
      await client.connect();
      // Alinea la prueba con el schema indicado en la URL (schema=...)
      await client.query("select set_config('search_path', $1, false)", [targetSchema]);
      const result = await client.query(
        "select current_database() as database, current_schema() as schema, current_setting('search_path') as search_path",
      );
      return {
        ok: true,
        reason: "connected",
        code: "OK",
        message: "Conexión exitosa a PostgreSQL.",
        database: result.rows?.[0]?.database || null,
        schema: result.rows?.[0]?.schema || null,
        targetSchema,
        searchPath: result.rows?.[0]?.search_path || null,
      };
    } catch (error) {
      const normalized = normalizeDbError(error);
      return {
        ok: false,
        ...normalized,
      };
    } finally {
      await client.end().catch(() => {});
    }
  });
}
