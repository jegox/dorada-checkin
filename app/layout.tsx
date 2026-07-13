import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/presentation/providers/Providers";
import { Sidebar } from "@/presentation/layouts/Sidebar";
import { Header } from "@/presentation/layouts/Header";

export const metadata: Metadata = {
  title: "Dorada Check",
  description: "Control de Asistencia de Empleados",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning className="bg-background text-foreground">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header title="Dorada Check" />
              <main className="flex-1 overflow-auto p-6 bg-default-50">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
