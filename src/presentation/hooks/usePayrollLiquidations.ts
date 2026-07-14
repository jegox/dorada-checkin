"use client";
import { useCallback, useEffect, useState } from "react";
import type { PayrollLiquidationDTO } from "@/presentation/types";
import { payrollLiquidationService } from "@/presentation/services/payroll-liquidation.service";
import type { SaveResult } from "@/presentation/components/ui/ResultDialog";

export function usePayrollLiquidations() {
  const [liquidations, setLiquidations] = useState<PayrollLiquidationDTO[]>([]);
  const [loading, setLoading]           = useState(true);
  const [running, setRunning]           = useState(false);
  const [saveResult, setSaveResult]     = useState<SaveResult | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try { setLiquidations(await payrollLiquidationService.getAll()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runLiquidation = useCallback(async (year: number, month: number, fortnight: 1 | 2) => {
    setRunning(true);
    try {
      const result = await payrollLiquidationService.run(year, month, fortnight);
      await fetchAll();
      setSaveResult({ type: "success", title: "¡Liquidación completada!", message: `Período: ${result.period} — ${result.liquidations} empleados liquidados.` });
    } catch (err: unknown) {
      setSaveResult({ type: "error", title: "Error en liquidación", message: err instanceof Error ? err.message : "Error" });
    } finally { setRunning(false); }
  }, [fetchAll]);

  return { liquidations, loading, running, saveResult,
    fetchAll, runLiquidation, clearSaveResult: () => setSaveResult(null) };
}
