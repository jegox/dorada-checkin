import { NextRequest, NextResponse } from "next/server";
import { PrismaAdditionalPaymentRepository } from "@/infrastructure/repositories/additional-payment.repository";

const repo = new PrismaAdditionalPaymentRepository();

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await repo.delete(id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
