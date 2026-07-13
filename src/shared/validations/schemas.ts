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
  active: z.boolean().optional().default(true),
});

export const UpdateEmployeeSchema = z.object({
  document: z.string().min(1).max(20).optional(),
  fullName: z.string().min(1).max(100).optional(),
  position: z.string().min(1).max(60).optional(),
  shiftId: z.string().min(1).optional(),
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

// ─── Settings ────────────────────────────────────────────────────────────────

export const CreateSettingSchema = z.object({
  key: z.string().min(1, "La clave es requerida").max(80),
  value: z.string().min(1, "El valor es requerido").max(255),
  active: z.boolean().optional().default(true),
  employeeIds: z.array(z.string().min(1)).optional().default([]),
});

export const UpdateSettingSchema = z.object({
  key: z.string().min(1).max(80).optional(),
  value: z.string().min(1).max(255).optional(),
  active: z.boolean().optional(),
  employeeIds: z.array(z.string().min(1)).optional(),
});
