import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AssignRuleSchema } from "@/shared/validations/schemas";
import { PrismaPayrollRuleRepository } from "@/infrastructure/repositories/payroll-rule.repository";
import { AssignRuleToEmployeeUseCase, GetEmployeeRulesUseCase } from "@/application/use-cases/payroll-rule.use-cases";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const repo = new PrismaPayrollRuleRepository();
    const rules = await new GetEmployeeRulesUseCase(repo).execute(id);
    return NextResponse.json(rules);
  } catch {
    return NextResponse.json({ error: "Error al obtener reglas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: employeeId } = await params;
    const body = await req.json();
    const { ruleId } = AssignRuleSchema.parse(body);
    const repo = new PrismaPayrollRuleRepository();
    const record = await new AssignRuleToEmployeeUseCase(repo).execute(employeeId, ruleId);
    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
