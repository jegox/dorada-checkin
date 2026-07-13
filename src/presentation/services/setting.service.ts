import type { SettingDTO } from "@/presentation/types";
import type { CreateSettingDTO, UpdateSettingDTO } from "@/application/dto";

export const settingService = {
  async getAll(): Promise<SettingDTO[]> {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("Error al obtener configuraciones");
    return res.json();
  },

  async create(dto: CreateSettingDTO): Promise<SettingDTO> {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al crear configuración");
    return data;
  },

  async update(id: string, dto: UpdateSettingDTO): Promise<SettingDTO> {
    const res = await fetch(`/api/settings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar configuración");
    return data;
  },

  async toggleActive(id: string, active: boolean): Promise<SettingDTO> {
    return settingService.update(id, { active });
  },
};
