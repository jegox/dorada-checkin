import type { ShiftDTO } from "@/presentation/types";
import type { CreateShiftDTO } from "@/application/dto";

export const shiftService = {
  async getAll(): Promise<ShiftDTO[]> {
    const res = await fetch("/api/shifts");
    if (!res.ok) throw new Error("Error al obtener turnos");
    return res.json();
  },

  async create(dto: CreateShiftDTO): Promise<ShiftDTO> {
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al crear turno");
    return data;
  },
};
