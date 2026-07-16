"use client";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, Button } from "@heroui/react";
import { Sun, Moon, Monitor, Info, Database } from "lucide-react";

const THEMES: Array<{ value: string; label: string; icon: React.ElementType }> = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

const DB_INFO = [
  { label: "Motor", value: "PostgreSQL (nube)" },
  { label: "Conexión", value: "Storage local cifrado (safeStorage)" },
  { label: "ORM", value: "Prisma 7" },
];
const APP_INFO = [
  { label: "Aplicación", value: "Dorada Check" },
  { label: "Versión", value: "0.1.0" },
  { label: "Plataforma", value: "Electron + Next.js" },
];

function InfoTable({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className='space-y-3 text-sm'>
      {rows.map(({ label, value }, i) => (
        <div
          key={label}
          className={`flex justify-between py-2 ${i < rows.length - 1 ? "border-b border-default-100" : ""}`}
        >
          <span className='text-default-500'>{label}</span>
          <span className='font-medium text-xs'>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function ConfiguracionView() {
  const { theme, setTheme } = useTheme();
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [runtimeSource, setRuntimeSource] = useState("none");
  const [isLoadingDbConfig, setIsLoadingDbConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [storageFilePath, setStorageFilePath] = useState("");
  const [encryptionAvailable, setEncryptionAvailable] = useState(false);

  const hasElectronDbApi = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      Boolean(window.electronAPI?.saveDatabaseUrlToStorage) &&
      Boolean(window.electronAPI?.getDatabaseRuntimeStatus)
    );
  }, []);

  useEffect(() => {
    if (!hasElectronDbApi) {
      setIsLoadingDbConfig(false);
      return;
    }

    let mounted = true;

    const loadDbConfig = async () => {
      try {
        const [storedUrl, runtimeStatus] = await Promise.all([
          window.electronAPI.getDatabaseUrlFromStorage(),
          window.electronAPI.getDatabaseRuntimeStatus(),
        ]);

        if (!mounted) return;

        if (storedUrl) setDatabaseUrl(storedUrl);
        setRuntimeSource(runtimeStatus.source);
        setStorageFilePath(runtimeStatus.storageFilePath);
        setEncryptionAvailable(runtimeStatus.encryptionAvailable);
      } catch {
        if (!mounted) return;
        setStatusMessage("No se pudo leer la configuración de base de datos.");
      } finally {
        if (mounted) setIsLoadingDbConfig(false);
      }
    };

    loadDbConfig();

    return () => {
      mounted = false;
    };
  }, [hasElectronDbApi]);

  const handleSaveDatabaseUrl = async () => {
    const value = databaseUrl.trim();
    if (!value) {
      setStatusMessage("Ingresa una URL válida de PostgreSQL.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    try {
      await window.electronAPI.saveDatabaseUrlToStorage(value);
      const runtimeStatus = await window.electronAPI.getDatabaseRuntimeStatus();
      setRuntimeSource(runtimeStatus.source);
      setStorageFilePath(runtimeStatus.storageFilePath);
      setEncryptionAvailable(runtimeStatus.encryptionAvailable);
      setStatusMessage(
        "Conexión guardada en storage local cifrado. Reinicia la app para aplicar completamente.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar en storage local.";
      setStatusMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDatabaseUrl = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      await window.electronAPI.clearDatabaseUrlFromStorage();
      const runtimeStatus = await window.electronAPI.getDatabaseRuntimeStatus();
      setRuntimeSource(runtimeStatus.source);
      setStorageFilePath(runtimeStatus.storageFilePath);
      setEncryptionAvailable(runtimeStatus.encryptionAvailable);
      setDatabaseUrl("");
      setStatusMessage("Conexión eliminada del storage local cifrado.");
    } catch {
      setStatusMessage("No se pudo eliminar la conexión del storage local cifrado.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold'>Configuración</h2>
        <p className='text-sm text-default-500'>Ajustes del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <span className='font-semibold'>Apariencia</span>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-default-500 mb-4'>Selecciona el tema de la interfaz</p>
          <div className='flex gap-3'>
            {THEMES.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? "primary" : "outline"}
                onPress={() => setTheme(value)}
              >
                <Icon className='w-4 h-4 mr-1' />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex items-center gap-2'>
          <Database className='w-4 h-4' />
          <span className='font-semibold'>Base de datos</span>
        </CardHeader>
        <CardContent>
          <InfoTable rows={DB_INFO} />

          <div className='mt-5 space-y-3'>
            <p className='text-xs text-default-500'>
              Estado runtime: {isLoadingDbConfig ? "cargando..." : runtimeSource}
            </p>

            <p className='text-xs text-default-500'>
              Cifrado local:{" "}
              {isLoadingDbConfig ? "cargando..." : encryptionAvailable ? "activo" : "no disponible"}
            </p>

            {hasElectronDbApi ? (
              <>
                <div className='space-y-2'>
                  <label className='text-sm font-medium' htmlFor='db-url-storage'>
                    DATABASE_URL
                  </label>
                  <input
                    id='db-url-storage'
                    className='w-full rounded-medium border border-default-200 bg-background px-3 py-2 text-sm'
                    type='password'
                    placeholder='postgresql://usuario:password@host:puerto/db?schema=dorada'
                    value={databaseUrl}
                    onChange={(event) => setDatabaseUrl(event.target.value)}
                    autoComplete='off'
                  />
                </div>

                {storageFilePath ? (
                  <p className='text-xs text-default-500'>Archivo: {storageFilePath}</p>
                ) : null}

                <div className='flex gap-3'>
                  <Button variant='primary' isDisabled={isSaving} onPress={handleSaveDatabaseUrl}>
                    Guardar en storage cifrado
                  </Button>
                  <Button variant='outline' isDisabled={isSaving} onPress={handleClearDatabaseUrl}>
                    Limpiar storage cifrado
                  </Button>
                </div>

                {statusMessage ? <p className='text-xs text-default-500'>{statusMessage}</p> : null}
              </>
            ) : (
              <p className='text-xs text-warning'>
                Esta configuración solo está disponible en la app de escritorio.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex items-center gap-2'>
          <Info className='w-4 h-4' />
          <span className='font-semibold'>Acerca de</span>
        </CardHeader>
        <CardContent>
          <InfoTable rows={APP_INFO} />
        </CardContent>
      </Card>
    </div>
  );
}
