"use client";
import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, Button, Spinner } from "@heroui/react";
import {
  Users,
  Plus,
  X,
  UserCheck,
  UserX,
  Pencil,
  PowerOff,
  Power,
  Settings2,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  MinusCircle,
  PlusCircle,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useEmpleados } from "@/presentation/hooks/useEmpleados";
import { useConfiguraciones } from "@/presentation/hooks/useConfiguraciones";
import { useDeductions } from "@/presentation/hooks/useDeductions";
import { useAdditionalPayments } from "@/presentation/hooks/useAdditionalPayments";
import { ConfirmDialog } from "@/presentation/components/ui/ConfirmDialog";
import { ResultDialog } from "@/presentation/components/ui/ResultDialog";
import type { EmployeeDTO, SettingDTO } from "@/presentation/types";

// ─── Tab helper ───────────────────────────────────────────────────────────────
function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-default-500 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Item de empleado ─────────────────────────────────────────────────────────
function EmployeeItem({
  emp,
  onEdit,
  onToggleActive,
}: {
  emp: EmployeeDTO;
  onEdit: (emp: EmployeeDTO) => void;
  onToggleActive: (emp: EmployeeDTO) => void;
}) {
  return (
    <div className='flex items-center justify-between p-4 rounded-lg border border-default-200 bg-default-50'>
      <div className='flex items-center gap-3'>
        <div className={`p-2 rounded-lg ${emp.active ? "bg-green-50" : "bg-default-200"}`}>
          {emp.active ? (
            <UserCheck className='w-5 h-5 text-green-600' />
          ) : (
            <UserX className='w-5 h-5 text-default-400' />
          )}
        </div>
        <div>
          <p className='font-semibold'>{emp.fullName}</p>
          <p className='text-sm text-default-500'>
            Doc: {emp.document} · {emp.position}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-xs px-2 py-1 rounded-full bg-default-100 text-default-600 font-medium'>
          {emp.shift?.name ?? "—"}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            emp.active ? "bg-green-100 text-green-700" : "bg-default-100 text-default-500"
          }`}
        >
          {emp.active ? "Activo" : "Inactivo"}
        </span>
        <Button isIconOnly size='sm' variant='ghost' onPress={() => onEdit(emp)}>
          <Pencil className='w-4 h-4 text-default-500' />
        </Button>
        <Button isIconOnly size='sm' variant='ghost' onPress={() => onToggleActive(emp)}>
          {emp.active ? (
            <PowerOff className='w-4 h-4 text-danger' />
          ) : (
            <Power className='w-4 h-4 text-success' />
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Item de configuración ────────────────────────────────────────────────────
function SettingItem({
  setting,
  onEdit,
  onToggleActive,
}: {
  setting: SettingDTO;
  onEdit: (setting: SettingDTO) => void;
  onToggleActive: (setting: SettingDTO) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
        setting.active
          ? "border-default-200 bg-default-50"
          : "border-default-100 bg-default-50/50 opacity-60"
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-primary/10'>
          <KeyRound className='w-5 h-5 text-primary' />
        </div>
        <div>
          <p className={`font-semibold ${!setting.active ? "line-through text-default-400" : ""}`}>
            {setting.key}
          </p>
          <p className='text-sm text-default-500'>
            Valor: <span className='font-medium'>{setting.value}</span>
          </p>
          <p className='text-xs text-default-400'>
            {setting.employees.length === 0
              ? "Global (todos los empleados)"
              : `Asignada a: ${setting.employees.map((e) => e.fullName).join(", ")}`}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            setting.active ? "bg-green-100 text-green-700" : "bg-default-100 text-default-500"
          }`}
        >
          {setting.active ? "Activa" : "Inactiva"}
        </span>
        <Button isIconOnly size='sm' variant='ghost' onPress={() => onEdit(setting)}>
          <Pencil className='w-4 h-4 text-default-500' />
        </Button>
        <Button isIconOnly size='sm' variant='ghost' onPress={() => onToggleActive(setting)}>
          {setting.active ? (
            <ToggleRight className='w-5 h-5 text-success' />
          ) : (
            <ToggleLeft className='w-5 h-5 text-default-400' />
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export function EmpleadosView() {
  const [activeTab, setActiveTab] = useState<
    "empleados" | "configuraciones" | "deducciones" | "pagos"
  >("empleados");

  const {
    employees,
    shifts,
    loading,
    saving,
    showForm,
    editingEmployee,
    error,
    saveResult: empSaveResult,
    form,
    activeCount,
    setShowForm,
    startEdit,
    cancelEdit,
    setField,
    handleSubmit,
    handleToggleActive,
    clearSaveResult: clearEmpResult,
  } = useEmpleados();

  const {
    settings,
    loading: loadingSettings,
    saving: savingSetting,
    showForm: showSettingForm,
    editingSetting,
    error: settingError,
    saveResult: settingSaveResult,
    form: settingForm,
    setShowForm: setShowSettingForm,
    startEdit: startEditSetting,
    cancelEdit: cancelEditSetting,
    setField: setSettingField,
    toggleEmployee,
    handleSubmit: handleSaveSetting,
    handleToggleActive: handleToggleSetting,
    clearSaveResult: clearSettingResult,
  } = useConfiguraciones();

  const deductionHook = useDeductions(employees);
  const addPaymentHook = useAdditionalPayments(employees);

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);

  // ConfirmDialog para toggle de empleado
  const [pendingToggle, setPendingToggle] = useState<EmployeeDTO | null>(null);
  const [toggling, setToggling] = useState(false);

  const requestToggle = useCallback((emp: EmployeeDTO) => setPendingToggle(emp), []);
  const confirmToggle = useCallback(async () => {
    if (!pendingToggle) return;
    setToggling(true);
    try {
      await handleToggleActive(pendingToggle);
    } finally {
      setToggling(false);
      setPendingToggle(null);
    }
  }, [pendingToggle, handleToggleActive]);

  return (
    <>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold'>Empleados</h2>
            <p className='text-sm text-default-500'>
              {employees.length} registrados · {activeCount} activos
            </p>
          </div>
          {activeTab === "empleados" && (
            <Button
              variant='primary'
              onPress={() => setShowForm(!showForm)}
              isDisabled={shifts.length === 0}
            >
              <Plus className='w-4 h-4 mr-1' /> Nuevo Empleado
            </Button>
          )}
          {activeTab === "configuraciones" && (
            <Button variant='primary' onPress={() => setShowSettingForm(!showSettingForm)}>
              <Plus className='w-4 h-4 mr-1' /> Nueva Configuración
            </Button>
          )}
        </div>

        {shifts.length === 0 && !loading && (
          <div className='p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm'>
            Primero crea al menos un turno en la sección <strong>Turnos</strong>.
          </div>
        )}

        {error && !showForm && (
          <div className='p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-center'>
            <AlertCircle className='w-4 h-4 shrink-0' />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className='flex gap-1 border-b border-default-200 flex-wrap'>
          <Tab
            label='Lista de Empleados'
            active={activeTab === "empleados"}
            onClick={() => setActiveTab("empleados")}
          />
          <Tab
            label='Configuraciones'
            active={activeTab === "configuraciones"}
            onClick={() => setActiveTab("configuraciones")}
          />
          <Tab
            label='Deducciones'
            active={activeTab === "deducciones"}
            onClick={() => setActiveTab("deducciones")}
          />
          <Tab
            label='Pagos Adicionales'
            active={activeTab === "pagos"}
            onClick={() => setActiveTab("pagos")}
          />
        </div>

        {/* ── Tab: Empleados ── */}
        {activeTab === "empleados" && (
          <>
            {showForm && (
              <Card>
                <CardHeader className='flex items-center justify-between'>
                  <span className='font-semibold'>
                    {editingEmployee
                      ? `Editando: ${editingEmployee.fullName}`
                      : "Registrar empleado"}
                  </span>
                  <Button isIconOnly variant='ghost' size='sm' onPress={cancelEdit}>
                    <X className='w-4 h-4' />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    {error && <p className='text-danger text-sm'>{error}</p>}
                    <div className='grid grid-cols-2 gap-4'>
                      {(["document", "fullName"] as const).map((field) => (
                        <div key={field} className='flex flex-col gap-1'>
                          <label className='text-sm font-medium text-default-700'>
                            {field === "document" ? "Documento" : "Nombre completo"}
                          </label>
                          <input
                            className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                            placeholder={field === "document" ? "Ej: 12345678" : "Ej: Juan Pérez"}
                            value={form[field]}
                            onChange={(e) => setField(field, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Cargo</label>
                        <input
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          placeholder='Ej: Operador'
                          value={form.position}
                          onChange={(e) => setField("position", e.target.value)}
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Turno</label>
                        <select
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          value={form.shiftId}
                          onChange={(e) => setField("shiftId", e.target.value)}
                        >
                          <option value=''>Seleccionar turno</option>
                          {shifts.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.startTime} - {s.endTime})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className='flex gap-2 justify-end'>
                      <Button variant='ghost' onPress={cancelEdit}>
                        Cancelar
                      </Button>
                      <Button type='submit' variant='primary' isDisabled={saving}>
                        {saving ? (
                          <Spinner size='sm' />
                        ) : editingEmployee ? (
                          "Guardar cambios"
                        ) : (
                          "Guardar"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className='py-4'>
                {loading ? (
                  <div className='flex justify-center py-10'>
                    <Spinner size='lg' />
                  </div>
                ) : employees.length === 0 ? (
                  <div className='flex flex-col items-center py-16 gap-3 text-default-400'>
                    <Users className='w-12 h-12' />
                    <p>No hay empleados registrados</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {employees.map((emp) => (
                      <EmployeeItem
                        key={emp.id}
                        emp={emp}
                        onEdit={startEdit}
                        onToggleActive={requestToggle}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Tab: Configuraciones ── */}
        {activeTab === "configuraciones" && (
          <>
            {showSettingForm && (
              <Card>
                <CardHeader className='flex items-center justify-between'>
                  <span className='font-semibold'>
                    {editingSetting ? `Editando: ${editingSetting.key}` : "Nueva configuración"}
                  </span>
                  <Button isIconOnly variant='ghost' size='sm' onPress={cancelEditSetting}>
                    <X className='w-4 h-4' />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSetting} className='flex flex-col gap-4'>
                    {settingError && <p className='text-danger text-sm'>{settingError}</p>}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Clave</label>
                        <input
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          placeholder='Ej: AMOUNT_BONO_FOODS'
                          value={settingForm.key}
                          onChange={(e) => setSettingField("key", e.target.value)}
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Valor</label>
                        <input
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          placeholder='Ej: 10000'
                          value={settingForm.value}
                          onChange={(e) => setSettingField("value", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Asignar empleados (varios) */}
                    <div className='flex flex-col gap-2'>
                      <label className='text-sm font-medium text-default-700'>
                        Asignar a empleados
                        <span className='ml-1 text-xs text-default-400'>
                          (vacío = aplica a todos / global)
                        </span>
                      </label>
                      {employees.length === 0 ? (
                        <p className='text-xs text-default-400'>No hay empleados registrados.</p>
                      ) : (
                        <div className='flex flex-wrap gap-2'>
                          {employees.map((emp) => {
                            const selected = settingForm.employeeIds.includes(emp.id);
                            return (
                              <button
                                key={emp.id}
                                type='button'
                                onClick={() => toggleEmployee(emp.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                  selected
                                    ? "bg-green-600 text-white border-green-600 shadow-sm ring-2 ring-green-200"
                                    : "bg-default-100 text-default-600 border-default-300 hover:border-default-400"
                                }`}
                              >
                                {selected ? (
                                  <UserCheck className='w-3 h-3' />
                                ) : (
                                  <Plus className='w-3 h-3' />
                                )}
                                {emp.fullName}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className='flex gap-2 justify-end'>
                      <Button variant='ghost' onPress={cancelEditSetting}>
                        Cancelar
                      </Button>
                      <Button type='submit' variant='primary' isDisabled={savingSetting}>
                        {savingSetting ? (
                          <Spinner size='sm' />
                        ) : editingSetting ? (
                          "Guardar cambios"
                        ) : (
                          "Crear configuración"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className='py-4'>
                {loadingSettings ? (
                  <div className='flex justify-center py-10'>
                    <Spinner size='lg' />
                  </div>
                ) : settings.length === 0 ? (
                  <div className='flex flex-col items-center py-16 gap-3 text-default-400'>
                    <Settings2 className='w-12 h-12' />
                    <p>No hay configuraciones creadas</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {settings.map((setting) => (
                      <SettingItem
                        key={setting.id}
                        setting={setting}
                        onEdit={startEditSetting}
                        onToggleActive={handleToggleSetting}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Tab: Deducciones ── */}
        {activeTab === "deducciones" && (
          <>
            <Card>
              <CardHeader>
                <span className='font-semibold flex items-center gap-2'>
                  <MinusCircle className='w-4 h-4 text-danger' /> Nueva Deducción
                </span>
              </CardHeader>
              <CardContent>
                <form onSubmit={deductionHook.handleCreate} className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Empleado</label>
                    <select
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      value={deductionHook.form.employeeId}
                      onChange={(e) => deductionHook.setField("employeeId", e.target.value)}
                    >
                      <option value=''>Seleccionar empleado</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Amount (COP)</label>
                    <input
                      type='number'
                      min='0'
                      step='1000'
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      placeholder='Ej: 30000'
                      value={deductionHook.form.amount}
                      onChange={(e) => deductionHook.setField("amount", e.target.value)}
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Date</label>
                    <input
                      type='date'
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      value={deductionHook.form.date}
                      onChange={(e) => deductionHook.setField("date", e.target.value)}
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Concept</label>
                    <input
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      placeholder='Ej: Préstamo'
                      value={deductionHook.form.concept}
                      onChange={(e) => deductionHook.setField("concept", e.target.value)}
                    />
                  </div>
                  <div className='col-span-2 flex justify-end'>
                    <Button type='submit' variant='primary' isDisabled={deductionHook.saving}>
                      {deductionHook.saving ? <Spinner size='sm' /> : "Registrar Deducción"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='py-2'>
                {deductionHook.loading ? (
                  <div className='flex justify-center py-8'>
                    <Spinner />
                  </div>
                ) : (
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b bg-default-50 text-default-500 text-xs uppercase'>
                        <th className='text-left px-4 py-2'>Employee</th>
                        <th className='text-left px-4 py-2'>Amount</th>
                        <th className='text-left px-4 py-2'>Date</th>
                        <th className='text-left px-4 py-2'>Concept</th>
                        <th className='px-4 py-2'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {deductionHook.deductions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className='text-center py-8 text-default-400'>
                            Sin deducciones registradas
                          </td>
                        </tr>
                      ) : (
                        deductionHook.deductions.map((d) => (
                          <tr key={d.id} className='border-b hover:bg-default-50'>
                            <td className='px-4 py-2 font-medium'>
                              {d.employee?.fullName ?? d.employeeId}
                            </td>
                            <td className='px-4 py-2 text-danger font-semibold'>{fmt(d.amount)}</td>
                            <td className='px-4 py-2'>
                              {new Date(d.date).toLocaleDateString("es-CO")}
                            </td>
                            <td className='px-4 py-2'>{d.concept}</td>
                            <td className='px-4 py-2'>
                              <Button
                                isIconOnly
                                size='sm'
                                variant='ghost'
                                onPress={() => deductionHook.setPendingDelete(d.id)}
                              >
                                <Trash2 className='w-4 h-4 text-danger' />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
            <ConfirmDialog
              open={deductionHook.pendingDelete !== null}
              title='Eliminar deducción'
              description='¿Eliminar este registro de deducción? La acción no se puede deshacer.'
              confirmLabel='Eliminar'
              variant='danger'
              onConfirm={deductionHook.confirmDelete}
              onCancel={() => deductionHook.setPendingDelete(null)}
            />
            <ResultDialog
              result={deductionHook.saveResult}
              onClose={deductionHook.clearSaveResult}
            />
          </>
        )}

        {/* ── Tab: Pagos Adicionales ── */}
        {activeTab === "pagos" && (
          <>
            <Card>
              <CardHeader>
                <span className='font-semibold flex items-center gap-2'>
                  <PlusCircle className='w-4 h-4 text-success' /> Nuevo Pago Adicional
                </span>
              </CardHeader>
              <CardContent>
                <form onSubmit={addPaymentHook.handleCreate} className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Empleado</label>
                    <select
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      value={addPaymentHook.form.employeeId}
                      onChange={(e) => addPaymentHook.setField("employeeId", e.target.value)}
                    >
                      <option value=''>Seleccionar empleado</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Amount (COP)</label>
                    <input
                      type='number'
                      min='0'
                      step='1000'
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      placeholder='Ej: 50000'
                      value={addPaymentHook.form.amount}
                      onChange={(e) => addPaymentHook.setField("amount", e.target.value)}
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Date</label>
                    <input
                      type='date'
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      value={addPaymentHook.form.date}
                      onChange={(e) => addPaymentHook.setField("date", e.target.value)}
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium text-default-700'>Concept</label>
                    <input
                      className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                      placeholder='Ej: Bono transporte'
                      value={addPaymentHook.form.concept}
                      onChange={(e) => addPaymentHook.setField("concept", e.target.value)}
                    />
                  </div>
                  <div className='col-span-2 flex justify-end'>
                    <Button type='submit' variant='primary' isDisabled={addPaymentHook.saving}>
                      {addPaymentHook.saving ? <Spinner size='sm' /> : "Registrar Pago"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='py-2'>
                {addPaymentHook.loading ? (
                  <div className='flex justify-center py-8'>
                    <Spinner />
                  </div>
                ) : (
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b bg-default-50 text-default-500 text-xs uppercase'>
                        <th className='text-left px-4 py-2'>Employee</th>
                        <th className='text-left px-4 py-2'>Amount</th>
                        <th className='text-left px-4 py-2'>Date</th>
                        <th className='text-left px-4 py-2'>Concept</th>
                        <th className='px-4 py-2'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {addPaymentHook.payments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className='text-center py-8 text-default-400'>
                            Sin pagos adicionales registrados
                          </td>
                        </tr>
                      ) : (
                        addPaymentHook.payments.map((p) => (
                          <tr key={p.id} className='border-b hover:bg-default-50'>
                            <td className='px-4 py-2 font-medium'>
                              {p.employee?.fullName ?? p.employeeId}
                            </td>
                            <td className='px-4 py-2 text-success font-semibold'>
                              {fmt(p.amount)}
                            </td>
                            <td className='px-4 py-2'>
                              {new Date(p.date).toLocaleDateString("es-CO")}
                            </td>
                            <td className='px-4 py-2'>{p.concept}</td>
                            <td className='px-4 py-2'>
                              <Button
                                isIconOnly
                                size='sm'
                                variant='ghost'
                                onPress={() => addPaymentHook.setPendingDelete(p.id)}
                              >
                                <Trash2 className='w-4 h-4 text-danger' />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
            <ConfirmDialog
              open={addPaymentHook.pendingDelete !== null}
              title='Eliminar pago adicional'
              description='¿Eliminar este registro de pago adicional? La acción no se puede deshacer.'
              confirmLabel='Eliminar'
              variant='danger'
              onConfirm={addPaymentHook.confirmDelete}
              onCancel={() => addPaymentHook.setPendingDelete(null)}
            />
            <ResultDialog
              result={addPaymentHook.saveResult}
              onClose={addPaymentHook.clearSaveResult}
            />
          </>
        )}
      </div>

      {/* Diálogos */}
      <ConfirmDialog
        open={pendingToggle !== null}
        title={pendingToggle?.active ? "Desactivar empleado" : "Activar empleado"}
        description={
          pendingToggle?.active
            ? `¿Deseas desactivar a ${pendingToggle?.fullName}? No podrá registrar marcaciones.`
            : `¿Deseas activar a ${pendingToggle?.fullName}?`
        }
        confirmLabel={pendingToggle?.active ? "Desactivar" : "Activar"}
        variant={pendingToggle?.active ? "danger" : "warning"}
        confirming={toggling}
        onConfirm={confirmToggle}
        onCancel={() => setPendingToggle(null)}
      />

      <ResultDialog result={empSaveResult} onClose={clearEmpResult} />
      <ResultDialog result={settingSaveResult} onClose={clearSettingResult} />
    </>
  );
}
