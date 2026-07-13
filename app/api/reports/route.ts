import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ReportQuerySchema } from "@/shared/validations/schemas";
import { PrismaAttendanceRepository } from "@/infrastructure/repositories/attendance.repository";
import { GetReportUseCase } from "@/application/use-cases/get-report";

export async function GET(req: NextRequest) {
  try {
    const raw = {
      from: req.nextUrl.searchParams.get("from") ?? undefined,
      to: req.nextUrl.searchParams.get("to") ?? undefined,
    };
    const query = ReportQuerySchema.parse(raw);

    const now = new Date();
    const from = query.from
      ? new Date(query.from + "T00:00:00")
      : (() => { const d = new Date(now); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d; })();
    const to = query.to
      ? new Date(query.to + "T23:59:59")
      : (() => { const d = new Date(now); d.setHours(23, 59, 59, 999); return d; })();

    const repo = new PrismaAttendanceRepository();
    const useCase = new GetReportUseCase(repo);
    const result = await useCase.execute({ from, to });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Parámetros inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
