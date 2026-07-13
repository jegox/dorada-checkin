import { prisma } from "@/infrastructure/database/prisma";
import type { IPayrollRuleRepository } from "@/domain/repositories";
import type { PayrollRule, PayrollRuleType, EmployeePayrollRule } from "@/domain/entities";

export class PrismaPayrollRuleRepository implements IPayrollRuleRepository {
  async findAll(): Promise<PayrollRule[]> {
    const rules = await prisma.payrollRule.findMany({ orderBy: { createdAt: "desc" } });
    return rules.map((r) => ({
      ...r,
      amount: Number(r.amount),
      activeDays: r.activeDays as number[] | null,
    })) as PayrollRule[];
  }

  async findById(id: string): Promise<PayrollRule | null> {
    const rule = await prisma.payrollRule.findUnique({ where: { id } });
    if (!rule) return null;
    return {
      ...rule,
      amount: Number(rule.amount),
      activeDays: rule.activeDays as number[] | null,
    } as PayrollRule;
  }

  async create(data: {
    name: string;
    type: PayrollRuleType;
    amount: number;
    description?: string;
    period?: string;
    activeDays?: number[] | null;
  }): Promise<PayrollRule> {
    const rule = await prisma.payrollRule.create({
      data: {
        name: data.name,
        type: data.type,
        amount: data.amount,
        description: data.description,
        period: data.period ?? "MENSUAL",
        activeDays: data.activeDays !== undefined ? (data.activeDays as object) : undefined,
      },
    });
    return {
      ...rule,
      amount: Number(rule.amount),
      activeDays: rule.activeDays as number[] | null,
    } as PayrollRule;
  }

  async update(
    id: string,
    data: {
      name?: string;
      amount?: number;
      description?: string | null;
      active?: boolean;
      period?: string;
      activeDays?: number[] | null;
    },
  ): Promise<PayrollRule> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.amount !== undefined) patch.amount = data.amount;
    if (data.description !== undefined) patch.description = data.description;
    if (data.active !== undefined) patch.active = data.active;
    if (data.period !== undefined) patch.period = data.period;
    if (data.activeDays !== undefined) patch.activeDays = data.activeDays;
    const rule = await prisma.payrollRule.update({ where: { id }, data: patch });
    return {
      ...rule,
      amount: Number(rule.amount),
      activeDays: rule.activeDays as number[] | null,
    } as PayrollRule;
  }

  async delete(id: string): Promise<void> {
    await prisma.payrollRule.delete({ where: { id } });
  }

  async assignToEmployee(employeeId: string, ruleId: string): Promise<EmployeePayrollRule> {
    const record = await prisma.employeePayrollRule.create({
      data: { employeeId, ruleId },
      include: { rule: true },
    });
    return {
      ...record,
      rule: { ...record.rule, amount: Number(record.rule.amount) },
    } as EmployeePayrollRule & { rule: PayrollRule };
  }

  async removeFromEmployee(employeeId: string, ruleId: string): Promise<void> {
    await prisma.employeePayrollRule.deleteMany({ where: { employeeId, ruleId } });
  }

  async findByEmployee(employeeId: string) {
    const records = await prisma.employeePayrollRule.findMany({
      where: { employeeId },
      include: { rule: true },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => ({
      ...r,
      rule: {
        ...r.rule,
        amount: Number(r.rule.amount),
        activeDays: r.rule.activeDays as number[] | null,
      },
    })) as (EmployeePayrollRule & { rule: PayrollRule })[];
  }
}
