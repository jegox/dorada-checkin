import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runPayrollCron } from "@/application/use-cases/run-payroll-cron";

const Schema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(0).max(11), // 0-indexed JS month
  fortnight: z.union([z.literal(1), z.literal(2)]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, fortnight } = Schema.parse(body);
    const result = await runPayrollCron(year, month, fortnight);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
