import { prisma } from "@/infrastructure/database/prisma";
import { parseFortnightLabel, buildFortnightPeriod } from "@/shared/utils/fortnightPeriod";

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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class GetPayrollLiquidatedReportUseCase {
  async execute(period?: string): Promise<PayrollLiquidatedReportDTO> {
    const periodRows = await prisma.payrollLiquidation.findMany({
      select: { period: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const availablePeriods = Array.from(new Set(periodRows.map((r) => r.period)));
    const selectedPeriod =
      period && availablePeriods.includes(period) ? period : (availablePeriods[0] ?? null);

    if (!selectedPeriod) {
      return {
        selectedPeriod: null,
        availablePeriods: [],
        summary: { totalAmount: 0, totalDeductions: 0, netAmount: 0 },
        rows: [],
      };
    }

    const liquidations = await prisma.payrollLiquidation.findMany({
      where: { period: selectedPeriod },
      include: {
        employee: {
          select: { id: true, fullName: true, document: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const parsed = parseFortnightLabel(selectedPeriod);
    let from: Date | null = null;
    let to: Date | null = null;

    if (parsed) {
      const range = buildFortnightPeriod(parsed.year, parsed.month, parsed.fortnight);
      from = range.start;
      to = range.end;
    } else if (liquidations.length > 0) {
      from = liquidations[0].startDate;
      to = liquidations[0].endDate;
    }

    const attendance =
      from && to
        ? await prisma.attendance.findMany({
            where: {
              type: "CHECK_IN",
              createdAt: { gte: from, lte: to },
              employeeId: { in: liquidations.map((l) => l.employeeId) },
            },
            select: { employeeId: true, status: true },
          })
        : [];

    const workedDays = new Map<string, number>();
    const lateArrivals = new Map<string, number>();

    for (const row of attendance) {
      workedDays.set(row.employeeId, (workedDays.get(row.employeeId) ?? 0) + 1);
      if (row.status === "LATE") {
        lateArrivals.set(row.employeeId, (lateArrivals.get(row.employeeId) ?? 0) + 1);
      }
    }

    const rows = liquidations.map((item) => {
      const worked = workedDays.get(item.employeeId) ?? 0;
      const late = lateArrivals.get(item.employeeId) ?? 0;
      const punctuality = worked > 0 ? Math.round(((worked - late) / worked) * 100) : 0;

      return {
        employeeId: item.employeeId,
        employeeName: item.employee.fullName,
        employeeDocument: item.employee.document,
        totalAmount: Number(item.amount),
        totalDeductions: Number(item.deductions),
        lateArrivals: late,
        punctualityPercent: punctuality,
      };
    });

    const totalAmount = rows.reduce((sum, row) => sum + row.totalAmount, 0);
    const totalDeductions = rows.reduce((sum, row) => sum + row.totalDeductions, 0);

    return {
      selectedPeriod,
      availablePeriods,
      summary: {
        totalAmount: round2(totalAmount),
        totalDeductions: round2(totalDeductions),
        netAmount: round2(totalAmount - totalDeductions),
      },
      rows,
    };
  }
}
