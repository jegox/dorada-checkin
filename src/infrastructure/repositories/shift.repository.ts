import { prisma } from "@/infrastructure/database/prisma";
import type { IShiftRepository } from "@/domain/repositories";
import type { Shift } from "@/domain/entities";

export class PrismaShiftRepository implements IShiftRepository {
  async findAll(): Promise<Shift[]> {
    const shifts = await prisma.shift.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { employees: true } } },
    });
    return shifts as unknown as Shift[];
  }

  async findById(id: string): Promise<Shift | null> {
    const shift = await prisma.shift.findUnique({ where: { id } });
    return shift as Shift | null;
  }

  async create(data: Omit<Shift, "id" | "createdAt" | "updatedAt">): Promise<Shift> {
    const shift = await prisma.shift.create({ data });
    return shift as Shift;
  }
}
