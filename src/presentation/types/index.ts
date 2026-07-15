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

export interface SettingEmployeeDTO {
  id: string;
  fullName: string;
  document: string;
}

export interface SettingDTO {
  id: string;
  key: string;
  value: string;
  active: boolean;
  employees: SettingEmployeeDTO[];
  createdAt: string;
}

export interface DeductionDTO {
  id: string;
  employeeId: string;
  employee: EmployeeDTO;
  amount: number;
  date: string;
  concept: string;
  createdAt: string;
}

export interface AdditionalPaymentDTO {
  id: string;
  employeeId: string;
  employee: EmployeeDTO;
  amount: number;
  date: string;
  concept: string;
  createdAt: string;
}

export interface PayrollLiquidationDTO {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  employeeId: string;
  employee: EmployeeDTO;
  deductions: number;
  amount: number;
  createdAt: string;
}

export interface AttendancePeriodFilterOptionDTO {
  id: string;
  name: string;
  document?: string;
  shiftId?: string;
}

export interface AttendancePeriodRowDTO {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDocument: string;
  shiftId: string;
  shiftName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  novelty: "ENTRADA TARDE" | "ENTRADA A TIEMPO";
}

export interface AttendancePeriodReportDTO {
  period: {
    label: string;
    startDate: string;
    endDate: string;
  };
  filters: {
    employees: AttendancePeriodFilterOptionDTO[];
    shifts: AttendancePeriodFilterOptionDTO[];
  };
  summary: {
    totalCompletedShiftsAmount: number;
    totalLateArrivals: number;
    punctualityPercent: number;
    pendingCheckOuts: number;
  };
  rows: AttendancePeriodRowDTO[];
}

export interface PayrollLiquidatedEmployeeRowDTO {
  employeeId: string;
  employeeName: string;
  employeeDocument: string;
  totalAmount: number;
  totalDeductions: number;
  lateArrivals: number;
  punctualityPercent: number;
}

export interface PayrollLiquidatedReportDTO {
  selectedPeriod: string | null;
  availablePeriods: string[];
  summary: {
    totalAmount: number;
    totalDeductions: number;
    netAmount: number;
  };
  rows: PayrollLiquidatedEmployeeRowDTO[];
}
