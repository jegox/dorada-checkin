import type { Setting } from "@/domain/entities";
import type { SettingDTO } from "@/presentation/types";

export function toSettingDTO(setting: Setting): SettingDTO {
  return {
    id: setting.id,
    key: setting.key,
    value: setting.value,
    active: setting.active,
    createdAt:
      setting.createdAt instanceof Date
        ? setting.createdAt.toISOString()
        : String(setting.createdAt),
    employees: (setting.employees ?? [])
      .filter((link) => link.employee)
      .map((link) => ({
        id: link.employee!.id,
        fullName: link.employee!.fullName,
        document: link.employee!.document,
      })),
  };
}
