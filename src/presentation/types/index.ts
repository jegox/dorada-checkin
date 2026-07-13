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
