"use client";
import { Card, CardContent, CardHeader, Button, Spinner } from "@heroui/react";
import { AlertCircle, CalendarRange, CircleDollarSign, Clock3, Users } from "lucide-react";
import { useReportes } from "@/presentation/hooks/useReportes";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO");
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className='py-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-default-100'>
            <Icon className='w-4 h-4 text-default-700' />
          </div>
          <div>
            <p className='text-xs text-default-500'>{label}</p>
            <p className='text-lg font-semibold'>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportesView() {
  const {
    activeTab,
    loading,
    error,
    attendance,
    payroll,
    selectedEmployeeId,
    selectedShiftId,
    selectedPeriod,
    setActiveTab,
    setSelectedEmployeeId,
    setSelectedShiftId,
    setSelectedPeriod,
  } = useReportes();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Reporteria</h2>
          <p className='text-sm text-default-500'>Reportes quincenales operativos y de nomina</p>
        </div>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant={activeTab === "empleados" ? "primary" : "outline"}
            onPress={() => setActiveTab("empleados")}
          >
            Reporte de empleados
          </Button>
          <Button
            size='sm'
            variant={activeTab === "nomina" ? "primary" : "outline"}
            onPress={() => setActiveTab("nomina")}
          >
            Reporte de nomina liquidada
          </Button>
        </div>
      </div>

      {error && (
        <div className='p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-center'>
          <AlertCircle className='w-4 h-4 shrink-0' />
          {error}
        </div>
      )}

      {loading && !attendance && !payroll ? (
        <div className='flex justify-center py-20'>
          <Spinner size='lg' />
        </div>
      ) : (
        <>
          {activeTab === "empleados" && attendance && (
            <>
              <Card>
                <CardHeader className='font-semibold'>
                  Periodo en curso: {attendance.period.label}
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <label className='text-sm'>
                      <span className='text-default-500 block mb-1'>Filtrar por turno</span>
                      <select
                        className='w-full h-10 rounded-md border border-default-200 bg-background px-3 text-sm'
                        value={selectedShiftId}
                        onChange={(e) => setSelectedShiftId(e.target.value)}
                      >
                        <option value=''>Todos</option>
                        {attendance.filters.shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className='text-sm'>
                      <span className='text-default-500 block mb-1'>Filtrar por empleado</span>
                      <select
                        className='w-full h-10 rounded-md border border-default-200 bg-background px-3 text-sm'
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      >
                        <option value=''>Todos</option>
                        {attendance.filters.employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
                <StatCard
                  label='Monto total turnos terminados'
                  value={formatMoney(attendance.summary.totalCompletedShiftsAmount)}
                  icon={CircleDollarSign}
                />
                <StatCard
                  label='Llegadas tarde acumuladas'
                  value={`${attendance.summary.totalLateArrivals}`}
                  icon={Clock3}
                />
                <StatCard
                  label='Puntualidad acumulada'
                  value={`${attendance.summary.punctualityPercent}%`}
                  icon={CalendarRange}
                />
                <StatCard
                  label='Salidas pendientes'
                  value={`${attendance.summary.pendingCheckOuts}`}
                  icon={Users}
                />
              </div>

              <Card>
                <CardHeader className='font-semibold'>Detalle de empleados del periodo</CardHeader>
                <CardContent>
                  <div className='overflow-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-default-200'>
                          <th className='text-left py-2 px-3'>Empleado</th>
                          <th className='text-left py-2 px-3'>Fecha</th>
                          <th className='text-left py-2 px-3'>Hora entrada</th>
                          <th className='text-left py-2 px-3'>Hora salida</th>
                          <th className='text-left py-2 px-3'>Turno</th>
                          <th className='text-left py-2 px-3'>Novedad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.rows.map((row) => (
                          <tr key={row.id} className='border-b border-default-100'>
                            <td className='py-2 px-3'>
                              <p className='font-medium'>{row.employeeName}</p>
                              <p className='text-xs text-default-400'>{row.employeeDocument}</p>
                            </td>
                            <td className='py-2 px-3'>{formatDate(row.date)}</td>
                            <td className='py-2 px-3'>{row.checkInTime}</td>
                            <td className='py-2 px-3'>{row.checkOutTime ?? "Pendiente"}</td>
                            <td className='py-2 px-3'>{row.shiftName}</td>
                            <td className='py-2 px-3'>{row.novelty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "nomina" && payroll && (
            <>
              <Card>
                <CardHeader className='font-semibold'>Filtrar periodo liquidado</CardHeader>
                <CardContent>
                  <label className='text-sm block'>
                    <span className='text-default-500 block mb-1'>Periodo</span>
                    <select
                      className='w-full h-10 rounded-md border border-default-200 bg-background px-3 text-sm'
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                      <option value=''>Selecciona un periodo</option>
                      {payroll.availablePeriods.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </label>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <StatCard
                  label='Monto total del periodo'
                  value={formatMoney(payroll.summary.totalAmount)}
                  icon={CircleDollarSign}
                />
                <StatCard
                  label='Total deducciones'
                  value={formatMoney(payroll.summary.totalDeductions)}
                  icon={Clock3}
                />
                <StatCard
                  label='Neto del periodo'
                  value={formatMoney(payroll.summary.netAmount)}
                  icon={CalendarRange}
                />
              </div>

              <Card>
                <CardHeader className='font-semibold'>Detalle de nomina liquidada</CardHeader>
                <CardContent>
                  <div className='overflow-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-default-200'>
                          <th className='text-left py-2 px-3'>Empleado</th>
                          <th className='text-left py-2 px-3'>Monto total del periodo</th>
                          <th className='text-left py-2 px-3'>Deducciones total del periodo</th>
                          <th className='text-left py-2 px-3'>Llegadas tarde y puntualidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payroll.rows.map((row) => (
                          <tr key={row.employeeId} className='border-b border-default-100'>
                            <td className='py-2 px-3'>
                              <p className='font-medium'>{row.employeeName}</p>
                              <p className='text-xs text-default-400'>{row.employeeDocument}</p>
                            </td>
                            <td className='py-2 px-3'>{formatMoney(row.totalAmount)}</td>
                            <td className='py-2 px-3'>{formatMoney(row.totalDeductions)}</td>
                            <td className='py-2 px-3'>
                              {row.lateArrivals} tardanzas - {row.punctualityPercent}% puntualidad
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
