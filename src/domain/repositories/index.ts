import type {
  Employee,
  Shift,
  Attendance,
  AttendanceType,
  AttendanceStatus,
  PayrollRule,
  PayrollRuleType,
  EmployeePayrollRule,
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

export interface IPayrollRuleRepository {
  findAll(): Promise<PayrollRule[]>;
  findById(id: string): Promise<PayrollRule | null>;
  create(data: {
    name: string;
    type: PayrollRuleType;
    amount: number;
    description?: string;
    period?: string;
    activeDays?: number[] | null;
  }): Promise<PayrollRule>;
  update(
    id: string,
    data: {
      name?: string;
      amount?: number;
      description?: string | null;
      active?: boolean;
      period?: string;
      activeDays?: number[] | null;
    },
  ): Promise<PayrollRule>;
  delete(id: string): Promise<void>;
  assignToEmployee(employeeId: string, ruleId: string): Promise<EmployeePayrollRule>;
  removeFromEmployee(employeeId: string, ruleId: string): Promise<void>;
  findByEmployee(employeeId: string): Promise<(EmployeePayrollRule & { rule: PayrollRule })[]>;
}
