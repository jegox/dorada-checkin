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
  DollarSign,
  Tag,
  Trash2,
  PlusCircle,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useEmpleados } from "@/presentation/hooks/useEmpleados";
import { usePayrollRules } from "@/presentation/hooks/usePayrollRules";
import { ConfirmDialog } from "@/presentation/components/ui/ConfirmDialog";
import { ResultDialog } from "@/presentation/components/ui/ResultDialog";
import type { EmployeeDTO, PayrollRuleType } from "@/presentation/types";

// ─── Colores por tipo de regla ────────────────────────────────────────────────
const RULE_COLORS: Record<PayrollRuleType, { bg: string; text: string; label: string }> = {
  DESCUENTO: { bg: "bg-red-100", text: "text-red-700", label: "Descuento" },
  CREDITO: { bg: "bg-blue-100", text: "text-blue-700", label: "Crédito" },
  BONO: { bg: "bg-green-100", text: "text-green-700", label: "Bono" },
  TURNO_EXTRA: { bg: "bg-purple-100", text: "text-purple-700", label: "Turno extra" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

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
  onSelect,
  selected,
}: {
  emp: EmployeeDTO;
  onEdit: (emp: EmployeeDTO) => void;
  onToggleActive: (emp: EmployeeDTO) => void;
  onSelect: (emp: EmployeeDTO) => void;
  selected: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
        selected
          ? "border-primary bg-primary/5"
          : "border-default-200 bg-default-50 hover:border-default-300"
      }`}
      onClick={() => onSelect(emp)}
    >
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
          <p className='text-xs text-default-400'>{fmt(emp.baseSalary ?? 0)} / mes</p>
        </div>
      </div>
      <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
        <span className='text-xs px-2 py-1 rounded-full bg-default-100 text-default-600 font-medium'>
          {emp.shift?.name ?? "—"}
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
        <ChevronRight
          className={`w-4 h-4 transition-transform ${selected ? "text-primary rotate-90" : "text-default-300"}`}
        />
      </div>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export function EmpleadosView() {
  const [activeTab, setActiveTab] = useState<"empleados" | "reglas">("empleados");

  const {
    employees,
    shifts,
    loading,
    saving,
    showForm,
    editingEmployee,
    selectedEmployee,
    error,
    saveResult: empSaveResult,
    form,
    activeCount,
    setShowForm,
    startEdit,
    cancelEdit,
    selectEmployee,
    setField,
    handleSubmit,
    handleToggleActive,
    clearSaveResult: clearEmpResult,
  } = useEmpleados();

  const {
    allRules,
    employeeRules,
    loadingRules,
    savingRule,
    showRuleForm,
    editingRule,
    ruleForm,
    saveResult: ruleSaveResult,
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
    clearSaveResult: clearRuleResult,
  } = usePayrollRules(selectedEmployee?.id);

  // ConfirmDialog para toggle
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

  // ConfirmDialog para eliminar regla global
  const [pendingDeleteRule, setPendingDeleteRule] = useState<string | null>(null);

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
          {activeTab === "reglas" && (
            <Button variant='primary' onPress={() => setShowRuleForm(!showRuleForm)}>
              <Plus className='w-4 h-4 mr-1' /> Nueva Regla
            </Button>
          )}
        </div>

        {shifts.length === 0 && !loading && (
          <div className='p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm'>
            Primero crea al menos un turno en la sección <strong>Turnos</strong>.
          </div>
        )}

        {/* Tabs */}
        <div className='flex gap-1 border-b border-default-200'>
          <Tab
            label='Lista de Empleados'
            active={activeTab === "empleados"}
            onClick={() => setActiveTab("empleados")}
          />
          <Tab
            label='Reglas de Nómina'
            active={activeTab === "reglas"}
            onClick={() => setActiveTab("reglas")}
          />
        </div>

        {/* ── Tab: Empleados ── */}
        {activeTab === "empleados" && (
          <>
            {/* Formulario */}
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
                    <div className='grid grid-cols-4 gap-4'>
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
                        <label className='text-sm font-medium text-default-700 flex items-center gap-1'>
                          <DollarSign className='w-3 h-3' /> Salario básico
                        </label>
                        <input
                          type='number'
                          min='0'
                          step='1000'
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          placeholder='Ej: 1500000'
                          value={form.baseSalary}
                          onChange={(e) => setField("baseSalary", e.target.value)}
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>
                          Período de pago
                        </label>
                        <select
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          value={form.salaryPeriod}
                          onChange={(e) => setField("salaryPeriod", e.target.value)}
                        >
                          <option value='MENSUAL'>Mensual</option>
                          <option value='DIA'>Por día</option>
                        </select>
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

            {/* Lista */}
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
                        selected={selectedEmployee?.id === emp.id}
                        onEdit={startEdit}
                        onToggleActive={requestToggle}
                        onSelect={selectEmployee}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel de reglas del empleado seleccionado */}
            {selectedEmployee && (
              <Card>
                <CardHeader className='flex items-center justify-between'>
                  <span className='font-semibold flex items-center gap-2'>
                    <Tag className='w-4 h-4' /> Reglas de {selectedEmployee.fullName}
                  </span>
                  <Button isIconOnly variant='ghost' size='sm' onPress={() => selectEmployee(null)}>
                    <X className='w-4 h-4' />
                  </Button>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {employeeRules.length === 0 ? (
                    <p className='text-sm text-default-400 py-2'>Sin reglas asignadas.</p>
                  ) : (
                    employeeRules.map(({ id, ruleId, rule }) => {
                      const c = RULE_COLORS[rule.type as PayrollRuleType];
                      return (
                        <div
                          key={id}
                          className='flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-200'
                        >
                          <div className='flex items-center gap-2'>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}
                            >
                              {c.label}
                            </span>
                            <span className='text-sm font-medium'>{rule.name}</span>
                            <span className='text-sm text-default-500'>{fmt(rule.amount)}</span>
                          </div>
                          <Button
                            isIconOnly
                            size='sm'
                            variant='ghost'
                            onPress={() => handleRemoveRule(ruleId)}
                          >
                            <Trash2 className='w-3.5 h-3.5 text-danger' />
                          </Button>
                        </div>
                      );
                    })
                  )}
                  <div className='pt-2 border-t border-default-100'>
                    <p className='text-xs text-default-400 mb-2'>Agregar regla existente:</p>
                    <div className='flex flex-wrap gap-2'>
                      {allRules
                        .filter((r) => !employeeRules.some((er) => er.ruleId === r.id))
                        .map((r) => {
                          const c = RULE_COLORS[r.type as PayrollRuleType];
                          return (
                            <button
                              key={r.id}
                              onClick={() => handleAssignRule(r.id)}
                              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium ${c.bg} ${c.text} hover:opacity-80 transition-opacity`}
                            >
                              <PlusCircle className='w-3 h-3' />
                              {r.name} ({fmt(r.amount)})
                            </button>
                          );
                        })}
                      {allRules.filter((r) => !employeeRules.some((er) => er.ruleId === r.id))
                        .length === 0 && (
                        <p className='text-xs text-default-400'>
                          Todas las reglas ya están asignadas.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ── Tab: Reglas de Nómina ── */}
        {activeTab === "reglas" && (
          <>
            {showRuleForm && (
              <Card>
                <CardHeader className='flex items-center justify-between'>
                  <span className='font-semibold'>
                    {editingRule ? `Editando: ${editingRule.name}` : "Nueva regla de nómina"}
                  </span>
                  <Button isIconOnly variant='ghost' size='sm' onPress={cancelEditRule}>
                    <X className='w-4 h-4' />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveRule} className='flex flex-col gap-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Nombre</label>
                        <input
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          placeholder='Ej: Préstamo empresa'
                          value={ruleForm.name}
                          onChange={(e) => setRuleField("name", e.target.value)}
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Tipo</label>
                        <select
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          value={ruleForm.type}
                          onChange={(e) => setRuleField("type", e.target.value as PayrollRuleType)}
                          disabled={!!editingRule}
                        >
                          <option value='DESCUENTO'>Descuento</option>
                          <option value='CREDITO'>Crédito</option>
                          <option value='BONO'>Bono</option>
                          <option value='TURNO_EXTRA'>Turno Extra</option>
                        </select>
                      </div>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Monto (COP)</label>
                        <input
                          type='number'
                          min='0'
                          step='1000'
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          placeholder='Ej: 50000'
                          value={ruleForm.amount}
                          onChange={(e) => setRuleField("amount", e.target.value)}
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>Período</label>
                        <select
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          value={ruleForm.period}
                          onChange={(e) =>
                            setRuleField("period", e.target.value as "DIA" | "MENSUAL")
                          }
                        >
                          <option value='MENSUAL'>Mensual</option>
                          <option value='DIA'>Por día</option>
                        </select>
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-default-700'>
                          Descripción (opcional)
                        </label>
                        <input
                          className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                          placeholder='Ej: Descuento por tardanzas'
                          value={ruleForm.description}
                          onChange={(e) => setRuleField("description", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Días activos — solo para BONO */}
                    {ruleForm.type === "BONO" && (
                      <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-default-700'>
                          Días activos del bono
                          <span className='ml-1 text-xs text-default-400'>(vacío = siempre)</span>
                        </label>
                        <div className='flex gap-2 flex-wrap'>
                          {(["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const).map(
                            (label, day) => {
                              const active = ruleForm.activeDays.includes(day);
                              return (
                                <button
                                  key={day}
                                  type='button'
                                  onClick={() => toggleActiveDay(day)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                    active
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-default-100 text-default-600 border-default-300 hover:border-default-400"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                    <div className='flex gap-2 justify-end'>
                      <Button variant='ghost' onPress={cancelEditRule}>
                        Cancelar
                      </Button>
                      <Button type='submit' variant='primary' isDisabled={savingRule}>
                        {savingRule ? (
                          <Spinner size='sm' />
                        ) : editingRule ? (
                          "Guardar cambios"
                        ) : (
                          "Crear regla"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className='py-4'>
                {loadingRules ? (
                  <div className='flex justify-center py-10'>
                    <Spinner size='lg' />
                  </div>
                ) : allRules.length === 0 ? (
                  <div className='flex flex-col items-center py-16 gap-3 text-default-400'>
                    <Tag className='w-12 h-12' />
                    <p>No hay reglas creadas</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {allRules.map((rule) => {
                      const c = RULE_COLORS[rule.type as PayrollRuleType];
                      const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                      return (
                        <div
                          key={rule.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            rule.active
                              ? "border-default-200 bg-default-50"
                              : "border-default-100 bg-default-50/50 opacity-60"
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${c.bg} ${c.text}`}
                            >
                              {c.label}
                            </span>
                            <div>
                              <p
                                className={`font-semibold ${!rule.active ? "line-through text-default-400" : ""}`}
                              >
                                {rule.name}
                              </p>
                              {rule.description && (
                                <p className='text-xs text-default-400'>{rule.description}</p>
                              )}
                              <p className='text-xs text-default-400'>
                                {rule.period === "DIA" ? "Por día" : "Mensual"}
                              </p>
                              {rule.type === "BONO" &&
                                rule.activeDays &&
                                rule.activeDays.length > 0 && (
                                  <p className='text-xs text-purple-600 mt-0.5'>
                                    Activo: {rule.activeDays.map((d) => DAYS[d]).join(", ")}
                                  </p>
                                )}
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-sm'>{fmt(rule.amount)}</span>
                            <Button
                              isIconOnly
                              size='sm'
                              variant='ghost'
                              onPress={() => startEditRule(rule)}
                            >
                              <Pencil className='w-4 h-4 text-default-500' />
                            </Button>
                            <Button
                              isIconOnly
                              size='sm'
                              variant='ghost'
                              onPress={() => handleToggleRule(rule.id, !rule.active)}
                            >
                              {rule.active ? (
                                <ToggleRight className='w-5 h-5 text-success' />
                              ) : (
                                <ToggleLeft className='w-5 h-5 text-default-400' />
                              )}
                            </Button>
                            <Button
                              isIconOnly
                              size='sm'
                              variant='ghost'
                              onPress={() => setPendingDeleteRule(rule.id)}
                            >
                              <Trash2 className='w-4 h-4 text-danger' />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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

      <ConfirmDialog
        open={pendingDeleteRule !== null}
        title='Eliminar regla'
        description='¿Deseas eliminar esta regla? Se removerá de todos los empleados que la tengan asignada.'
        confirmLabel='Eliminar'
        variant='danger'
        onConfirm={async () => {
          if (pendingDeleteRule) {
            await handleDeleteRule(pendingDeleteRule);
            setPendingDeleteRule(null);
          }
        }}
        onCancel={() => setPendingDeleteRule(null)}
      />

      <ResultDialog result={empSaveResult} onClose={clearEmpResult} />
      <ResultDialog result={ruleSaveResult} onClose={clearRuleResult} />
    </>
  );
}
