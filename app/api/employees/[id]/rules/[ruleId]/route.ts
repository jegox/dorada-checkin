import { NextRequest, NextResponse } from "next/server";
import { PrismaPayrollRuleRepository } from "@/infrastructure/repositories/payroll-rule.repository";
import { RemoveRuleFromEmployeeUseCase } from "@/application/use-cases/payroll-rule.use-cases";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; ruleId: string }> }) {
  try {
    const { id: employeeId, ruleId } = await params;
    const repo = new PrismaPayrollRuleRepository();
    await new RemoveRuleFromEmployeeUseCase(repo).execute(employeeId, ruleId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
