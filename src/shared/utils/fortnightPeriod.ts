const MONTHS_ES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
] as const;

export interface FortnightPeriod {
  year: number;
  month: number; // 1-12
  fortnight: 1 | 2;
  start: Date;
  end: Date;
  label: string;
}

export function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function buildFortnightPeriod(
  year: number,
  month: number,
  fortnight: 1 | 2,
  untilDate?: Date,
): FortnightPeriod {
  const startDay = fortnight === 1 ? 1 : 16;
  const endDay = fortnight === 1 ? 15 : getLastDayOfMonth(year, month);

  const start = new Date(year, month - 1, startDay, 0, 0, 0, 0);
  const end = new Date(year, month - 1, endDay, 23, 59, 59, 999);

  if (untilDate && untilDate >= start && untilDate <= end) {
    end.setTime(untilDate.getTime());
  }

  const monthLabel = MONTHS_ES[month - 1];
  const label =
    fortnight === 1
      ? `PRIMERA QUINCENA ${monthLabel} ${year}`
      : `SEGUNDA QUINCENA ${monthLabel} ${year}`;

  return { year, month, fortnight, start, end, label };
}

export function getCurrentFortnightPeriod(now = new Date()): FortnightPeriod {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const fortnight: 1 | 2 = now.getDate() <= 15 ? 1 : 2;
  return buildFortnightPeriod(year, month, fortnight, now);
}

export function parseFortnightLabel(
  label: string,
): { year: number; month: number; fortnight: 1 | 2 } | null {
  const normalized = label.trim().toUpperCase();
  const first = /^PRIMERA QUINCENA\s+([A-ZÁÉÍÓÚÑ]+)\s+(\d{4})$/.exec(normalized);
  if (first) {
    const month = MONTHS_ES.indexOf(first[1] as (typeof MONTHS_ES)[number]) + 1;
    if (month > 0) return { year: Number(first[2]), month, fortnight: 1 };
    return null;
  }

  const second = /^SEGUNDA QUINCENA\s+([A-ZÁÉÍÓÚÑ]+)\s+(\d{4})$/.exec(normalized);
  if (second) {
    const month = MONTHS_ES.indexOf(second[1] as (typeof MONTHS_ES)[number]) + 1;
    if (month > 0) return { year: Number(second[2]), month, fortnight: 2 };
    return null;
  }

  return null;
}
