import { prisma } from "@/infrastructure/database/prisma";
import type { AdditionalPayment } from "@/domain/entities";

export class PrismaAdditionalPaymentRepository {
  async findAll(): Promise<AdditionalPayment[]> {
    const rows = await prisma.additionalPayment.findMany({
      include: { employee: true },
      orderBy: { date: "desc" },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) })) as unknown as AdditionalPayment[];
  }

  async findByEmployee(employeeId: string): Promise<AdditionalPayment[]> {
    const rows = await prisma.additionalPayment.findMany({
      where: { employeeId },
      include: { employee: true },
      orderBy: { date: "desc" },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) })) as unknown as AdditionalPayment[];
  }

  async findByPeriod(from: Date, to: Date): Promise<AdditionalPayment[]> {
    const rows = await prisma.additionalPayment.findMany({
      where: { date: { gte: from, lte: to } },
      include: { employee: true },
    });
    return rows.map((r) => ({ ...r, amount: Number(r.amount) })) as unknown as AdditionalPayment[];
  }

  async sumByEmployeeAndPeriod(employeeId: string, from: Date, to: Date): Promise<number> {
    const agg = await prisma.additionalPayment.aggregate({
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
  }): Promise<AdditionalPayment> {
    const row = await prisma.additionalPayment.create({ data, include: { employee: true } });
    return { ...row, amount: Number(row.amount) } as unknown as AdditionalPayment;
  }

  async delete(id: string): Promise<void> {
    await prisma.additionalPayment.delete({ where: { id } });
  }
}
