import type { IAttendanceRepository } from "@/domain/repositories";

export class GetDashboardSummaryUseCase {
  constructor(private readonly attendanceRepo: IAttendanceRepository) {}

  async execute() {
    return this.attendanceRepo.findTodaySummary();
  }
}
