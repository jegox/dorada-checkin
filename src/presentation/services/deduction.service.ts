import type { DeductionDTO } from "@/presentation/types";

export const deductionService = {
  async getAll(employeeId?: string): Promise<DeductionDTO[]> {
    const url = employeeId ? `/api/deductions?employeeId=${employeeId}` : "/api/deductions";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener deducciones");
    return res.json();
  },

  async create(dto: {
    employeeId: string;
    amount: number;
    date: string;
    concept: string;
  }): Promise<DeductionDTO> {
    const res = await fetch("/api/deductions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al crear deducción");
    return data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/deductions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar deducción");
  },
};
