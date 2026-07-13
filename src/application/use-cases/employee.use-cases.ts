import type { IEmployeeRepository } from "@/domain/repositories";
import type { IShiftRepository } from "@/domain/repositories";
import type { Employee } from "@/domain/entities";
import type { CreateEmployeeDTO, UpdateEmployeeDTO } from "@/application/dto";

export class GetEmployeesUseCase {
  constructor(private readonly repo: IEmployeeRepository) {}

  async execute(): Promise<Employee[]> {
    return this.repo.findAll();
  }
}

export class GetEmployeeByDocumentUseCase {
  constructor(private readonly repo: IEmployeeRepository) {}

  async execute(document: string): Promise<Employee | null> {
    return this.repo.findByDocument(document);
  }
}

export class CreateEmployeeUseCase {
  constructor(
    private readonly employeeRepo: IEmployeeRepository,
    private readonly shiftRepo: IShiftRepository,
  ) {}

  async execute(dto: CreateEmployeeDTO): Promise<Employee> {
    const shift = await this.shiftRepo.findById(dto.shiftId);
    if (!shift) throw new Error("Turno no encontrado");

    const existing = await this.employeeRepo.findByDocument(dto.document);
    if (existing) throw new Error("Ya existe un empleado con ese documento");

    return this.employeeRepo.create({
      document: dto.document,
      fullName: dto.fullName,
      position: dto.position,
      shiftId: dto.shiftId,
      active: dto.active ?? true,
    });
  }
}

export class UpdateEmployeeUseCase {
  constructor(
    private readonly employeeRepo: IEmployeeRepository,
    private readonly shiftRepo: IShiftRepository,
  ) {}

  async execute(id: string, dto: UpdateEmployeeDTO): Promise<Employee> {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) throw new Error("Empleado no encontrado");

    if (dto.shiftId) {
      const shift = await this.shiftRepo.findById(dto.shiftId);
      if (!shift) throw new Error("Turno no encontrado");
    }

    if (dto.document && dto.document !== employee.document) {
      const existing = await this.employeeRepo.findByDocument(dto.document);
      if (existing) throw new Error("Ya existe un empleado con ese documento");
    }

    return this.employeeRepo.update(id, dto);
  }
}
