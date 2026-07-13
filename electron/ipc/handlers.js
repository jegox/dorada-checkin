import { ipcMain, app } from "electron";
import http from "http";

// ─── Cron: liquidación de nómina ─────────────────────────────────────────────
// Ejecuta todos los 15 y último día del mes a las 23:45
function schedulePayrollCron() {
  function triggerIfNeeded() {
    const now = new Date();
    const h = now.getHours();
    const min = now.getMinutes();
    const day = now.getDate();
    const month = now.getMonth(); // 0-indexed
    const year = now.getFullYear();
    const lastDay = new Date(year, month + 1, 0).getDate();

    if (h !== 23 || min !== 45) return;

    let fortnight = null;
    if (day === 15) fortnight = 1;
    if (day === lastDay) fortnight = 2;
    if (!fortnight) return;

    const body = JSON.stringify({ year, month, fortnight });
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/payroll/run",
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => console.log("[payroll-cron] result:", data));
      },
    );
    req.on("error", (e) => console.error("[payroll-cron] error:", e.message));
    req.write(body);
    req.end();
  }

  // Verificar cada minuto
  setInterval(triggerIfNeeded, 60_000);
}

export function registerIpcHandlers() {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("get-app-version", () => app.getVersion());

  // Iniciar scheduler de nómina
  schedulePayrollCron();
}
