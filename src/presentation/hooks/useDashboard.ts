"use client";
import { useEffect, useState } from "react";
import type { DashboardSummaryDTO } from "@/presentation/types";
import { dashboardService } from "@/presentation/services/dashboard.service";

interface UseDashboardReturn {
  summary: DashboardSummaryDTO | null;
  loading: boolean;
  error: string | null;
  updatedAt: string;
}

export function useDashboard(): UseDashboardReturn {
  const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    dashboardService
      .getSummary()
      .then((data) => {
        setSummary(data);
        setUpdatedAt(new Date().toLocaleTimeString("es-CO"));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Error al cargar datos"),
      )
      .finally(() => setLoading(false));
  }, []);

  return { summary, loading, error, updatedAt };
}
