"use client";
import { useCallback, useEffect, useState } from "react";
import type { ShiftDTO } from "@/presentation/types";
import { shiftService } from "@/presentation/services/shift.service";
import type { SaveResult } from "@/presentation/components/ui/ResultDialog";

interface CreateShiftInput {
  name: string;
  startTime: string;
  endTime: string;
}

interface UseTurnosReturn {
  shifts: ShiftDTO[];
  loading: boolean;
  saving: boolean;
  showForm: boolean;
  error: string;
  saveResult: SaveResult | null;
  form: CreateShiftInput;
  setShowForm: (v: boolean) => void;
  setField: (field: keyof CreateShiftInput, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
  clearSaveResult: () => void;
}

const EMPTY_FORM: CreateShiftInput = { name: "", startTime: "", endTime: "" };

export function useTurnos(): UseTurnosReturn {
  const [shifts, setShifts] = useState<ShiftDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowFormState] = useState(false);
  const [error, setError] = useState("");
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [form, setForm] = useState<CreateShiftInput>(EMPTY_FORM);

  const fetchShifts = useCallback(async () => {
    try {
      const data = await shiftService.getAll();
      setShifts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar turnos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const setShowForm = useCallback((v: boolean) => {
    setShowFormState(v);
    if (!v) {
      setError("");
      setForm(EMPTY_FORM);
    }
  }, []);

  const setField = useCallback((field: keyof CreateShiftInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name || !form.startTime || !form.endTime) {
        setError("Todos los campos son requeridos");
        return;
      }
      setSaving(true);
      setError("");
      try {
        await shiftService.create(form);
        setSaveResult({
          type: "success",
          title: "¡Turno creado!",
          message: `El turno "${form.name}" fue creado correctamente.`,
        });
        setForm(EMPTY_FORM);
        setShowFormState(false);
        await fetchShifts();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al guardar turno";
        setSaveResult({ type: "error", title: "Error al guardar", message: msg });
        setShowFormState(false);
      } finally {
        setSaving(false);
      }
    },
    [form, fetchShifts],
  );

  const clearError = useCallback(() => setError(""), []);
  const clearSaveResult = useCallback(() => setSaveResult(null), []);

  return {
    shifts,
    loading,
    saving,
    showForm,
    error,
    saveResult,
    form,
    setShowForm,
    setField,
    handleSubmit,
    clearError,
    clearSaveResult,
  };
}
