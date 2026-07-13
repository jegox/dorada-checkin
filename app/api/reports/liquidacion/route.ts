import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaEmployeeRepository } from "@/infrastructure/repositories/employee.repository";
import { PrismaPayrollRuleRepository } from "@/infrastructure/repositories/payroll-rule.repository";
import { GetLiquidacionUseCase } from "@/application/use-cases/get-liquidacion";

const QuerySchema = z.object({
  year:       z.coerce.number().int().min(2020).max(2100),
  month:      z.coerce.number().int().min(1).max(12),
  fortnight:  z.coerce.number().int().refine((v) => v === 1 || v === 2),
});

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { year, month, fortnight } = QuerySchema.parse(raw);
    const empRepo  = new PrismaEmployeeRepository();
    const pRepo    = new PrismaPayrollRuleRepository();
    const result   = await new GetLiquidacionUseCase(empRepo, pRepo).execute(year, month, fortnight as 1 | 2);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
