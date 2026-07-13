import type { AdditionalPaymentDTO } from "@/presentation/types";

export const additionalPaymentService = {
  async getAll(employeeId?: string): Promise<AdditionalPaymentDTO[]> {
    const url = employeeId
      ? `/api/additional-payments?employeeId=${employeeId}`
      : "/api/additional-payments";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener pagos adicionales");
    return res.json();
  },

  async create(dto: {
    employeeId: string;
    amount: number;
    date: string;
    concept: string;
  }): Promise<AdditionalPaymentDTO> {
    const res = await fetch("/api/additional-payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al crear pago adicional");
    return data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/additional-payments/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar pago adicional");
  },
};
