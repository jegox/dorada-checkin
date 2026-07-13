import { prisma } from "@/infrastructure/database/prisma";
import type { PayrollLiquidation } from "@/domain/entities";

export class PrismaPayrollLiquidationRepository {
  async findAll(): Promise<PayrollLiquidation[]> {
    const rows = await prisma.payrollLiquidation.findMany({
      include: { employee: { include: { shift: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      deductions: Number(r.deductions),
    })) as unknown as PayrollLiquidation[];
  }

  async findByPeriod(period: string): Promise<PayrollLiquidation[]> {
    const rows = await prisma.payrollLiquidation.findMany({
      where: { period },
      include: { employee: { include: { shift: true } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      deductions: Number(r.deductions),
    })) as unknown as PayrollLiquidation[];
  }

  async create(data: {
    period: string;
    startDate: Date;
    endDate: Date;
    employeeId: string;
    deductions: number;
    amount: number;
  }): Promise<PayrollLiquidation> {
    const row = await prisma.payrollLiquidation.create({
      data,
      include: { employee: { include: { shift: true } } },
    });
    return {
      ...row,
      amount: Number(row.amount),
      deductions: Number(row.deductions),
    } as unknown as PayrollLiquidation;
  }

  async deleteByPeriod(period: string): Promise<void> {
    await prisma.payrollLiquidation.deleteMany({ where: { period } });
  }
}
