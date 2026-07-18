import type { DashboardDataDTO } from "@/presentation/types";
import { readApiResponse } from "@/presentation/services/http";

export interface DashboardFiltersInput {
  startDate: string;
  endDate: string;
  employeeId?: string;
  shiftId?: string;
}

export interface DashboardServiceResponse extends DashboardDataDTO {
  period: {
    startDate: string;
    endDate: string;
    minDate: string;
    maxDate: string;
  };
}

export const dashboardService = {
  async getDashboardData(filters: DashboardFiltersInput): Promise<DashboardServiceResponse> {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    if (filters.employeeId) params.set("employeeId", filters.employeeId);
    if (filters.shiftId) params.set("shiftId", filters.shiftId);

    const res = await fetch(`/api/dashboard?${params.toString()}`);
    return readApiResponse<DashboardServiceResponse>(res, "Error al cargar datos del dashboard");
  },
};
