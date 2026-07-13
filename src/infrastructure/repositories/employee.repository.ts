import { prisma } from "@/infrastructure/database/prisma";
import type { IEmployeeRepository } from "@/domain/repositories";
import type { Employee } from "@/domain/entities";

export class PrismaEmployeeRepository implements IEmployeeRepository {
  async findAll(): Promise<Employee[]> {
    const employees = await prisma.employee.findMany({
      include: { shift: true },
      orderBy: { fullName: "asc" },
    });
    return employees as unknown as Employee[];
  }

  async findById(id: string): Promise<Employee | null> {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { shift: true },
    });
    if (!employee) return null;
    return employee as unknown as Employee;
  }

  async findByDocument(document: string): Promise<Employee | null> {
    const employee = await prisma.employee.findUnique({
      where: { document },
      include: { shift: true },
    });
    if (!employee) return null;
    return employee as unknown as Employee;
  }

  async create(data: Omit<Employee, "id" | "createdAt" | "updatedAt">): Promise<Employee> {
    const employee = await prisma.employee.create({
      data: {
        document: data.document,
        fullName: data.fullName,
        position: data.position,
        active: data.active,
        shiftId: data.shiftId,
      },
      include: { shift: true },
    });
    return employee as unknown as Employee;
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.document !== undefined && { document: data.document }),
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.shiftId !== undefined && { shiftId: data.shiftId }),
        ...(data.active !== undefined && { active: data.active }),
      },
      include: { shift: true },
    });
    return employee as unknown as Employee;
  }
}
