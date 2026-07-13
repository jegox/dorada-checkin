import type { DashboardSummaryDTO } from "@/presentation/types";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryDTO> {
    const res = await fetch("/api/dashboard");
    if (!res.ok) throw new Error("Error al cargar datos del dashboard");
    return res.json();
  },
};
