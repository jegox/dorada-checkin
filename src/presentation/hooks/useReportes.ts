"use client";
import { useCallback, useEffect, useState } from "react";
import type { AttendanceDTO, ReportDayDTO, ReportTotalsDTO } from "@/presentation/types";
import { reportService } from "@/presentation/services/report.service";

export const REPORT_RANGES = [
  { label: "Hoy", days: 0 },
  { label: "7 días", days: 6 },
  { label: "30 días", days: 29 },
] as const;

interface UseReportesReturn {
  days: ReportDayDTO[];
  totals: ReportTotalsDTO;
  records: AttendanceDTO[];
  loading: boolean;
  error: string;
  rangeIdx: number;
  puntualidad: number;
  maxCheckIns: number;
  setRangeIdx: (i: number) => void;
}

const EMPTY_TOTALS: ReportTotalsDTO = { checkIns: 0, checkOuts: 0, late: 0, onTime: 0 };

export function useReportes(): UseReportesReturn {
  const [loading, setLoading] = useState(true);
  const [rangeIdx, setRangeIdx] = useState(1);
  const [days, setDays] = useState<ReportDayDTO[]>([]);
  const [totals, setTotals] = useState<ReportTotalsDTO>(EMPTY_TOTALS);
  const [records, setRecords] = useState<AttendanceDTO[]>([]);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async (rangeDays: number) => {
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      const to = now.toISOString().slice(0, 10);
      const fromDate = new Date(now);
      fromDate.setDate(now.getDate() - rangeDays);
      const from = fromDate.toISOString().slice(0, 10);

      const data = await reportService.getReport(from, to);
      setDays(data.days ?? []);
      setTotals(data.totals ?? EMPTY_TOTALS);
      setRecords(data.records ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar reporte");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(REPORT_RANGES[rangeIdx].days); }, [rangeIdx, fetchReport]);

  const puntualidad = totals.checkIns > 0
    ? Math.round((totals.onTime / totals.checkIns) * 100)
    : 0;
  const maxCheckIns = Math.max(...days.map((d) => d.checkIns), 1);

  return { days, totals, records, loading, error, rangeIdx, puntualidad, maxCheckIns, setRangeIdx };
}
