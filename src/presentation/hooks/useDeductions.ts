"use client";
import { useCallback, useEffect, useState } from "react";
import type { DeductionDTO, EmployeeDTO } from "@/presentation/types";
import { deductionService } from "@/presentation/services/deduction.service";
import type { SaveResult } from "@/presentation/components/ui/ResultDialog";

interface DeductionForm {
  employeeId: string;
  amount: string;
  date: string;
  concept: string;
}
const EMPTY: DeductionForm = {
  employeeId: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  concept: "",
};

export function useDeductions(employees: EmployeeDTO[]) {
  const [deductions, setDeductions] = useState<DeductionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DeductionForm>(EMPTY);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      setDeductions(await deductionService.getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  void employees; // passed from parent to keep in scope for select options

  const setField = useCallback((k: keyof DeductionForm, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.employeeId || !form.amount || !form.date || !form.concept) {
        setSaveResult({
          type: "error",
          title: "Campos requeridos",
          message: "Completa todos los campos.",
        });
        return;
      }
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        setSaveResult({
          type: "error",
          title: "Monto inválido",
          message: "El monto debe ser mayor a 0.",
        });
        return;
      }
      setSaving(true);
      try {
        await deductionService.create({
          employeeId: form.employeeId,
          amount,
          date: form.date,
          concept: form.concept,
        });
        setForm({ ...EMPTY, date: form.date });
        await fetchAll();
        setSaveResult({
          type: "success",
          title: "¡Deducción creada!",
          message: "La deducción fue registrada.",
        });
      } catch (err: unknown) {
        setSaveResult({
          type: "error",
          title: "Error",
          message: err instanceof Error ? err.message : "Error",
        });
      } finally {
        setSaving(false);
      }
    },
    [form, fetchAll],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await deductionService.delete(pendingDelete);
      await fetchAll();
      setSaveResult({
        type: "success",
        title: "Deducción eliminada",
        message: "El registro fue eliminado.",
      });
    } catch (err: unknown) {
      setSaveResult({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Error",
      });
    } finally {
      setPendingDelete(null);
    }
  }, [pendingDelete, fetchAll]);

  return {
    deductions,
    loading,
    saving,
    form,
    saveResult,
    pendingDelete,
    setField,
    handleCreate,
    setPendingDelete,
    confirmDelete,
    clearSaveResult: () => setSaveResult(null),
  };
}
