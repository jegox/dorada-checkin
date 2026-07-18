import type { EmployeeDTO } from "@/presentation/types";
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from "@/application/dto";
import { readApiResponse } from "@/presentation/services/http";

export const employeeService = {
  async getAll(): Promise<EmployeeDTO[]> {
    const res = await fetch("/api/employees");
    return readApiResponse<EmployeeDTO[]>(res, "Error al obtener empleados");
  },

  async findByDocument(document: string): Promise<EmployeeDTO | null> {
    const res = await fetch(`/api/employees?document=${encodeURIComponent(document)}`);
    if (res.status === 404) return null;
    return readApiResponse<EmployeeDTO>(res, "Error al buscar empleado");
  },

  async create(dto: CreateEmployeeDTO): Promise<EmployeeDTO> {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al crear empleado");
    return data;
  },

  async update(id: string, dto: UpdateEmployeeDTO): Promise<EmployeeDTO> {
    const res = await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar empleado");
    return data;
  },

  async toggleActive(id: string, active: boolean): Promise<EmployeeDTO> {
    return employeeService.update(id, { active });
  },
};
