import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GetPayrollLiquidatedReportUseCase } from "@/application/use-cases/get-payroll-liquidated-report";

const QuerySchema = z.object({
  period: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = QuerySchema.parse({
      period: req.nextUrl.searchParams.get("period") ?? undefined,
    });

    const useCase = new GetPayrollLiquidatedReportUseCase();
    const data = await useCase.execute(parsed.period);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al cargar reporte de nomina";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
