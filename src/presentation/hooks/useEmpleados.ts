"use client";
import { useCallback, useEffect, useState } from "react";
import type { EmployeeDTO, ShiftDTO } from "@/presentation/types";
import { employeeService } from "@/presentation/services/employee.service";
import { shiftService } from "@/presentation/services/shift.service";
import type { SaveResult } from "@/presentation/components/ui/ResultDialog";

interface EmployeeFormInput {
  document: string;
  fullName: string;
  position: string;
  shiftId: string;
}

interface UseEmpleadosReturn {
  employees: EmployeeDTO[];
  shifts: ShiftDTO[];
  loading: boolean;
  saving: boolean;
  showForm: boolean;
  editingEmployee: EmployeeDTO | null;
  selectedEmployee: EmployeeDTO | null;
  error: string;
  saveResult: SaveResult | null;
  form: EmployeeFormInput;
  activeCount: number;
  setShowForm: (v: boolean) => void;
  startEdit: (emp: EmployeeDTO) => void;
  cancelEdit: () => void;
  selectEmployee: (emp: EmployeeDTO | null) => void;
  setField: (field: keyof EmployeeFormInput, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleToggleActive: (emp: EmployeeDTO) => Promise<void>;
  clearSaveResult: () => void;
}

const EMPTY_FORM: EmployeeFormInput = {
  document: "",
  fullName: "",
  position: "",
  shiftId: "",
};

export function useEmpleados(): UseEmpleadosReturn {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [shifts, setShifts] = useState<ShiftDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowFormState] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDTO | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [error, setError] = useState("");
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [form, setForm] = useState<EmployeeFormInput>(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    try {
      const [empData, shiftData] = await Promise.all([
        employeeService.getAll(),
        shiftService.getAll(),
      ]);
      setEmployees(empData);
      setShifts(shiftData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setShowForm = useCallback((v: boolean) => {
    setShowFormState(v);
    if (!v) {
      setError("");
      setForm(EMPTY_FORM);
      setEditingEmployee(null);
    }
  }, []);

  const startEdit = useCallback((emp: EmployeeDTO) => {
    setEditingEmployee(emp);
    setForm({
      document: emp.document,
      fullName: emp.fullName,
      position: emp.position,
      shiftId: emp.shiftId,
    });
    setError("");
    setShowFormState(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingEmployee(null);
    setShowFormState(false);
    setForm(EMPTY_FORM);
    setError("");
  }, []);

  const setField = useCallback((field: keyof EmployeeFormInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.document || !form.fullName || !form.position || !form.shiftId) {
        setError("Todos los campos son requeridos");
        return;
      }
      setSaving(true);
      setError("");
      const payload = {
        document: form.document,
        fullName: form.fullName,
        position: form.position,
        shiftId: form.shiftId,
      };
      try {
        if (editingEmployee) {
          await employeeService.update(editingEmployee.id, payload);
          setSaveResult({
            type: "success",
            title: "¡Cambios guardados!",
            message: `Los datos de ${form.fullName} fueron actualizados correctamente.`,
          });
          setEditingEmployee(null);
        } else {
          await employeeService.create(payload);
          setSaveResult({
            type: "success",
            title: "¡Empleado creado!",
            message: `${form.fullName} fue registrado correctamente.`,
          });
        }
        setForm(EMPTY_FORM);
        setShowFormState(false);
        await fetchData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al guardar empleado";
        setSaveResult({ type: "error", title: "Error al guardar", message: msg });
        setShowFormState(false);
      } finally {
        setSaving(false);
      }
    },
    [form, editingEmployee, fetchData],
  );

  const handleToggleActive = useCallback(
    async (emp: EmployeeDTO) => {
      try {
        await employeeService.toggleActive(emp.id, !emp.active);
        await fetchData();
        setSaveResult({
          type: "success",
          title: emp.active ? "Empleado desactivado" : "Empleado activado",
          message: `${emp.fullName} fue ${emp.active ? "desactivado" : "activado"} correctamente.`,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al actualizar empleado";
        setSaveResult({ type: "error", title: "Error", message: msg });
      }
    },
    [fetchData],
  );

  const clearSaveResult = useCallback(() => setSaveResult(null), []);
  const selectEmployee = useCallback((emp: EmployeeDTO | null) => setSelectedEmployee(emp), []);

  const activeCount = employees.filter((e) => e.active).length;

  return {
    employees,
    shifts,
    loading,
    saving,
    showForm,
    editingEmployee,
    selectedEmployee,
    error,
    saveResult,
    form,
    activeCount,
    setShowForm,
    startEdit,
    cancelEdit,
    selectEmployee,
    setField,
    handleSubmit,
    handleToggleActive,
    clearSaveResult,
  };
}
