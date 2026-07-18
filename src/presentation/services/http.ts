export async function readApiResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const raw = await res.text();
  const trimmed = raw.trim();

  let parsed: unknown = null;
  if (trimmed) {
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const apiMessage =
      parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error?: unknown }).error ?? "")
        : "";
    const message = apiMessage || trimmed || fallbackMessage;
    throw new Error(message);
  }

  if (parsed === null) {
    throw new Error(`Respuesta inválida del servidor: ${trimmed.slice(0, 120) || "vacía"}`);
  }

  return parsed as T;
}
