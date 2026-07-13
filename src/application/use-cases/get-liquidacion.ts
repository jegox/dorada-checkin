import type { IPayrollRuleRepository } from "@/domain/repositories";
import type { IEmployeeRepository } from "@/domain/repositories";
import type { GetLiquidacionOutputDTO, LiquidacionItemDTO } from "@/application/dto";

export class GetLiquidacionUseCase {
  constructor(
    private readonly employeeRepo: IEmployeeRepository,
    private readonly payrollRepo: IPayrollRuleRepository,
  ) {}

  async execute(year: number, month: number, fortnight: 1 | 2): Promise<GetLiquidacionOutputDTO> {
    const fromDay = fortnight === 1 ? 1 : 16;
    const toDay = fortnight === 1 ? 15 : new Date(year, month, 0).getDate(); // último día del mes
    const from = new Date(year, month - 1, fromDay);
    const to = new Date(year, month - 1, toDay, 23, 59, 59);

    const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const label = `Q${fortnight} ${monthNames[month - 1]} ${year} (${fromDay}–${toDay})`;

    const employees = await this.employeeRepo.findAll();
    const activeEmployees = employees.filter((e) => e.active);

    const items: LiquidacionItemDTO[] = await Promise.all(
      activeEmployees.map(async (emp) => {
        const empRules = await this.payrollRepo.findByEmployee(emp.id);
        const baseSalary = Number(emp.baseSalary ?? 0);
        const quincenal = baseSalary / 2;

        let creditos = 0, bonos = 0, turnosExtras = 0, descuentos = 0;
        const rules = empRules.map(({ rule }) => {
          const amt = Number(rule.amount);
          if (rule.type === "CREDITO")      creditos     += amt;
          if (rule.type === "BONO")         bonos        += amt;
          if (rule.type === "TURNO_EXTRA")  turnosExtras += amt;
          if (rule.type === "DESCUENTO")    descuentos   += amt;
          return { name: rule.name, type: rule.type, amount: amt };
        });

        const total = quincenal + creditos + bonos + turnosExtras - descuentos;

        return {
          employeeId: emp.id,
          document: emp.document,
          fullName: emp.fullName,
          position: emp.position,
          shift: emp.shift?.name ?? "—",
          baseSalary,
          quincenal,
          creditos,
          bonos,
          turnosExtras,
          descuentos,
          total,
          rules,
        };
      }),
    );

    const grandTotal = items.reduce((s, i) => s + i.total, 0);

    return {
      period: {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        label,
      },
      items,
      grandTotal,
    };
  }
}
