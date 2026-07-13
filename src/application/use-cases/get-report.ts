import type { IAttendanceRepository } from "@/domain/repositories";
import type { GetReportInputDTO, GetReportOutputDTO, ReportDayOutputDTO } from "@/application/dto";

export class GetReportUseCase {
  constructor(private readonly attendanceRepo: IAttendanceRepository) {}

  async execute(dto: GetReportInputDTO): Promise<GetReportOutputDTO> {
    const records = await this.attendanceRepo.findByDateRange(dto.from, dto.to);

    // Agrupar por día
    const byDay: Record<string, ReportDayOutputDTO> = {};
    for (const r of records) {
      const day = r.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, checkIns: 0, checkOuts: 0, late: 0 };
      if (r.type === "CHECK_IN") byDay[day].checkIns++;
      if (r.type === "CHECK_OUT") byDay[day].checkOuts++;
      if (r.status === "LATE") byDay[day].late++;
    }

    const days = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

    const totals = {
      checkIns: records.filter((r) => r.type === "CHECK_IN").length,
      checkOuts: records.filter((r) => r.type === "CHECK_OUT").length,
      late: records.filter((r) => r.status === "LATE").length,
      onTime: records.filter((r) => r.status === "ON_TIME").length,
    };

    const mappedRecords = records.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      employee: {
        id: r.employee?.id ?? "",
        document: r.employee?.document ?? "",
        fullName: r.employee?.fullName ?? "",
        position: r.employee?.position ?? "",
        shift: r.employee?.shift
          ? {
              name: r.employee.shift.name,
              startTime: r.employee.shift.startTime,
              endTime: r.employee.shift.endTime,
            }
          : null,
      },
    }));

    return { days, totals, records: mappedRecords };
  }
}
