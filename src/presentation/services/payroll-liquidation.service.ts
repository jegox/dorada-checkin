import type { PayrollLiquidationDTO } from "@/presentation/types";

export const payrollLiquidationService = {
  async getAll(period?: string): Promise<PayrollLiquidationDTO[]> {
    const url = period
      ? `/api/payroll-liquidations?period=${encodeURIComponent(period)}`
      : "/api/payroll-liquidations";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener liquidaciones");
    return res.json();
  },

  async run(
    year: number,
    month: number,
    fortnight: 1 | 2,
  ): Promise<{ period: string; liquidations: number }> {
    const res = await fetch("/api/payroll/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, fortnight }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al ejecutar liquidación");
    return data;
  },
};
