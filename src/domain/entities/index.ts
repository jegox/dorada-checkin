// Domain Entity — Employee
export interface Employee {
  id: string;
  document: string;
  fullName: string;
  position: string;
  active: boolean;
  baseSalary: number;
  salaryPeriod: "DIA" | "MENSUAL";
  shiftId: string;
  shift?: Shift;
  payrollRules?: EmployeePayrollRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  createdAt: Date;
  updatedAt: Date;
}

export type AttendanceType = "CHECK_IN" | "CHECK_OUT";
export type AttendanceStatus = "ON_TIME" | "LATE" | "EARLY";

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  type: AttendanceType;
  status: AttendanceStatus;
  createdAt: Date;
}

export type PayrollRuleType = "DESCUENTO" | "CREDITO" | "BONO" | "TURNO_EXTRA";

export interface PayrollRule {
  id: string;
  name: string;
  type: PayrollRuleType;
  amount: number;
  description?: string | null;
  active: boolean;
  period: "DIA" | "MENSUAL";
  activeDays: number[] | null; // null = siempre; [0-6] = días específicos (0=Dom)
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeePayrollRule {
  id: string;
  employeeId: string;
  ruleId: string;
  rule?: PayrollRule;
  createdAt: Date;
}
