import type { ShiftDTO } from "@/presentation/types";
import type { CreateShiftDTO } from "@/application/dto";
import { readApiResponse } from "@/presentation/services/http";

export const shiftService = {
  async getAll(): Promise<ShiftDTO[]> {
    const res = await fetch("/api/shifts");
    return readApiResponse<ShiftDTO[]>(res, "Error al obtener turnos");
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
