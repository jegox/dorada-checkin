import { z } from "zod";

// ─── Shift ─────────────────────────────────────────────────────────────────

export const CreateShiftSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(60),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
});

// ─── Employee ───────────────────────────────────────────────────────────────

export const CreateEmployeeSchema = z.object({
  document: z.string().min(1, "El documento es requerido").max(20),
  fullName: z.string().min(1, "El nombre es requerido").max(100),
  position: z.string().min(1, "El cargo es requerido").max(60),
  shiftId: z.string().min(1, "El turno es requerido"),
  baseSalary: z.number().min(0, "El salario no puede ser negativo").optional().default(0),
  salaryPeriod: z.enum(["DIA", "MENSUAL"]).optional().default("MENSUAL"),
  active: z.boolean().optional().default(true),
});

export const UpdateEmployeeSchema = z.object({
  document: z.string().min(1).max(20).optional(),
  fullName: z.string().min(1).max(100).optional(),
  position: z.string().min(1).max(60).optional(),
  shiftId: z.string().min(1).optional(),
  baseSalary: z.number().min(0).optional(),
  salaryPeriod: z.enum(["DIA", "MENSUAL"]).optional(),
  active: z.boolean().optional(),
});

// ─── Attendance ─────────────────────────────────────────────────────────────

export const RegisterAttendanceSchema = z.object({
  document: z.string().min(1, "El documento es requerido").max(20),
  type: z.enum(["CHECK_IN", "CHECK_OUT"], { message: "Tipo inválido" }),
});

// ─── Report query ───────────────────────────────────────────────────────────

export const ReportQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD")
    .optional(),
});

// ─── PayrollRule ─────────────────────────────────────────────────────────────

export const CreatePayrollRuleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(80),
  type: z.enum(["DESCUENTO", "CREDITO", "BONO", "TURNO_EXTRA"], { message: "Tipo inválido" }),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(200).optional(),
  period: z.enum(["DIA", "MENSUAL"]).optional().default("MENSUAL"),
  activeDays: z.array(z.number().int().min(0).max(6)).nullable().optional(),
});

export const UpdatePayrollRuleSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(200).nullable().optional(),
  active: z.boolean().optional(),
  period: z.enum(["DIA", "MENSUAL"]).optional(),
  activeDays: z.array(z.number().int().min(0).max(6)).nullable().optional(),
});

export const AssignRuleSchema = z.object({
  ruleId: z.string().min(1),
});
