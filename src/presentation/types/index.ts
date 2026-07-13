export interface ShiftDTO {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  _count?: { employees: number };
}

export interface EmployeeDTO {
  id: string;
  document: string;
  fullName: string;
  position: string;
  active: boolean;
  baseSalary: number;
  salaryPeriod: "DIA" | "MENSUAL";
  shiftId: string;
  shift: ShiftDTO;
}

export interface AttendanceDTO {
  id: string;
  type: "CHECK_IN" | "CHECK_OUT";
  status: "ON_TIME" | "LATE" | "EARLY";
  createdAt: string;
  employee: EmployeeDTO;
}

export interface DashboardSummaryDTO {
  checkIns: number;
  checkOuts: number;
  late: number;
  activeEmployees: number;
}

export interface ReportTotalsDTO {
  checkIns: number;
  checkOuts: number;
  late: number;
  onTime: number;
}

export interface ReportDayDTO {
  date: string;
  checkIns: number;
  checkOuts: number;
  late: number;
}

export type PayrollRuleType = "DESCUENTO" | "CREDITO" | "BONO" | "TURNO_EXTRA";

export interface PayrollRuleDTO {
  id: string;
  name: string;
  type: PayrollRuleType;
  amount: number;
  description?: string | null;
  active: boolean;
  period: "DIA" | "MENSUAL";
  activeDays: number[] | null;
  createdAt: string;
}

export interface EmployeeRuleDTO {
  id: string;
  employeeId: string;
  ruleId: string;
  rule: PayrollRuleDTO;
  createdAt: string;
}

export interface LiquidacionItemDTO {
  employeeId: string;
  document: string;
  fullName: string;
  position: string;
  shift: string;
  baseSalary: number;
  quincenal: number;
  creditos: number;
  bonos: number;
  turnosExtras: number;
  descuentos: number;
  total: number;
  rules: Array<{ name: string; type: PayrollRuleType; amount: number }>;
}

export interface LiquidacionDTO {
  period: { from: string; to: string; label: string };
  items: LiquidacionItemDTO[];
  grandTotal: number;
}
