import type { ReportDayDTO, ReportTotalsDTO, AttendanceDTO } from "@/presentation/types";

export interface ReportResult {
  days: ReportDayDTO[];
  totals: ReportTotalsDTO;
  records: AttendanceDTO[];
}

export const reportService = {
  async getReport(from: string, to: string): Promise<ReportResult> {
    const res = await fetch(`/api/reports?from=${from}&to=${to}`);
    if (!res.ok) throw new Error("Error al cargar reporte");
    return res.json();
  },
};
