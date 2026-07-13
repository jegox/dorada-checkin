import { prisma } from "@/infrastructure/database/prisma";
import type { ISettingRepository } from "@/domain/repositories";
import type { Setting, EmployeeSetting } from "@/domain/entities";

const withEmployees = {
  employees: { include: { employee: true } },
} as const;

export class PrismaSettingRepository implements ISettingRepository {
  async findAll(): Promise<Setting[]> {
    const settings = await prisma.setting.findMany({
      include: withEmployees,
      orderBy: { createdAt: "asc" },
    });
    return settings as unknown as Setting[];
  }

  async findById(id: string): Promise<Setting | null> {
    const setting = await prisma.setting.findUnique({
      where: { id },
      include: withEmployees,
    });
    return setting as unknown as Setting | null;
  }

  async create(data: {
    key: string;
    value: string;
    active?: boolean;
    employeeIds?: string[];
  }): Promise<Setting> {
    const setting = await prisma.setting.create({
      data: {
        key: data.key,
        value: data.value,
        active: data.active ?? true,
        employees: data.employeeIds?.length
          ? { create: data.employeeIds.map((employeeId) => ({ employeeId })) }
          : undefined,
      },
      include: withEmployees,
    });
    return setting as unknown as Setting;
  }

  async update(
    id: string,
    data: { key?: string; value?: string; active?: boolean; employeeIds?: string[] },
  ): Promise<Setting> {
    const setting = await prisma.$transaction(async (tx) => {
      // Reemplaza el conjunto de empleados asignados si se envía employeeIds
      if (data.employeeIds !== undefined) {
        await tx.employeeSetting.deleteMany({ where: { settingId: id } });
        if (data.employeeIds.length) {
          await tx.employeeSetting.createMany({
            data: data.employeeIds.map((employeeId) => ({ settingId: id, employeeId })),
          });
        }
      }
      return tx.setting.update({
        where: { id },
        data: {
          ...(data.key !== undefined && { key: data.key }),
          ...(data.value !== undefined && { value: data.value }),
          ...(data.active !== undefined && { active: data.active }),
        },
        include: withEmployees,
      });
    });
    return setting as unknown as Setting;
  }

  async setActive(id: string, active: boolean): Promise<Setting> {
    const setting = await prisma.setting.update({
      where: { id },
      data: { active },
      include: withEmployees,
    });
    return setting as unknown as Setting;
  }

  async findEmployeeLinks(settingId: string): Promise<EmployeeSetting[]> {
    const links = await prisma.employeeSetting.findMany({
      where: { settingId },
      include: { employee: true },
    });
    return links as unknown as EmployeeSetting[];
  }
}
