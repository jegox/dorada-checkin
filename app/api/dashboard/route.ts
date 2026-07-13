import { NextResponse } from "next/server";
import { PrismaAttendanceRepository } from "@/infrastructure/repositories/attendance.repository";
import { GetDashboardSummaryUseCase } from "@/application/use-cases/get-dashboard-summary";

export async function GET() {
  try {
    const repo = new PrismaAttendanceRepository();
    const useCase = new GetDashboardSummaryUseCase(repo);
    const summary = await useCase.execute();
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener resumen" }, { status: 500 });
  }
}
