import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateSettingSchema } from "@/shared/validations/schemas";
import { PrismaSettingRepository } from "@/infrastructure/repositories/setting.repository";
import {
  GetSettingsUseCase,
  CreateSettingUseCase,
} from "@/application/use-cases/setting.use-cases";
import { toSettingDTO } from "@/shared/mappers/setting.mapper";

export async function GET() {
  try {
    const repo = new PrismaSettingRepository();
    const settings = await new GetSettingsUseCase(repo).execute();
    return NextResponse.json(settings.map(toSettingDTO));
  } catch {
    return NextResponse.json({ error: "Error al obtener configuraciones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = CreateSettingSchema.parse(body);
    const repo = new PrismaSettingRepository();
    const setting = await new CreateSettingUseCase(repo).execute(dto);
    return NextResponse.json(toSettingDTO(setting), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Error al crear configuración";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
