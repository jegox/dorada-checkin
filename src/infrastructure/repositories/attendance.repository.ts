import { prisma } from "@/infrastructure/database/prisma";
import type { IAttendanceRepository } from "@/domain/repositories";
import type { Attendance, AttendanceType, AttendanceStatus } from "@/domain/entities";

export class PrismaAttendanceRepository implements IAttendanceRepository {
  async findAll(): Promise<Attendance[]> {
    const records = await prisma.attendance.findMany({
      include: { employee: { include: { shift: true } } },
      orderBy: { createdAt: "desc" },
    });
    return records as unknown as Attendance[];
  }

  async findByDate(date: Date): Promise<Attendance[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { employee: { include: { shift: true } } },
      orderBy: { createdAt: "desc" },
    });
    return records as unknown as Attendance[];
  }

  async findByDateRange(from: Date, to: Date): Promise<Attendance[]> {
    const records = await prisma.attendance.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: { employee: { include: { shift: true } } },
      orderBy: { createdAt: "desc" },
    });
    return records as unknown as Attendance[];
  }

  async findTodaySummary() {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const [checkIns, checkOuts, late, activeEmployees] = await Promise.all([
      prisma.attendance.count({
        where: { type: "CHECK_IN", createdAt: { gte: start, lte: end } },
      }),
      prisma.attendance.count({
        where: { type: "CHECK_OUT", createdAt: { gte: start, lte: end } },
      }),
      prisma.attendance.count({
        where: { status: "LATE", createdAt: { gte: start, lte: end } },
      }),
      prisma.employee.count({ where: { active: true } }),
    ]);

    return { checkIns, checkOuts, late, activeEmployees };
  }

  async create(data: {
    employeeId: string;
    type: AttendanceType;
    status: AttendanceStatus;
  }): Promise<Attendance> {
    const record = await prisma.attendance.create({
      data,
      include: { employee: { include: { shift: true } } },
    });
    return record as unknown as Attendance;
  }
}
