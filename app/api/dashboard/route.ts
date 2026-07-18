import { NextRequest, NextResponse } from "next/server";
import { PrismaAttendanceRepository } from "@/infrastructure/repositories/attendance.repository";
import { PrismaEmployeeRepository } from "@/infrastructure/repositories/employee.repository";
import { PrismaShiftRepository } from "@/infrastructure/repositories/shift.repository";
import type { Attendance } from "@/domain/entities";

const MAX_MONTHS_ANTIQUITY = 3;

type ShiftStatus = "ACTIVO" | "INACTIVO" | "PENDIENTE";

interface DashboardRow {
  id: string;
  employeeId: string;
  employeeName: string;
  checkInAt: string;
  checkOutAt: string | null;
  shiftStatus: ShiftStatus;
}

type DateRangeResult =
  | {
      ok: true;
      range: {
        startDate: Date;
        endDate: Date;
        minAllowed: Date;
        today: Date;
      };
    }
  | {
      ok: false;
      error: string;
    };

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function toInputDate(date: Date) {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
}

function parseDateParam(value: string | null) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getDateRange(req: NextRequest): DateRangeResult {
  const today = startOfDay(new Date());
  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 6);

  const startDateParam = parseDateParam(req.nextUrl.searchParams.get("startDate"));
  const endDateParam = parseDateParam(req.nextUrl.searchParams.get("endDate"));

  const startDate = startOfDay(startDateParam ?? defaultStart);
  const endDate = endOfDay(endDateParam ?? today);

  const minAllowed = startOfDay(new Date(today));
  minAllowed.setMonth(minAllowed.getMonth() - MAX_MONTHS_ANTIQUITY);

  if (startDate < minAllowed) {
    return {
      ok: false,
      error: `El rango no puede superar ${MAX_MONTHS_ANTIQUITY} meses de antiguedad.`,
    };
  }

  if (endDate < startDate) {
    return {
      ok: false,
      error: "La fecha final no puede ser menor que la fecha inicial.",
    };
  }

  return {
    ok: true,
    range: {
      startDate,
      endDate,
      minAllowed,
      today,
    },
  };
}

function getShiftStatus(checkInAt: Date, checkOutAt: Date | null, today: Date): ShiftStatus {
  if (checkOutAt) return "INACTIVO";

  const checkInDay = startOfDay(checkInAt).getTime();
  const todayValue = startOfDay(today).getTime();
  return checkInDay === todayValue ? "ACTIVO" : "PENDIENTE";
}

function getEmployeeName(record: Attendance) {
  return record.employee?.fullName || "Empleado sin nombre";
}

export async function GET(req: NextRequest) {
  try {
    const dateRange = getDateRange(req);
    if (!dateRange.ok) {
      return NextResponse.json({ error: dateRange.error }, { status: 400 });
    }

    const { startDate, endDate, minAllowed, today } = dateRange.range;
    const employeeId = req.nextUrl.searchParams.get("employeeId") || "";
    const shiftId = req.nextUrl.searchParams.get("shiftId") || "";

    const attendanceRepo = new PrismaAttendanceRepository();
    const employeeRepo = new PrismaEmployeeRepository();
    const shiftRepo = new PrismaShiftRepository();

    const [employees, shifts, attendanceRecords] = await Promise.all([
      employeeRepo.findAll(),
      shiftRepo.findAll(),
      attendanceRepo.findByDateRange(startDate, endDate),
    ]);

    const filteredAttendance = attendanceRecords.filter((record) => {
      if (employeeId && record.employeeId !== employeeId) return false;
      if (shiftId && record.employee?.shiftId !== shiftId) return false;
      return true;
    });

    const attendancesByEmployee = new Map<string, Attendance[]>();

    filteredAttendance
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((record: Attendance) => {
        const list = attendancesByEmployee.get(record.employeeId) || [];
        list.push(record);
        attendancesByEmployee.set(record.employeeId, list);
      });

    const rows: DashboardRow[] = [];
    let lateCount = 0;

    attendancesByEmployee.forEach((records: Attendance[]) => {
      let pendingCheckIn: Attendance | null = null;

      records.forEach((record: Attendance) => {
        if (record.type === "CHECK_IN") {
          if (pendingCheckIn) {
            const previousCheckInAt = new Date(pendingCheckIn.createdAt);
            rows.push({
              id: pendingCheckIn.id,
              employeeId: pendingCheckIn.employeeId,
              employeeName: getEmployeeName(pendingCheckIn),
              checkInAt: pendingCheckIn.createdAt.toISOString(),
              checkOutAt: null,
              shiftStatus: getShiftStatus(previousCheckInAt, null, today),
            });
          }

          pendingCheckIn = record;
          if (record.status === "LATE") lateCount += 1;
          return;
        }

        if (record.type === "CHECK_OUT" && pendingCheckIn) {
          const checkInAt = new Date(pendingCheckIn.createdAt);
          const checkOutAt = new Date(record.createdAt);

          rows.push({
            id: pendingCheckIn.id,
            employeeId: pendingCheckIn.employeeId,
            employeeName: getEmployeeName(pendingCheckIn),
            checkInAt: pendingCheckIn.createdAt.toISOString(),
            checkOutAt: record.createdAt.toISOString(),
            shiftStatus: getShiftStatus(checkInAt, checkOutAt, today),
          });

          pendingCheckIn = null;
        }
      });

      const openCheckIn = pendingCheckIn as Attendance | null;
      if (openCheckIn !== null) {
        const checkInAt = new Date(openCheckIn.createdAt);
        rows.push({
          id: openCheckIn.id,
          employeeId: openCheckIn.employeeId,
          employeeName: getEmployeeName(openCheckIn),
          checkInAt: openCheckIn.createdAt.toISOString(),
          checkOutAt: null,
          shiftStatus: getShiftStatus(checkInAt, null, today),
        });
      }
    });

    rows.sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime());

    const checkOuts = rows.filter((row) => row.checkOutAt).length;

    return NextResponse.json({
      summary: {
        checkIns: rows.length,
        checkOuts,
        late: lateCount,
        activeEmployees: employees.filter((employee) => employee.active).length,
      },
      filters: {
        employees: employees.map((employee) => ({
          id: employee.id,
          name: employee.fullName,
        })),
        shifts: shifts.map((shift) => ({
          id: shift.id,
          name: shift.name,
        })),
      },
      period: {
        startDate: toInputDate(startDate),
        endDate: toInputDate(endDate),
        minDate: toInputDate(minAllowed),
        maxDate: toInputDate(today),
      },
      rows,
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener resumen" }, { status: 500 });
  }
}
