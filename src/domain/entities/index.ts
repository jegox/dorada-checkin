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

export interface Setting {
  id: string;
  key: string;
  value: string;
  active: boolean;
  employees?: EmployeeSetting[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSetting {
  id: string;
  settingId: string;
  employeeId: string;
  employee?: Employee;
  setting?: Setting;
  createdAt: Date;
}

export interface Deduction {
  id: string;
  employeeId: string;
  employee?: Employee;
  amount: number;
  date: Date;
  concept: string;
  createdAt: Date;
}

export interface AdditionalPayment {
  id: string;
  employeeId: string;
  employee?: Employee;
  amount: number;
  date: Date;
  concept: string;
  createdAt: Date;
}

export interface PayrollLiquidation {
  id: string;
  period: string;
  startDate: Date;
  endDate: Date;
  employeeId: string;
  employee?: Employee;
  deductions: number;
  amount: number;
  createdAt: Date;
}
