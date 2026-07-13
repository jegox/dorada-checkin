import type { LiquidacionDTO } from "@/presentation/types";

export const liquidacionService = {
  async get(year: number, month: number, fortnight: 1 | 2): Promise<LiquidacionDTO> {
    const res = await fetch(`/api/reports/liquidacion?year=${year}&month=${month}&fortnight=${fortnight}`);
    if (!res.ok) throw new Error("Error al obtener liquidación");
    return res.json();
  },
};
