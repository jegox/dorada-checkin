import { prisma } from "@/infrastructure/database/prisma";
import { getCurrentFortnightPeriod } from "@/shared/utils/fortnightPeriod";

const AUTO_PAYMENT_CONCEPT_PREFIXES = [
  "AMOUNT_FDS_CHEF",
  "AMOUNT_FDS_AUX",
  "AMOUNT_SHIFT_LUNCH",
  "AMOUNT_SHIFT_FOODS",
];

type AttendanceRow = {
  id: string;
  employeeId: string;
  type: "CHECK_IN" | "CHECK_OUT";
  status: "ON_TIME" | "LATE" | "EARLY";
  createdAt: Date;
  employee: {
    id: string;
    fullName: string;
    document: string;
    shiftId: string;
    shift: { id: string; name: string };
  };
};

export interface AttendancePeriodFilters {
  employeeId?: string;
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

export interface AttendancePeriodSummaryDTO {
  totalCompletedShiftsAmount: number;
  totalLateArrivals: number;
  punctualityPercent: number;
  pendingCheckOuts: number;
}

export interface AttendancePeriodReportDTO {
  period: {
    label: string;
    startDate: string;
    endDate: string;
  };
  filters: {
    employees: Array<{ id: string; name: string; document: string; shiftId: string }>;
    shifts: Array<{ id: string; name: string }>;
  };
  summary: AttendancePeriodSummaryDTO;
  rows: AttendancePeriodRowDTO[];
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTime(date: Date): string {
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class GetAttendancePeriodReportUseCase {
  async execute(filters: AttendancePeriodFilters): Promise<AttendancePeriodReportDTO> {
    const period = getCurrentFortnightPeriod();

    const [employees, shifts, records, employeeSettings] = await Promise.all([
      prisma.employee.findMany({
        orderBy: { fullName: "asc" },
        select: { id: true, fullName: true, document: true, shiftId: true },
      }),
      prisma.shift.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.attendance.findMany({
        where: {
          createdAt: { gte: period.start, lte: period.end },
          employee: {
            active: true,
            ...(filters.employeeId ? { id: filters.employeeId } : {}),
            ...(filters.shiftId ? { shiftId: filters.shiftId } : {}),
          },
        },
        include: {
          employee: { include: { shift: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "asc" },
      }) as unknown as AttendanceRow[],
      prisma.employeeSetting.findMany({
        where: {
          setting: { active: true },
          ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        },
        include: {
          setting: { select: { key: true, value: true } },
          employee: { select: { id: true, shiftId: true, active: true } },
        },
      }),
    ]);

    const selectedEmployees = employees.filter((e) => {
      if (filters.shiftId && e.shiftId !== filters.shiftId) return false;
      return true;
    });

    const baseValueByEmployee = new Map<string, number>();
    for (const link of employeeSettings) {
      if (!link.employee?.active) continue;
      if (AUTO_PAYMENT_CONCEPT_PREFIXES.includes(link.setting.key)) continue;
      if (baseValueByEmployee.has(link.employeeId)) continue;

      const parsed = Number.parseFloat(link.setting.value);
      baseValueByEmployee.set(link.employeeId, Number.isFinite(parsed) ? parsed : 0);
    }

    const grouped = new Map<string, AttendanceRow[]>();
    for (const row of records) {
      const key = `${row.employeeId}|${toDateKey(row.createdAt)}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(row);
    }

    const rows: AttendancePeriodRowDTO[] = [];
    let totalWorkedDays = 0;
    let totalLateArrivals = 0;
    let pendingCheckOuts = 0;
    let totalCompletedShiftsAmount = 0;

    for (const [key, entries] of grouped) {
      const [employeeId, date] = key.split("|");
      const checkIns = entries.filter((e) => e.type === "CHECK_IN");
      const checkOuts = entries.filter((e) => e.type === "CHECK_OUT");
      const usedCheckout = new Set<string>();
      const baseValue = baseValueByEmployee.get(employeeId) ?? 0;

      for (const checkIn of checkIns) {
        totalWorkedDays += 1;
        if (checkIn.status === "LATE") totalLateArrivals += 1;

        const match = checkOuts.find((candidate) => {
          if (usedCheckout.has(candidate.id)) return false;
          return candidate.createdAt >= checkIn.createdAt;
        });

        if (match) {
          usedCheckout.add(match.id);
          totalCompletedShiftsAmount += baseValue;
        } else {
          pendingCheckOuts += 1;
        }

        rows.push({
          id: checkIn.id,
          employeeId: checkIn.employee.id,
          employeeName: checkIn.employee.fullName,
          employeeDocument: checkIn.employee.document,
          shiftId: checkIn.employee.shift.id,
          shiftName: checkIn.employee.shift.name,
          date,
          checkInTime: toTime(checkIn.createdAt),
          checkOutTime: match ? toTime(match.createdAt) : null,
          novelty: checkIn.status === "LATE" ? "ENTRADA TARDE" : "ENTRADA A TIEMPO",
        });
      }
    }

    rows.sort((a, b) => {
      const ad = `${a.date} ${a.checkInTime}`;
      const bd = `${b.date} ${b.checkInTime}`;
      if (ad < bd) return -1;
      if (ad > bd) return 1;
      return a.employeeName.localeCompare(b.employeeName);
    });

    const punctualityPercent =
      totalWorkedDays > 0
        ? Math.round(((totalWorkedDays - totalLateArrivals) / totalWorkedDays) * 100)
        : 0;

    return {
      period: {
        label: period.label,
        startDate: period.start.toISOString(),
        endDate: period.end.toISOString(),
      },
      filters: {
        employees: selectedEmployees.map((employee) => ({
          id: employee.id,
          name: employee.fullName,
          document: employee.document,
          shiftId: employee.shiftId,
        })),
        shifts,
      },
      summary: {
        totalCompletedShiftsAmount: round2(totalCompletedShiftsAmount),
        totalLateArrivals,
        punctualityPercent,
        pendingCheckOuts,
      },
      rows,
    };
  }
}
