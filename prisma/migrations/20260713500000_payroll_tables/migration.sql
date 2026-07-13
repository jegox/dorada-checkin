-- AlterTable Employee: add baseSalary and salaryPeriod
ALTER TABLE "Employee"
  ADD COLUMN IF NOT EXISTS "baseSalary"   DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "salaryPeriod" TEXT          NOT NULL DEFAULT 'MENSUAL';

-- CreateTable Deduction
CREATE TABLE IF NOT EXISTS "Deduction" (
  "id"         TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "amount"     DECIMAL(12,2) NOT NULL,
  "date"       TIMESTAMP(3) NOT NULL,
  "concept"    TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable AdditionalPayment
CREATE TABLE IF NOT EXISTS "AdditionalPayment" (
  "id"         TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "amount"     DECIMAL(12,2) NOT NULL,
  "date"       TIMESTAMP(3) NOT NULL,
  "concept"    TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdditionalPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable PayrollLiquidation
CREATE TABLE IF NOT EXISTS "PayrollLiquidation" (
  "id"         TEXT NOT NULL,
  "period"     TEXT NOT NULL,
  "startDate"  TIMESTAMP(3) NOT NULL,
  "endDate"    TIMESTAMP(3) NOT NULL,
  "employeeId" TEXT NOT NULL,
  "deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "amount"     DECIMAL(12,2) NOT NULL DEFAULT 0,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollLiquidation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey Deduction
ALTER TABLE "Deduction"
  ADD CONSTRAINT "Deduction_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey AdditionalPayment
ALTER TABLE "AdditionalPayment"
  ADD CONSTRAINT "AdditionalPayment_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey PayrollLiquidation
ALTER TABLE "PayrollLiquidation"
  ADD CONSTRAINT "PayrollLiquidation_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
