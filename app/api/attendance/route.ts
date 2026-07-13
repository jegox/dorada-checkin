import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { RegisterAttendanceSchema } from "@/shared/validations/schemas";
import { PrismaAttendanceRepository } from "@/infrastructure/repositories/attendance.repository";
import { PrismaEmployeeRepository } from "@/infrastructure/repositories/employee.repository";
import { RegisterAttendanceUseCase } from "@/application/use-cases/register-attendance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = RegisterAttendanceSchema.parse(body);

    const attendanceRepo = new PrismaAttendanceRepository();
    const employeeRepo = new PrismaEmployeeRepository();
    const useCase = new RegisterAttendanceUseCase(attendanceRepo, employeeRepo);
    const attendance = await useCase.execute(dto);

    return NextResponse.json(attendance, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Error al registrar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const repo = new PrismaAttendanceRepository();
    const records = await repo.findByDate(new Date());
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Error al obtener marcaciones" }, { status: 500 });
  }
}
