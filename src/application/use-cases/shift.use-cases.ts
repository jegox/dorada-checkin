import type { IShiftRepository } from "@/domain/repositories";
import type { Shift } from "@/domain/entities";
import type { CreateShiftDTO } from "@/application/dto";

export class GetShiftsUseCase {
  constructor(private readonly repo: IShiftRepository) {}

  async execute(): Promise<Shift[]> {
    return this.repo.findAll();
  }
}

export class CreateShiftUseCase {
  constructor(private readonly repo: IShiftRepository) {}

  async execute(dto: CreateShiftDTO): Promise<Shift> {
    // Validar que startTime < endTime
    const [sh, sm] = dto.startTime.split(":").map(Number);
    const [eh, em] = dto.endTime.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (startMinutes >= endMinutes) {
      throw new Error("La hora de entrada debe ser anterior a la hora de salida");
    }

    return this.repo.create({
      name: dto.name,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });
  }
}
