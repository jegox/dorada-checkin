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
  active?: boolean;
}

export interface UpdateEmployeeDTO {
  document?: string;
  fullName?: string;
  position?: string;
  shiftId?: string;
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

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface CreateSettingDTO {
  key: string;
  value: string;
  active?: boolean;
  employeeIds?: string[];
}

export interface UpdateSettingDTO {
  key?: string;
  value?: string;
  active?: boolean;
  employeeIds?: string[];
}
