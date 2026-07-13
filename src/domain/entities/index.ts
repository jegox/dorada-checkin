// Domain Entity — Employee
export interface Employee {
  id: string;
  document: string;
  fullName: string;
  position: string;
  active: boolean;
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
  createdAt: Date;
}
