import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreatePayrollRuleSchema } from "@/shared/validations/schemas";
import { PrismaPayrollRuleRepository } from "@/infrastructure/repositories/payroll-rule.repository";
import { GetPayrollRulesUseCase, CreatePayrollRuleUseCase } from "@/application/use-cases/payroll-rule.use-cases";

export async function GET() {
  try {
    const repo = new PrismaPayrollRuleRepository();
    const rules = await new GetPayrollRulesUseCase(repo).execute();
    return NextResponse.json(rules);
  } catch {
    return NextResponse.json({ error: "Error al obtener reglas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = CreatePayrollRuleSchema.parse(body);
    const repo = new PrismaPayrollRuleRepository();
    const rule = await new CreatePayrollRuleUseCase(repo).execute(dto);
    return NextResponse.json(rule, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
