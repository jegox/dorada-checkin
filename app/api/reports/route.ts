import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(
    new URL("/api/reports/attendance", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  );
}
