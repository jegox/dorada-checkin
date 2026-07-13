import type { PayrollRuleDTO, EmployeeRuleDTO } from "@/presentation/types";

export const payrollRuleService = {
  async getAll(): Promise<PayrollRuleDTO[]> {
    const res = await fetch("/api/payroll-rules");
    if (!res.ok) throw new Error("Error al obtener reglas de nómina");
    return res.json();
  },

  async create(dto: {
    name: string;
    type: string;
    amount: number;
    description?: string;
    period?: string;
    activeDays?: number[] | null;
  }): Promise<PayrollRuleDTO> {
    const res = await fetch("/api/payroll-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al crear regla");
    return data;
  },

  async update(
    id: string,
    dto: {
      name?: string;
      amount?: number;
      description?: string | null;
      active?: boolean;
      period?: string;
      activeDays?: number[] | null;
    },
  ): Promise<PayrollRuleDTO> {
    const res = await fetch(`/api/payroll-rules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar regla");
    return data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/payroll-rules/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar regla");
  },

  async getByEmployee(employeeId: string): Promise<EmployeeRuleDTO[]> {
    const res = await fetch(`/api/employees/${employeeId}/rules`);
    if (!res.ok) throw new Error("Error al obtener reglas del empleado");
    return res.json();
  },

  async assign(employeeId: string, ruleId: string): Promise<EmployeeRuleDTO> {
    const res = await fetch(`/api/employees/${employeeId}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al asignar regla");
    return data;
  },

  async remove(employeeId: string, ruleId: string): Promise<void> {
    const res = await fetch(`/api/employees/${employeeId}/rules/${ruleId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al quitar regla");
  },
};
