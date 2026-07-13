"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <header className='h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10'>
      <h1 className='text-base font-semibold'>{title}</h1>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className='h-8 w-8 p-0'
        >
          {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
        </Button>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <Bell className='w-4 h-4' />
        </Button>
      </div>
    </header>
  );
}
