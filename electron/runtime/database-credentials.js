import fs from "fs";
import path from "path";
import { safeStorage } from "electron";

const STORAGE_FILE_NAME = "database-credentials.json";
const STORAGE_VERSION = 2;

export function isValidDatabaseUrl(value) {
  return /^postgres(?:ql)?:\/\//i.test(value);
}

function getStorageFilePath(userDataPath) {
  return path.join(userDataPath, STORAGE_FILE_NAME);
}

function encodeEncryptedValue(value) {
  return safeStorage.encryptString(value).toString("base64");
}

function decodeEncryptedValue(value) {
  const buffer = Buffer.from(value, "base64");
  return safeStorage.decryptString(buffer);
}

function canUseEncryption() {
  return safeStorage.isEncryptionAvailable();
}

async function writeStorageFile(filePath, databaseUrl) {
  await fs.promises.writeFile(
    filePath,
    JSON.stringify(
      {
        version: STORAGE_VERSION,
        encrypted: true,
        cipherText: encodeEncryptedValue(databaseUrl),
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
}

function getLegacyPlainValue(parsed) {
  if (typeof parsed?.databaseUrl !== "string") return "";
  return parsed.databaseUrl.trim();
}

export async function readDatabaseUrlFromStorage(userDataPath) {
  const filePath = getStorageFilePath(userDataPath);

  try {
    if (!fs.existsSync(filePath)) return null;

    const content = await fs.promises.readFile(filePath, "utf8");
    const parsed = JSON.parse(content);

    if (parsed?.encrypted === true && typeof parsed?.cipherText === "string") {
      if (!canUseEncryption()) {
        throw new Error("safeStorage no está disponible para descifrar la configuración local.");
      }

      const decryptedValue = decodeEncryptedValue(parsed.cipherText).trim();
      return decryptedValue || null;
    }

    // Migración automática desde formato legado en texto plano.
    const value = getLegacyPlainValue(parsed);
    if (value) {
      if (!canUseEncryption()) {
        throw new Error("safeStorage no está disponible para migrar configuración heredada.");
      }

      await writeStorageFile(filePath, value);
      return value;
    }

    return value || null;
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function saveDatabaseUrlToStorage(userDataPath, connectionString) {
  const normalized = String(connectionString || "").trim();
  if (!normalized) {
    throw new Error("La conexión no puede estar vacía");
  }
  if (!isValidDatabaseUrl(normalized)) {
    throw new Error("La conexión debe iniciar con postgres:// o postgresql://");
  }
  if (!canUseEncryption()) {
    throw new Error("safeStorage no está disponible en este sistema.");
  }

  const filePath = getStorageFilePath(userDataPath);
  await fs.promises.mkdir(userDataPath, { recursive: true });
  await writeStorageFile(filePath, normalized);
}

export async function removeDatabaseUrlFromStorage(userDataPath) {
  const filePath = getStorageFilePath(userDataPath);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export function getDatabaseStorageFilePath(userDataPath) {
  return getStorageFilePath(userDataPath);
}
