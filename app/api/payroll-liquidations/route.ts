import { NextRequest, NextResponse } from "next/server";
import { PrismaPayrollLiquidationRepository } from "@/infrastructure/repositories/payroll-liquidation.repository";

const repo = new PrismaPayrollLiquidationRepository();

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get("period");
    const data = period ? await repo.findByPeriod(period) : await repo.findAll();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error al obtener liquidaciones" }, { status: 500 });
  }
}
