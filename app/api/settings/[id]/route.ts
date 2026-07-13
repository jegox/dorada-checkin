import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { UpdateSettingSchema } from "@/shared/validations/schemas";
import { PrismaSettingRepository } from "@/infrastructure/repositories/setting.repository";
import {
  UpdateSettingUseCase,
  ToggleSettingUseCase,
} from "@/application/use-cases/setting.use-cases";
import { toSettingDTO } from "@/shared/mappers/setting.mapper";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const dto = UpdateSettingSchema.parse(body);
    const repo = new PrismaSettingRepository();

    // Si sólo llega { active }, se trata como toggle
    const onlyActive =
      dto.active !== undefined &&
      dto.key === undefined &&
      dto.value === undefined &&
      dto.employeeIds === undefined;

    const setting = onlyActive
      ? await new ToggleSettingUseCase(repo).execute(id, dto.active!)
      : await new UpdateSettingUseCase(repo).execute(id, dto);

    return NextResponse.json(toSettingDTO(setting));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Error al actualizar configuración";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
