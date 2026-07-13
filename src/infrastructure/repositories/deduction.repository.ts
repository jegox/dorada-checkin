import { prisma } from "@/infrastructure/database/prisma";
import type { Deduction } from "@/domain/entities";

export class PrismaDeductionRepository {
  async findAll(): Promise<Deduction[]> {
    const rows = await prisma.deduction.findMany({
      include: { employee: true },
      orderBy: { date: "desc" },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) })) as unknown as Deduction[];
  }

  async findByEmployee(employeeId: string): Promise<Deduction[]> {
    const rows = await prisma.deduction.findMany({
      where: { employeeId },
      include: { employee: true },
      orderBy: { date: "desc" },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) })) as unknown as Deduction[];
  }

  async findByPeriod(from: Date, to: Date): Promise<Deduction[]> {
    const rows = await prisma.deduction.findMany({
      where: { date: { gte: from, lte: to } },
      include: { employee: true },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) })) as unknown as Deduction[];
  }

  async sumByEmployeeAndPeriod(employeeId: string, from: Date, to: Date): Promise<number> {
    const agg = await prisma.deduction.aggregate({
      where: { employeeId, date: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    return Number(agg._sum.amount ?? 0);
  }

  async create(data: {
    employeeId: string;
    amount: number;
    date: Date;
    concept: string;
  }): Promise<Deduction> {
    const row = await prisma.deduction.create({ data, include: { employee: true } });
    return { ...row, amount: Number(row.amount) } as unknown as Deduction;
  }

  async delete(id: string): Promise<void> {
    await prisma.deduction.delete({ where: { id } });
  }
}
