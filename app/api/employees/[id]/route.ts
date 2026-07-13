import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { UpdateEmployeeSchema } from "@/shared/validations/schemas";
import { PrismaEmployeeRepository } from "@/infrastructure/repositories/employee.repository";
import { PrismaShiftRepository } from "@/infrastructure/repositories/shift.repository";
import { UpdateEmployeeUseCase } from "@/application/use-cases/employee.use-cases";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const dto = UpdateEmployeeSchema.parse(body);
    const empRepo = new PrismaEmployeeRepository();
    const shiftRepo = new PrismaShiftRepository();
    const employee = await new UpdateEmployeeUseCase(empRepo, shiftRepo).execute(id, dto);
    return NextResponse.json(employee);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar" },
      { status: 400 },
    );
  }
}
