import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { UpdatePayrollRuleSchema } from "@/shared/validations/schemas";
import { PrismaPayrollRuleRepository } from "@/infrastructure/repositories/payroll-rule.repository";
import {
  DeletePayrollRuleUseCase,
  UpdatePayrollRuleUseCase,
} from "@/application/use-cases/payroll-rule.use-cases";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const dto = UpdatePayrollRuleSchema.parse(body);
    const repo = new PrismaPayrollRuleRepository();
    const rule = await new UpdatePayrollRuleUseCase(repo).execute(id, dto);
    return NextResponse.json(rule);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const repo = new PrismaPayrollRuleRepository();
    await new DeletePayrollRuleUseCase(repo).execute(id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
