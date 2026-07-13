import type { ISettingRepository } from "@/domain/repositories";
import type { Setting } from "@/domain/entities";
import type { CreateSettingDTO, UpdateSettingDTO } from "@/application/dto";

export class GetSettingsUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(): Promise<Setting[]> {
    return this.repo.findAll();
  }
}

export class CreateSettingUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(dto: CreateSettingDTO): Promise<Setting> {
    return this.repo.create({
      key: dto.key,
      value: dto.value,
      active: dto.active ?? true,
      employeeIds: dto.employeeIds ?? [],
    });
  }
}

export class UpdateSettingUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(id: string, dto: UpdateSettingDTO): Promise<Setting> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Configuración no encontrada");
    return this.repo.update(id, dto);
  }
}

export class ToggleSettingUseCase {
  constructor(private readonly repo: ISettingRepository) {}

  async execute(id: string, active: boolean): Promise<Setting> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Configuración no encontrada");
    return this.repo.setActive(id, active);
  }
}
