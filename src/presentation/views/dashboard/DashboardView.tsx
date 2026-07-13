"use client";
import { Card, CardContent, Spinner } from "@heroui/react";
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
  { key: "checkIns", label: "Entradas Hoy", icon: LogIn, color: "text-emerald-500", bg: "bg-emerald-50" },
  { key: "checkOuts", label: "Salidas Hoy", icon: LogOut, color: "text-blue-500", bg: "bg-blue-50" },
  { key: "late", label: "Llegadas Tarde", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
  { key: "activeEmployees", label: "Empleados Activos", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
];

export function DashboardView() {
  const { summary, loading, error, updatedAt } = useDashboard();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Spinner />
        <span className="ml-2 text-default-500">Cargando resumen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-sm text-default-500">
          {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className="shadow-sm border rounded-xl">
            <CardContent className="flex flex-row items-center gap-4 p-5">
              <div className={`rounded-xl p-3 ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold">{summary?.[key] ?? 0}</p>
                <p className="text-sm text-default-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border rounded-xl">
        <CardContent className="p-5">
          <p className="text-sm text-default-500">Última actualización: {updatedAt}</p>
        </CardContent>
      </Card>
    </div>
  );
}
