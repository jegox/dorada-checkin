-- CreateEnum
CREATE TYPE "PayrollRuleType" AS ENUM ('DESCUENTO', 'CREDITO', 'BONO', 'TURNO_EXTRA');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "baseSalary" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PayrollRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PayrollRuleType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePayrollRule" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeePayrollRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePayrollRule_employeeId_ruleId_key" ON "EmployeePayrollRule"("employeeId", "ruleId");

-- AddForeignKey
ALTER TABLE "EmployeePayrollRule" ADD CONSTRAINT "EmployeePayrollRule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePayrollRule" ADD CONSTRAINT "EmployeePayrollRule_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "PayrollRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

