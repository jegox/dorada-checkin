"use client";
import { useEffect, useMemo, useState } from "react";
import type { DashboardDataDTO } from "@/presentation/types";
import {
  dashboardService,
  type DashboardFiltersInput,
  type DashboardServiceResponse,
} from "@/presentation/services/dashboard.service";

function getDefaultRange() {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - 6);

  const toInputDate = (value: Date) => {
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  };

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

interface UseDashboardReturn {
  data: DashboardDataDTO | null;
  loading: boolean;
  error: string | null;
  updatedAt: string;
  startDate: string;
  endDate: string;
  employeeId: string;
  shiftId: string;
  minDate: string;
  maxDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setEmployeeId: (value: string) => void;
  setShiftId: (value: string) => void;
}

export function useDashboard(): UseDashboardReturn {
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [data, setData] = useState<DashboardDataDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");

  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [employeeId, setEmployeeId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    const filters: DashboardFiltersInput = {
      startDate,
      endDate,
      employeeId,
      shiftId,
    };

    setLoading(true);
    setError(null);

    dashboardService
      .getDashboardData(filters)
      .then((response: DashboardServiceResponse) => {
        setData({
          summary: response.summary,
          filters: response.filters,
          rows: response.rows,
        });
        setMinDate(response.period.minDate);
        setMaxDate(response.period.maxDate);
        setUpdatedAt(new Date().toLocaleTimeString("es-CO"));
      })
      .catch((err: unknown) => {
        setData(null);
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate, employeeId, shiftId]);

  return {
    data,
    loading,
    error,
    updatedAt,
    startDate,
    endDate,
    employeeId,
    shiftId,
    minDate,
    maxDate,
    setStartDate,
    setEndDate,
    setEmployeeId,
    setShiftId,
  };
}
