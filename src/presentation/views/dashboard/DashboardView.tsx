"use client";
import { Card, CardContent, CardHeader, Spinner } from "@heroui/react";
import { LogIn, LogOut, AlertCircle, Users } from "lucide-react";
import { useDashboard } from "@/presentation/hooks/useDashboard";
import type { DashboardSummaryDTO } from "@/presentation/types";

const STAT_CARDS: Array<{
  key: keyof DashboardSummaryDTO;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = [
  {
    key: "checkIns",
    label: "Entradas",
    icon: LogIn,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    key: "checkOuts",
    label: "Salidas",
    icon: LogOut,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    key: "late",
    label: "Llegadas Tarde",
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    key: "activeEmployees",
    label: "Empleados Activos",
    icon: Users,
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-50",
  },
];

function formatDateTime(value: string | null): string {
  if (!value) return "Pendiente";

  return new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClassName(status: "ACTIVO" | "INACTIVO" | "PENDIENTE") {
  if (status === "ACTIVO") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "INACTIVO") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function DashboardView() {
  const {
    data,
    loading,
    error,
    updatedAt,
    startDate,
    endDate,
    employeeId,
    shiftId,
    minDate,
    maxDate,
    setStartDate,
    setEndDate,
    setEmployeeId,
    setShiftId,
  } = useDashboard();

  if (loading && !data) {
    return (
      <div className='flex h-full items-center justify-center min-h-[60vh]'>
        <Spinner />
        <span className='ml-2 text-default-500'>Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold'>Dashboard</h2>
        <p className='text-sm text-default-500'>
          {new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {error ? (
        <div className='p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-center'>
          <AlertCircle className='w-4 h-4 shrink-0' />
          {error}
        </div>
      ) : null}

      <Card className='shadow-sm border rounded-xl'>
        <CardHeader className='font-semibold'>Filtros</CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
            <label className='text-sm'>
              <span className='text-default-500 block mb-1'>Fecha inicial</span>
              <input
                className='w-full h-10 rounded-md border border-default-200 bg-background px-3 text-sm'
                type='date'
                value={startDate}
                min={minDate || undefined}
                max={maxDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>

            <label className='text-sm'>
              <span className='text-default-500 block mb-1'>Fecha final</span>
              <input
                className='w-full h-10 rounded-md border border-default-200 bg-background px-3 text-sm'
                type='date'
                value={endDate}
                min={minDate || undefined}
                max={maxDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>

            <label className='text-sm'>
              <span className='text-default-500 block mb-1'>Empleado</span>
              <select
                className='w-full h-10 rounded-md border border-default-200 bg-background px-3 text-sm'
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
              >
                <option value=''>Todos</option>
                {data?.filters.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label className='text-sm'>
              <span className='text-default-500 block mb-1'>Turno</span>
              <select
                className='w-full h-10 rounded-md border border-default-200 bg-background px-3 text-sm'
                value={shiftId}
                onChange={(event) => setShiftId(event.target.value)}
              >
                <option value=''>Todos</option>
                {data?.filters.shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className='mt-3 text-xs text-default-500'>
            El rango de fechas permite consultar maximo 3 meses de antiguedad.
          </p>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className='shadow-sm border rounded-xl'>
            <CardContent className='flex flex-row items-center gap-4 p-5'>
              <div className={`rounded-xl p-3 ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className='text-3xl font-bold'>{data?.summary?.[key] ?? 0}</p>
                <p className='text-sm text-default-500'>{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className='shadow-sm border rounded-xl'>
        <CardHeader className='font-semibold'>Detalle de marcaciones</CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-default-200 bg-default-50'>
                  <th className='text-left py-3 px-4'>Empleado</th>
                  <th className='text-left py-3 px-4'>Fecha de check-in</th>
                  <th className='text-left py-3 px-4'>Fecha de check-out</th>
                  <th className='text-left py-3 px-4'>Estado del turno</th>
                </tr>
              </thead>
              <tbody>
                {data?.rows.length ? (
                  data.rows.map((row) => (
                    <tr key={row.id} className='border-b border-default-100'>
                      <td className='py-3 px-4 font-medium'>{row.employeeName}</td>
                      <td className='py-3 px-4'>{formatDateTime(row.checkInAt)}</td>
                      <td className='py-3 px-4'>{formatDateTime(row.checkOutAt)}</td>
                      <td className='py-3 px-4'>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusClassName(row.shiftStatus)}`}
                        >
                          {row.shiftStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className='py-8 px-4 text-center text-default-500' colSpan={4}>
                      No hay registros para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className='shadow-sm border rounded-xl'>
        <CardContent className='p-5'>
          <p className='text-sm text-default-500'>Última actualización: {updatedAt}</p>
        </CardContent>
      </Card>
    </div>
  );
}
