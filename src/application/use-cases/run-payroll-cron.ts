/**
 * RunPayrollCronUseCase
 *
 * Lógica de liquidación quincenal.
 * Se ejecuta el día 15 y último día de cada mes a las 23:45.
 *
 * Periodo 1: del 1 al 15 del mes
 * Periodo 2: del 16 al último día del mes
 */
import { prisma } from "@/infrastructure/database/prisma";
import { PrismaAdditionalPaymentRepository } from "@/infrastructure/repositories/additional-payment.repository";
import { PrismaDeductionRepository } from "@/infrastructure/repositories/deduction.repository";
import { PrismaPayrollLiquidationRepository } from "@/infrastructure/repositories/payroll-liquidation.repository";

// ─── Festivos Colombia 2026 ────────────────────────────────────────────────────
const HOLIDAYS_2026: Record<string, number[]> = {
  enero: [1, 12],
  febrero: [],
  marzo: [23],
  abril: [2, 3],
  mayo: [1, 18],
  junio: [5, 29],
  julio: [13, 20],
  agosto: [7, 17],
  septiembre: [],
  octubre: [12],
  noviembre: [2, 16],
  diciembre: [8, 25],
};

const MONTH_NAMES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Días de fin de semana + festivos en un rango de fechas */
function countFdsDays(from: Date, to: Date): number {
  let count = 0;
  const holidays = HOLIDAYS_2026[MONTH_NAMES_ES[from.getMonth()]] ?? [];
  const current = new Date(from);
  while (current <= to) {
    const day = current.getDay(); // 0=Dom, 6=Sáb
    const dom = current.getDate();
    if (day === 0 || day === 6 || holidays.includes(dom)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** Devuelve el último día del mes */
function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Nombre legible del período */
function periodLabel(year: number, month: number, fortnight: 1 | 2): string {
  const monthUpper = MONTH_NAMES_ES[month].toUpperCase();
  return fortnight === 1
    ? `PRIMERA QUINCENA ${monthUpper} ${year}`
    : `SEGUNDA QUINCENA ${monthUpper} ${year}`;
}

export async function runPayrollCron(year: number, month: number, fortnight: 1 | 2) {
  const addPaymentRepo = new PrismaAdditionalPaymentRepository();
  const deductionRepo = new PrismaDeductionRepository();
  const liquidRepo = new PrismaPayrollLiquidationRepository();

  const fromDay = fortnight === 1 ? 1 : 16;
  const toDay = fortnight === 1 ? 15 : lastDayOfMonth(year, month);
  const from = new Date(year, month, fromDay, 0, 0, 0);
  const to = new Date(year, month, toDay, 23, 59, 59);
  const period = periodLabel(year, month, fortnight);

  // Limpiar liquidaciones previas del mismo período
  await liquidRepo.deleteByPeriod(period);

  const employees = await prisma.employee.findMany({
    where: { active: true },
    include: { shift: true, settings: { include: { setting: true } } },
  });

  // ─── AMOUNT_FDS_CHEF / AMOUNT_FDS_AUX ─────────────────────────────────────
  const fdsSettings = await prisma.setting.findMany({
    where: { key: { in: ["AMOUNT_FDS_CHEF", "AMOUNT_FDS_AUX"] }, active: true },
    include: { employees: true },
  });
  const fdsDays = countFdsDays(from, to);

  for (const setting of fdsSettings) {
    const amount = parseFloat(setting.value) * fdsDays;
    if (amount <= 0) continue;
    for (const empLink of setting.employees) {
      await addPaymentRepo.create({
        employeeId: empLink.employeeId,
        amount,
        date: to,
        concept: `${setting.key} — ${fdsDays} días FDS/festivos`,
      });
    }
  }

  // ─── AMOUNT_SHIFT_LUNCH / AMOUNT_SHIFT_FOODS ──────────────────────────────
  const shiftSettings = await prisma.setting.findMany({
    where: { key: { in: ["AMOUNT_SHIFT_LUNCH", "AMOUNT_SHIFT_FOODS"] }, active: true },
    include: { employees: true },
  });

  for (const employee of employees) {
    const checkIns = await prisma.attendance.count({
      where: {
        employeeId: employee.id,
        type: "CHECK_IN",
        createdAt: { gte: from, lte: to },
      },
    });

    for (const setting of shiftSettings) {
      const isAssigned = setting.employees.some((e) => e.employeeId === employee.id);
      if (!isAssigned) continue;

      const rate = parseFloat(setting.value);

      if (setting.key === "AMOUNT_SHIFT_LUNCH") {
        // Solo si hay exactamente 13 días de asistencia
        if (checkIns === 13) {
          await addPaymentRepo.create({
            employeeId: employee.id,
            amount: rate,
            date: to,
            concept: `AMOUNT_SHIFT_LUNCH — ${checkIns} días`,
          });
        }
      } else if (setting.key === "AMOUNT_SHIFT_FOODS") {
        const amount = rate * checkIns;
        if (amount > 0) {
          await addPaymentRepo.create({
            employeeId: employee.id,
            amount,
            date: to,
            concept: `AMOUNT_SHIFT_FOODS — ${checkIns} días`,
          });
        }
      }
    }
  }

  // ─── Liquidación de nómina ────────────────────────────────────────────────
  const liquidations = [];

  for (const employee of employees) {
    const checkIns = await prisma.attendance.count({
      where: {
        employeeId: employee.id,
        type: "CHECK_IN",
        createdAt: { gte: from, lte: to },
      },
    });

    const baseSalary = Number(employee.baseSalary ?? 0);
    // Valor por día según salaryPeriod
    const dailyRate = employee.salaryPeriod === "DIA" ? baseSalary : baseSalary / 30;
    const workedAmount = dailyRate * checkIns;

    const totalAdditional = await addPaymentRepo.sumByEmployeeAndPeriod(employee.id, from, to);
    const totalDeductions = await deductionRepo.sumByEmployeeAndPeriod(employee.id, from, to);

    const monto = workedAmount + totalAdditional;
    const deductions = totalDeductions;

    const record = await liquidRepo.create({
      period,
      startDate: from,
      endDate: to,
      employeeId: employee.id,
      deductions,
      amount: monto,
    });

    liquidations.push(record);
  }

  return { period, liquidations: liquidations.length };
}
