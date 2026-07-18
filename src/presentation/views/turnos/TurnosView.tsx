"use client";
import { Card, CardContent, CardHeader, Button, Spinner } from "@heroui/react";
import { Clock, Plus, X, AlertCircle } from "lucide-react";
import { useTurnos } from "@/presentation/hooks/useTurnos";
import { ResultDialog } from "@/presentation/components/ui/ResultDialog";
import type { ShiftDTO } from "@/presentation/types";

function ShiftItem({ shift }: { shift: ShiftDTO }) {
  return (
    <div className='flex items-center justify-between p-4 rounded-lg border border-default-200 bg-default-50'>
      <div className='flex items-center gap-3'>
        <div className='p-2 bg-blue-50 rounded-lg'>
          <Clock className='w-5 h-5 text-blue-500' />
        </div>
        <div>
          <p className='font-semibold'>{shift.name}</p>
          <p className='text-sm text-default-500'>
            {shift.startTime} — {shift.endTime}
          </p>
        </div>
      </div>
      <span className='text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium'>
        {shift._count?.employees ?? 0} empleados
      </span>
    </div>
  );
}

export function TurnosView() {
  const {
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
    clearSaveResult,
  } = useTurnos();

  return (
    <>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold'>Turnos</h2>
            <p className='text-sm text-default-500'>Gestión de turnos laborales</p>
          </div>
          <Button variant='primary' onPress={() => setShowForm(!showForm)}>
            <Plus className='w-4 h-4 mr-1' /> Nuevo Turno
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className='flex items-center justify-between'>
              <span className='font-semibold'>Crear turno</span>
              <Button isIconOnly variant='ghost' size='sm' onPress={() => setShowForm(false)}>
                <X className='w-4 h-4' />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                {error && <p className='text-danger text-sm'>{error}</p>}
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium text-default-700'>Nombre del turno</label>
                  <input
                    className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                    placeholder='Ej: Turno Mañana'
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {(["startTime", "endTime"] as const).map((f) => (
                    <div key={f} className='flex flex-col gap-1'>
                      <label className='text-sm font-medium text-default-700'>
                        {f === "startTime" ? "Hora entrada" : "Hora salida"}
                      </label>
                      <input
                        type='time'
                        className='h-10 px-3 rounded-lg border border-default-300 bg-default-100 text-sm focus:outline-none focus:border-primary'
                        value={form[f]}
                        onChange={(e) => setField(f, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className='flex gap-2 justify-end'>
                  <Button variant='ghost' onPress={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type='submit' variant='primary' isDisabled={saving}>
                    {saving ? <Spinner size='sm' /> : "Guardar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {error && !showForm && (
          <div className='p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-center'>
            <AlertCircle className='w-4 h-4 shrink-0' />
            {error}
          </div>
        )}

        <Card>
          <CardContent className='py-4'>
            {loading ? (
              <div className='flex justify-center py-10'>
                <Spinner size='lg' />
              </div>
            ) : shifts.length === 0 ? (
              <div className='flex flex-col items-center py-16 gap-3 text-default-400'>
                <Clock className='w-12 h-12' />
                <p>No hay turnos registrados</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {shifts.map((shift) => (
                  <ShiftItem key={shift.id} shift={shift} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ResultDialog result={saveResult} onClose={clearSaveResult} />
    </>
  );
}
