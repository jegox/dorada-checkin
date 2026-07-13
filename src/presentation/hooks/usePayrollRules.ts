"use client";
import { useCallback, useEffect, useState } from "react";
import type { PayrollRuleDTO, EmployeeRuleDTO, PayrollRuleType } from "@/presentation/types";
import { payrollRuleService } from "@/presentation/services/payroll-rule.service";
import type { SaveResult } from "@/presentation/components/ui/ResultDialog";

export interface RuleForm {
  name: string;
  type: PayrollRuleType;
  amount: string;
  description: string;
  period: "DIA" | "MENSUAL";
  activeDays: number[];
}
const EMPTY_FORM: RuleForm = {
  name: "",
  type: "DESCUENTO",
  amount: "",
  description: "",
  period: "MENSUAL",
  activeDays: [],
};

interface UsePayrollRulesReturn {
  allRules: PayrollRuleDTO[];
  employeeRules: EmployeeRuleDTO[];
  loadingRules: boolean;
  savingRule: boolean;
  showRuleForm: boolean;
  editingRule: PayrollRuleDTO | null;
  ruleForm: RuleForm;
  saveResult: SaveResult | null;
  setShowRuleForm: (v: boolean) => void;
  startEditRule: (rule: PayrollRuleDTO) => void;
  cancelEditRule: () => void;
  setRuleField: <K extends keyof RuleForm>(k: K, v: RuleForm[K]) => void;
  toggleActiveDay: (day: number) => void;
  handleSaveRule: (e: React.FormEvent) => Promise<void>;
  handleToggleRule: (id: string, active: boolean) => Promise<void>;
  handleDeleteRule: (id: string) => Promise<void>;
  handleAssignRule: (ruleId: string) => Promise<void>;
  handleRemoveRule: (ruleId: string) => Promise<void>;
  clearSaveResult: () => void;
  loadForEmployee: (employeeId: string) => Promise<void>;
}

export function usePayrollRules(employeeId?: string): UsePayrollRulesReturn {
  const [allRules, setAllRules] = useState<PayrollRuleDTO[]>([]);
  const [employeeRules, setEmployeeRules] = useState<EmployeeRuleDTO[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [savingRule, setSavingRule] = useState(false);
  const [showRuleForm, setShowRuleFormState] = useState(false);
  const [editingRule, setEditingRule] = useState<PayrollRuleDTO | null>(null);
  const [ruleForm, setRuleFormState] = useState<RuleForm>(EMPTY_FORM);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  const fetchAll = useCallback(async () => {
    setLoadingRules(true);
    try {
      setAllRules(await payrollRuleService.getAll());
    } finally {
      setLoadingRules(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const loadForEmployee = useCallback(async (empId: string) => {
    try {
      setEmployeeRules(await payrollRuleService.getByEmployee(empId));
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    if (employeeId) loadForEmployee(employeeId);
    else setEmployeeRules([]);
  }, [employeeId, loadForEmployee]);

  const setShowRuleForm = useCallback((v: boolean) => {
    setShowRuleFormState(v);
    if (!v) {
      setEditingRule(null);
      setRuleFormState(EMPTY_FORM);
    }
  }, []);

  const startEditRule = useCallback((rule: PayrollRuleDTO) => {
    setEditingRule(rule);
    setRuleFormState({
      name: rule.name,
      type: rule.type,
      amount: String(rule.amount),
      description: rule.description ?? "",
      period: (rule.period as "DIA" | "MENSUAL") ?? "MENSUAL",
      activeDays: rule.activeDays ?? [],
    });
    setShowRuleFormState(true);
  }, []);

  const cancelEditRule = useCallback(() => {
    setEditingRule(null);
    setShowRuleFormState(false);
    setRuleFormState(EMPTY_FORM);
  }, []);

  const setRuleField = useCallback(<K extends keyof RuleForm>(k: K, v: RuleForm[K]) => {
    setRuleFormState((p) => ({ ...p, [k]: v }));
  }, []);

  const toggleActiveDay = useCallback((day: number) => {
    setRuleFormState((p) => ({
      ...p,
      activeDays: p.activeDays.includes(day)
        ? p.activeDays.filter((d) => d !== day)
        : [...p.activeDays, day].sort((a, b) => a - b),
    }));
  }, []);

  const handleSaveRule = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!ruleForm.name || !ruleForm.amount) {
        setSaveResult({
          type: "error",
          title: "Campos requeridos",
          message: "Nombre y monto son obligatorios.",
        });
        return;
      }
      const amount = parseFloat(ruleForm.amount);
      if (isNaN(amount) || amount <= 0) {
        setSaveResult({
          type: "error",
          title: "Monto inválido",
          message: "El monto debe ser mayor a 0.",
        });
        return;
      }
      const activeDays =
        ruleForm.type === "BONO" && ruleForm.activeDays.length > 0 ? ruleForm.activeDays : null;

      setSavingRule(true);
      try {
        if (editingRule) {
          await payrollRuleService.update(editingRule.id, {
            name: ruleForm.name,
            amount,
            description: ruleForm.description || null,
            period: ruleForm.period,
            activeDays,
          });
          setSaveResult({
            type: "success",
            title: "¡Regla actualizada!",
            message: `La regla "${ruleForm.name}" fue actualizada.`,
          });
        } else {
          await payrollRuleService.create({
            name: ruleForm.name,
            type: ruleForm.type,
            amount,
            description: ruleForm.description || undefined,
            period: ruleForm.period,
            activeDays,
          });
          setSaveResult({
            type: "success",
            title: "¡Regla creada!",
            message: `La regla "${ruleForm.name}" fue creada.`,
          });
        }
        await fetchAll();
        setShowRuleFormState(false);
        setEditingRule(null);
        setRuleFormState(EMPTY_FORM);
      } catch (err: unknown) {
        setSaveResult({
          type: "error",
          title: "Error al guardar",
          message: err instanceof Error ? err.message : "Error",
        });
      } finally {
        setSavingRule(false);
      }
    },
    [ruleForm, editingRule, fetchAll],
  );

  const handleToggleRule = useCallback(
    async (id: string, active: boolean) => {
      try {
        await payrollRuleService.update(id, { active });
        await fetchAll();
        setSaveResult({
          type: "success",
          title: active ? "Regla activada" : "Regla desactivada",
          message: active
            ? "La regla está activa."
            : "La regla está desactivada y no se aplicará en liquidaciones.",
        });
      } catch (err: unknown) {
        setSaveResult({
          type: "error",
          title: "Error",
          message: err instanceof Error ? err.message : "Error",
        });
      }
    },
    [fetchAll],
  );

  const handleDeleteRule = useCallback(
    async (id: string) => {
      try {
        await payrollRuleService.delete(id);
        await fetchAll();
        if (employeeId) setEmployeeRules((prev) => prev.filter((r) => r.ruleId !== id));
        setSaveResult({
          type: "success",
          title: "Regla eliminada",
          message: "La regla fue eliminada.",
        });
      } catch (err: unknown) {
        setSaveResult({
          type: "error",
          title: "Error",
          message: err instanceof Error ? err.message : "Error",
        });
      }
    },
    [fetchAll, employeeId],
  );

  const handleAssignRule = useCallback(
    async (ruleId: string) => {
      if (!employeeId) return;
      try {
        await payrollRuleService.assign(employeeId, ruleId);
        await loadForEmployee(employeeId);
        setSaveResult({
          type: "success",
          title: "Regla asignada",
          message: "La regla fue asignada al empleado.",
        });
      } catch (err: unknown) {
        setSaveResult({
          type: "error",
          title: "Error",
          message: err instanceof Error ? err.message : "Error",
        });
      }
    },
    [employeeId, loadForEmployee],
  );

  const handleRemoveRule = useCallback(
    async (ruleId: string) => {
      if (!employeeId) return;
      try {
        await payrollRuleService.remove(employeeId, ruleId);
        await loadForEmployee(employeeId);
        setSaveResult({
          type: "success",
          title: "Regla removida",
          message: "La regla fue removida del empleado.",
        });
      } catch (err: unknown) {
        setSaveResult({
          type: "error",
          title: "Error",
          message: err instanceof Error ? err.message : "Error",
        });
      }
    },
    [employeeId, loadForEmployee],
  );

  return {
    allRules,
    employeeRules,
    loadingRules,
    savingRule,
    showRuleForm,
    editingRule,
    ruleForm,
    saveResult,
    setShowRuleForm,
    startEditRule,
    cancelEditRule,
    setRuleField,
    toggleActiveDay,
    handleSaveRule,
    handleToggleRule,
    handleDeleteRule,
    handleAssignRule,
    handleRemoveRule,
    clearSaveResult: () => setSaveResult(null),
    loadForEmployee,
  };
}
