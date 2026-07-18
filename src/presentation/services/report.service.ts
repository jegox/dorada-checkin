import type { AttendancePeriodReportDTO, PayrollLiquidatedReportDTO } from "@/presentation/types";
import { readApiResponse } from "@/presentation/services/http";

export const reportService = {
  async getAttendanceReport(filters?: {
    employeeId?: string;
    shiftId?: string;
  }): Promise<AttendancePeriodReportDTO> {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.set("employeeId", filters.employeeId);
    if (filters?.shiftId) params.set("shiftId", filters.shiftId);

    const url = params.toString()
      ? `/api/reports/attendance?${params.toString()}`
      : "/api/reports/attendance";

    const res = await fetch(url);
    return readApiResponse<AttendancePeriodReportDTO>(res, "Error al cargar reporte de empleados");
  },

  async getPayrollReport(period?: string): Promise<PayrollLiquidatedReportDTO> {
    const url = period
      ? `/api/reports/payroll?period=${encodeURIComponent(period)}`
      : "/api/reports/payroll";

    const res = await fetch(url);
    return readApiResponse<PayrollLiquidatedReportDTO>(res, "Error al cargar reporte de nomina");
  },
};
