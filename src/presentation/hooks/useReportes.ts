"use client";
import { useCallback, useEffect, useState } from "react";
import type { AttendancePeriodReportDTO, PayrollLiquidatedReportDTO } from "@/presentation/types";
import { reportService } from "@/presentation/services/report.service";

type ActiveTab = "empleados" | "nomina";

interface UseReportesReturn {
  activeTab: ActiveTab;
  loading: boolean;
  error: string;
  attendance: AttendancePeriodReportDTO | null;
  payroll: PayrollLiquidatedReportDTO | null;
  selectedEmployeeId: string;
  selectedShiftId: string;
  selectedPeriod: string;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedEmployeeId: (id: string) => void;
  setSelectedShiftId: (id: string) => void;
  setSelectedPeriod: (period: string) => void;
  refreshAttendance: () => Promise<void>;
  refreshPayroll: () => Promise<void>;
}

export function useReportes(): UseReportesReturn {
  const [activeTab, setActiveTab] = useState<ActiveTab>("empleados");
  const [attendance, setAttendance] = useState<AttendancePeriodReportDTO | null>(null);
  const [payroll, setPayroll] = useState<PayrollLiquidatedReportDTO | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingPayroll, setLoadingPayroll] = useState(true);
  const [error, setError] = useState("");

  const refreshAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    setError("");
    try {
      const data = await reportService.getAttendanceReport({
        employeeId: selectedEmployeeId || undefined,
        shiftId: selectedShiftId || undefined,
      });
      setAttendance(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar reporte");
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedEmployeeId, selectedShiftId]);

  const refreshPayroll = useCallback(async () => {
    setLoadingPayroll(true);
    setError("");
    try {
      const data = await reportService.getPayrollReport(selectedPeriod || undefined);
      setPayroll(data);
      if (!selectedPeriod && data.selectedPeriod) {
        setSelectedPeriod(data.selectedPeriod);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar reporte de nomina");
    } finally {
      setLoadingPayroll(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    refreshAttendance();
  }, [refreshAttendance]);

  useEffect(() => {
    refreshPayroll();
  }, [refreshPayroll]);

  return {
    activeTab,
    loading: loadingAttendance || loadingPayroll,
    error,
    attendance,
    payroll,
    selectedEmployeeId,
    selectedShiftId,
    selectedPeriod,
    setActiveTab,
    setSelectedEmployeeId,
    setSelectedShiftId,
    setSelectedPeriod,
    refreshAttendance,
    refreshPayroll,
  };
}
