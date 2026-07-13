"use client";
import { useCallback, useEffect, useState } from "react";
import type { SettingDTO } from "@/presentation/types";
import { settingService } from "@/presentation/services/setting.service";
import type { SaveResult } from "@/presentation/components/ui/ResultDialog";

export interface SettingFormInput {
  key: string;
  value: string;
  employeeIds: string[];
}

const EMPTY_FORM: SettingFormInput = { key: "", value: "", employeeIds: [] };

interface UseConfiguracionesReturn {
  settings: SettingDTO[];
  loading: boolean;
  saving: boolean;
  showForm: boolean;
  editingSetting: SettingDTO | null;
  error: string;
  saveResult: SaveResult | null;
  form: SettingFormInput;
  setShowForm: (v: boolean) => void;
  startEdit: (setting: SettingDTO) => void;
  cancelEdit: () => void;
  setField: (field: "key" | "value", value: string) => void;
  toggleEmployee: (employeeId: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleToggleActive: (setting: SettingDTO) => Promise<void>;
  clearSaveResult: () => void;
}

export function useConfiguraciones(): UseConfiguracionesReturn {
  const [settings, setSettings] = useState<SettingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowFormState] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SettingDTO | null>(null);
  const [error, setError] = useState("");
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [form, setForm] = useState<SettingFormInput>(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    try {
      const data = await settingService.getAll();
      setSettings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar configuraciones");
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
      setEditingSetting(null);
    }
  }, []);

  const startEdit = useCallback((setting: SettingDTO) => {
    setEditingSetting(setting);
    setForm({
      key: setting.key,
      value: setting.value,
      employeeIds: setting.employees.map((e) => e.id),
    });
    setError("");
    setShowFormState(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingSetting(null);
    setShowFormState(false);
    setForm(EMPTY_FORM);
    setError("");
  }, []);

  const setField = useCallback((field: "key" | "value", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleEmployee = useCallback((employeeId: string) => {
    setForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(employeeId)
        ? prev.employeeIds.filter((id) => id !== employeeId)
        : [...prev.employeeIds, employeeId],
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.key.trim() || !form.value.trim()) {
        setError("La clave y el valor son requeridos");
        return;
      }
      setSaving(true);
      setError("");
      const payload = {
        key: form.key.trim(),
        value: form.value.trim(),
        employeeIds: form.employeeIds,
      };
      try {
        if (editingSetting) {
          await settingService.update(editingSetting.id, payload);
          setSaveResult({
            type: "success",
            title: "¡Cambios guardados!",
            message: `La configuración ${form.key} fue actualizada correctamente.`,
          });
          setEditingSetting(null);
        } else {
          await settingService.create(payload);
          setSaveResult({
            type: "success",
            title: "¡Configuración creada!",
            message: `${form.key} fue creada correctamente.`,
          });
        }
        setForm(EMPTY_FORM);
        setShowFormState(false);
        await fetchData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al guardar configuración";
        setSaveResult({ type: "error", title: "Error al guardar", message: msg });
        setShowFormState(false);
      } finally {
        setSaving(false);
      }
    },
    [form, editingSetting, fetchData],
  );

  const handleToggleActive = useCallback(
    async (setting: SettingDTO) => {
      try {
        await settingService.toggleActive(setting.id, !setting.active);
        await fetchData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al actualizar configuración";
        setSaveResult({ type: "error", title: "Error", message: msg });
      }
    },
    [fetchData],
  );

  const clearSaveResult = useCallback(() => setSaveResult(null), []);

  return {
    settings,
    loading,
    saving,
    showForm,
    editingSetting,
    error,
    saveResult,
    form,
    setShowForm,
    startEdit,
    cancelEdit,
    setField,
    toggleEmployee,
    handleSubmit,
    handleToggleActive,
    clearSaveResult,
  };
}
