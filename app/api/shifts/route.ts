import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateShiftSchema } from "@/shared/validations/schemas";
import { PrismaShiftRepository } from "@/infrastructure/repositories/shift.repository";
import { GetShiftsUseCase, CreateShiftUseCase } from "@/application/use-cases/shift.use-cases";

export async function GET() {
  try {
    const repo = new PrismaShiftRepository();
    const useCase = new GetShiftsUseCase(repo);
    const shifts = await useCase.execute();
    return NextResponse.json(shifts);
  } catch {
    return NextResponse.json({ error: "Error al obtener turnos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = CreateShiftSchema.parse(body);

    const repo = new PrismaShiftRepository();
    const useCase = new CreateShiftUseCase(repo);
    const shift = await useCase.execute(dto);

    return NextResponse.json(shift, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Error al crear turno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
