"use client";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, Button } from "@heroui/react";
import { Sun, Moon, Monitor, Info, Database } from "lucide-react";

const THEMES: Array<{ value: string; label: string; icon: React.ElementType }> = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

const DB_INFO = [{ label: "Motor", value: "SQLite (local)" }, { label: "Archivo", value: "prisma/dev.db" }, { label: "ORM", value: "Prisma 7" }];
const APP_INFO = [{ label: "Aplicación", value: "Dorada Check" }, { label: "Versión", value: "0.1.0" }, { label: "Plataforma", value: "Electron + Next.js" }];

function InfoTable({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="space-y-3 text-sm">
      {rows.map(({ label, value }, i) => (
        <div key={label} className={`flex justify-between py-2 ${i < rows.length - 1 ? "border-b border-default-100" : ""}`}>
          <span className="text-default-500">{label}</span>
          <span className="font-medium text-xs">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function ConfiguracionView() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Configuración</h2>
        <p className="text-sm text-default-500">Ajustes del sistema</p>
      </div>

      <Card>
        <CardHeader><span className="font-semibold">Apariencia</span></CardHeader>
        <CardContent>
          <p className="text-sm text-default-500 mb-4">Selecciona el tema de la interfaz</p>
          <div className="flex gap-3">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <Button key={value} variant={theme === value ? "primary" : "outline"} onPress={() => setTheme(value)}>
                <Icon className="w-4 h-4 mr-1" />{label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2"><Database className="w-4 h-4" /><span className="font-semibold">Base de datos</span></CardHeader>
        <CardContent><InfoTable rows={DB_INFO} /></CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2"><Info className="w-4 h-4" /><span className="font-semibold">Acerca de</span></CardHeader>
        <CardContent><InfoTable rows={APP_INFO} /></CardContent>
      </Card>
    </div>
  );
}
