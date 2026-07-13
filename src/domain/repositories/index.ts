import type {
  Employee,
  Shift,
  Attendance,
  AttendanceType,
  AttendanceStatus,
  Setting,
  EmployeeSetting,
} from "@/domain/entities";

export interface IEmployeeRepository {
  findAll(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  findByDocument(document: string): Promise<Employee | null>;
  create(data: Omit<Employee, "id" | "createdAt" | "updatedAt">): Promise<Employee>;
  update(id: string, data: Partial<Employee>): Promise<Employee>;
}

export interface IShiftRepository {
  findAll(): Promise<Shift[]>;
  findById(id: string): Promise<Shift | null>;
  create(data: Omit<Shift, "id" | "createdAt" | "updatedAt">): Promise<Shift>;
}

export interface IAttendanceRepository {
  findAll(): Promise<Attendance[]>;
  findByDate(date: Date): Promise<Attendance[]>;
  findByDateRange(from: Date, to: Date): Promise<Attendance[]>;
  findTodaySummary(): Promise<{
    checkIns: number;
    checkOuts: number;
    late: number;
    activeEmployees: number;
  }>;
  create(data: {
    employeeId: string;
    type: AttendanceType;
    status: AttendanceStatus;
  }): Promise<Attendance>;
}

export interface ISettingRepository {
  findAll(): Promise<Setting[]>;
  findById(id: string): Promise<Setting | null>;
  create(data: {
    key: string;
    value: string;
    active?: boolean;
    employeeIds?: string[];
  }): Promise<Setting>;
  update(
    id: string,
    data: {
      key?: string;
      value?: string;
      active?: boolean;
      employeeIds?: string[];
    },
  ): Promise<Setting>;
  setActive(id: string, active: boolean): Promise<Setting>;
  findEmployeeLinks(settingId: string): Promise<EmployeeSetting[]>;
}
