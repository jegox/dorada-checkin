import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GetAttendancePeriodReportUseCase } from "@/application/use-cases/get-attendance-period-report";

const QuerySchema = z.object({
  employeeId: z.string().min(1).optional(),
  shiftId: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = QuerySchema.parse({
      employeeId: req.nextUrl.searchParams.get("employeeId") ?? undefined,
      shiftId: req.nextUrl.searchParams.get("shiftId") ?? undefined,
    });

    const useCase = new GetAttendancePeriodReportUseCase();
    const data = await useCase.execute(parsed);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al cargar reporte de empleados";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
