import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateEmployeeSchema } from "@/shared/validations/schemas";
import { PrismaEmployeeRepository } from "@/infrastructure/repositories/employee.repository";
import { PrismaShiftRepository } from "@/infrastructure/repositories/shift.repository";
import {
  GetEmployeesUseCase,
  GetEmployeeByDocumentUseCase,
  CreateEmployeeUseCase,
} from "@/application/use-cases/employee.use-cases";

export async function GET(req: NextRequest) {
  try {
    const employeeRepo = new PrismaEmployeeRepository();
    const document = req.nextUrl.searchParams.get("document");

    if (document) {
      // C-3: búsqueda por documento sin descargar toda la lista
      const useCase = new GetEmployeeByDocumentUseCase(employeeRepo);
      const employee = await useCase.execute(document);
      if (!employee) {
        return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
      }
      return NextResponse.json(employee);
    }

    const useCase = new GetEmployeesUseCase(employeeRepo);
    const employees = await useCase.execute();
    return NextResponse.json(employees);
  } catch {
    return NextResponse.json({ error: "Error al obtener empleados" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = CreateEmployeeSchema.parse(body);

    const employeeRepo = new PrismaEmployeeRepository();
    const shiftRepo = new PrismaShiftRepository();
    const useCase = new CreateEmployeeUseCase(employeeRepo, shiftRepo);
    const employee = await useCase.execute(dto);

    return NextResponse.json(employee, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Error al crear empleado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
