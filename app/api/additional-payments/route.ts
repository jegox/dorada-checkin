import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaAdditionalPaymentRepository } from "@/infrastructure/repositories/additional-payment.repository";

const CreateSchema = z.object({
  employeeId: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  concept: z.string().min(1).max(200),
});

const repo = new PrismaAdditionalPaymentRepository();

export async function GET(req: NextRequest) {
  try {
    const employeeId = req.nextUrl.searchParams.get("employeeId");
    const data = employeeId ? await repo.findByEmployee(employeeId) : await repo.findAll();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error al obtener pagos adicionales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = CreateSchema.parse(body);
    const row = await repo.create({ ...dto, date: new Date(dto.date + "T12:00:00") });
    return NextResponse.json(row, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
