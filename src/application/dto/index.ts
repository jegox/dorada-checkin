import type { AttendanceType, AttendanceStatus } from "@/domain/entities";

// ─── Input DTOs ───────────────────────────────────────────────────────────────

export interface CreateShiftDTO {
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface CreateEmployeeDTO {
  document: string;
  fullName: string;
  position: string;
  shiftId: string;
  baseSalary?: number;
  salaryPeriod?: "DIA" | "MENSUAL";
  active?: boolean;
}

export interface UpdateEmployeeDTO {
  document?: string;
  fullName?: string;
  position?: string;
  shiftId?: string;
  baseSalary?: number;
  salaryPeriod?: "DIA" | "MENSUAL";
  active?: boolean;
}

export interface RegisterAttendanceInputDTO {
  document: string;
  type: AttendanceType;
}

export interface GetReportInputDTO {
  from: Date;
  to: Date;
}

// ─── Output DTOs ─────────────────────────────────────────────────────────────

export interface ReportDayOutputDTO {
  date: string;
  checkIns: number;
  checkOuts: number;
  late: number;
}

export interface ReportTotalsOutputDTO {
  checkIns: number;
  checkOuts: number;
  late: number;
  onTime: number;
}

export interface ReportAttendanceItemDTO {
  id: string;
  type: AttendanceType;
  status: AttendanceStatus;
  createdAt: string;
  employee: {
    id: string;
    document: string;
    fullName: string;
    position: string;
    shift: { name: string; startTime: string; endTime: string } | null;
  };
}

export interface GetReportOutputDTO {
  days: ReportDayOutputDTO[];
  totals: ReportTotalsOutputDTO;
  records: ReportAttendanceItemDTO[];
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export type PayrollRuleType = "DESCUENTO" | "CREDITO" | "BONO" | "TURNO_EXTRA";

export interface CreatePayrollRuleDTO {
  name: string;
  type: PayrollRuleType;
  amount: number;
  description?: string;
  period?: "DIA" | "MENSUAL";
  activeDays?: number[] | null;
}

export interface UpdatePayrollRuleDTO {
  name?: string;
  amount?: number;
  description?: string | null;
  active?: boolean;
  period?: "DIA" | "MENSUAL";
  activeDays?: number[] | null;
}

export interface AssignRuleDTO {
  employeeId: string;
  ruleId: string;
}

export interface LiquidacionItemDTO {
  employeeId: string;
  document: string;
  fullName: string;
  position: string;
  shift: string;
  baseSalary: number;
  quincenal: number; // baseSalary / 2
  creditos: number;
  bonos: number;
  turnosExtras: number;
  descuentos: number;
  total: number;
  rules: Array<{ name: string; type: PayrollRuleType; amount: number }>;
}

export interface GetLiquidacionOutputDTO {
  period: { from: string; to: string; label: string };
  items: LiquidacionItemDTO[];
  grandTotal: number;
}
