"use client";
import { Card, CardContent, CardHeader, Button, Spinner } from "@heroui/react";
import { BarChart3, TrendingUp, LogIn, LogOut, Clock, AlertCircle } from "lucide-react";
import { useReportes, REPORT_RANGES } from "@/presentation/hooks/useReportes";
import type { ReportTotalsDTO, AttendanceDTO } from "@/presentation/types";

function fmtDate(iso: string) { const [, m, d] = iso.split("-"); return `${d}/${m}`; }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }); }

const STATUS_LABEL: Record<AttendanceDTO["status"], string> = { ON_TIME: "A tiempo", LATE: "Tarde", EARLY: "Temprano" };

const KPI: Array<{ key: keyof ReportTotalsDTO | "puntualidad"; label: string; icon: React.ElementType; cls: string; bg: string }> = [
  { key: "checkIns", label: "Entradas", icon: LogIn, cls: "text-green-600", bg: "bg-green-50" },
  { key: "checkOuts", label: "Salidas", icon: LogOut, cls: "text-blue-500", bg: "bg-blue-50" },
  { key: "late", label: "Tardanzas", icon: Clock, cls: "text-amber-500", bg: "bg-amber-50" },
  { key: "puntualidad", label: "Puntualidad", icon: TrendingUp, cls: "text-purple-500", bg: "bg-purple-50" },
];

export function ReportesView() {
  const { days, totals, records, loading, error, rangeIdx, puntualidad, maxCheckIns, setRangeIdx } = useReportes();
  const vals: Record<string, string | number> = { ...totals, puntualidad: `${puntualidad}%` };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Reportes</h2>
          <p className="text-sm text-default-500">Análisis de asistencia</p>
        </div>
        <div className="flex gap-2">
          {REPORT_RANGES.map((r, i) => (
            <Button key={r.label} size="sm" variant={rangeIdx === i ? "primary" : "outline"} onPress={() => setRangeIdx(i)}>
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {KPI.map(({ key, label, icon: Icon, cls, bg }) => (
              <Card key={key}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`p-3 rounded-xl ${bg}`}><Icon className={`w-5 h-5 ${cls}`} /></div>
                  <div><p className="text-2xl font-bold">{vals[key]}</p><p className="text-xs text-default-500">{label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {days.length > 0 && (
            <Card>
              <CardHeader><span className="font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Entradas por día</span></CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {days.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-default-400">{d.checkIns}</span>
                      <div className="w-full bg-blue-400 rounded-t-sm" style={{ height: `${Math.round((d.checkIns / maxCheckIns) * 96)}px`, minHeight: d.checkIns > 0 ? "4px" : "0" }} />
                      <span className="text-xs text-default-400 truncate w-full text-center">{fmtDate(d.date)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><span className="font-semibold">Detalle de marcaciones</span></CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3 text-default-400">
                  <BarChart3 className="w-10 h-10" /><p>Sin registros en el período</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-default-200">
                        {["Empleado", "Turno", "Tipo", "Estado", "Hora"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 text-default-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.id} className="border-b border-default-100 hover:bg-default-50">
                          <td className="py-2 px-3"><p className="font-medium">{r.employee.fullName}</p><p className="text-xs text-default-400">{r.employee.document}</p></td>
                          <td className="py-2 px-3 text-default-500">{r.employee.shift?.name ?? "—"}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.type === "CHECK_IN" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                              {r.type === "CHECK_IN" ? "Entrada" : "Salida"}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === "LATE" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              {STATUS_LABEL[r.status]}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-default-500">{fmtTime(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
