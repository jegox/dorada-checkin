"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardCheck, Users, Clock, BarChart3, Settings } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empleados", label: "Empleados", icon: Users },
  { href: "/turnos", label: "Turnos", icon: Clock },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='w-64 min-h-screen bg-content1 border-r border-divider flex flex-col shadow-sm'>
      {/* Logo */}
      <div className='flex items-center gap-3 px-6 py-5 border-b border-divider'>
        <div className='w-8 h-8 rounded-lg bg-primary flex items-center justify-center'>
          <ClipboardCheck className='w-5 h-5 text-white' />
        </div>
        <div>
          <p className='text-sm font-bold text-foreground'>Dorada Check</p>
          <p className='text-xs text-default-400'>Control de Asistencia</p>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex-1 px-3 py-4 space-y-1'>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-default-600 hover:bg-default-100 hover:text-foreground",
              )}
            >
              <Icon className='w-4 h-4 shrink-0' />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='px-6 py-4 border-t border-divider'>
        <p className='text-xs text-default-400'>v1.0.0 · Dorada Check</p>
      </div>
    </aside>
  );
}
