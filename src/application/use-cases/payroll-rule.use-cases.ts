import type { IPayrollRuleRepository } from "@/domain/repositories";
import type { PayrollRule, EmployeePayrollRule } from "@/domain/entities";
import type { CreatePayrollRuleDTO, UpdatePayrollRuleDTO } from "@/application/dto";

export class GetPayrollRulesUseCase {
  constructor(private readonly repo: IPayrollRuleRepository) {}
  async execute(): Promise<PayrollRule[]> {
    return this.repo.findAll();
  }
}

export class CreatePayrollRuleUseCase {
  constructor(private readonly repo: IPayrollRuleRepository) {}
  async execute(dto: CreatePayrollRuleDTO): Promise<PayrollRule> {
    return this.repo.create(dto);
  }
}

export class DeletePayrollRuleUseCase {
  constructor(private readonly repo: IPayrollRuleRepository) {}
  async execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

export class UpdatePayrollRuleUseCase {
  constructor(private readonly repo: IPayrollRuleRepository) {}
  async execute(id: string, dto: UpdatePayrollRuleDTO): Promise<PayrollRule> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Regla no encontrada");
    return this.repo.update(id, dto);
  }
}

export class AssignRuleToEmployeeUseCase {
  constructor(private readonly repo: IPayrollRuleRepository) {}
  async execute(employeeId: string, ruleId: string): Promise<EmployeePayrollRule> {
    const rule = await this.repo.findById(ruleId);
    if (!rule) throw new Error("Regla no encontrada");
    return this.repo.assignToEmployee(employeeId, ruleId);
  }
}

export class RemoveRuleFromEmployeeUseCase {
  constructor(private readonly repo: IPayrollRuleRepository) {}
  async execute(employeeId: string, ruleId: string): Promise<void> {
    return this.repo.removeFromEmployee(employeeId, ruleId);
  }
}

export class GetEmployeeRulesUseCase {
  constructor(private readonly repo: IPayrollRuleRepository) {}
  async execute(employeeId: string) {
    return this.repo.findByEmployee(employeeId);
  }
}
