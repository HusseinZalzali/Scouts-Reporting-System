import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export type ReportFilters = {
  from?: string;
  to?: string;
  groupId?: string;
  location?: string;
  q?: string;
};

function buildWhere(filters: ReportFilters): Prisma.DailyReportWhereInput {
  const where: Prisma.DailyReportWhereInput = {};

  if (filters.from || filters.to) {
    where.reportDate = {};
    if (filters.from) where.reportDate.gte = toDateOnly(filters.from);
    if (filters.to) where.reportDate.lte = toDateOnly(filters.to);
  }
  if (filters.groupId) where.scoutGroupId = filters.groupId;
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.q) {
    where.OR = [
      { location: { contains: filters.q, mode: "insensitive" } },
      { scoutGroup: { name: { contains: filters.q, mode: "insensitive" } } },
      { programItems: { some: { text: { contains: filters.q, mode: "insensitive" } } } },
    ];
  }
  return where;
}

export async function getReports(filters: ReportFilters = {}) {
  return prisma.dailyReport.findMany({
    where: buildWhere(filters),
    include: {
      scoutGroup: true,
      programItems: { orderBy: { order: "asc" } },
      submittedBy: { select: { name: true } },
    },
    orderBy: { reportDate: "desc" },
  });
}

export async function getReportById(id: string) {
  return prisma.dailyReport.findUnique({
    where: { id },
    include: {
      scoutGroup: true,
      programItems: { orderBy: { order: "asc" } },
      submittedBy: { select: { name: true } },
    },
  });
}

export async function getGroupReports(scoutGroupId: string) {
  return prisma.dailyReport.findMany({
    where: { scoutGroupId },
    include: { programItems: { orderBy: { order: "asc" } } },
    orderBy: { reportDate: "desc" },
  });
}

export async function getReportForDate(scoutGroupId: string, date: Date) {
  return prisma.dailyReport.findUnique({
    where: {
      scoutGroupId_reportDate: { scoutGroupId, reportDate: toDateOnly(date) },
    },
    include: { programItems: { orderBy: { order: "asc" } } },
  });
}

export async function getScoutGroups() {
  return prisma.scoutGroup.findMany({ orderBy: { name: "asc" } });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      scoutGroupId: true,
      scoutGroup: { select: { id: true, name: true } },
    },
  });
}

/** Aggregate attendance totals across a set of filtered reports. */
export async function getAttendanceTotals(filters: ReportFilters = {}) {
  const agg = await prisma.dailyReport.aggregate({
    where: buildWhere(filters),
    _sum: {
      attendanceBaraem: true,
      attendanceAshbal: true,
      attendanceKashafa: true,
      attendanceJawala: true,
      attendanceQada: true,
    },
    _count: true,
  });

  const baraem = agg._sum.attendanceBaraem ?? 0;
  const ashbal = agg._sum.attendanceAshbal ?? 0;
  const kashafa = agg._sum.attendanceKashafa ?? 0;
  const jawala = agg._sum.attendanceJawala ?? 0;
  const qada = agg._sum.attendanceQada ?? 0;

  return {
    baraem,
    ashbal,
    kashafa,
    jawala,
    qada,
    total: baraem + ashbal + kashafa + jawala + qada,
    reportCount: agg._count,
  };
}

/** Time-series of total attendance per day. */
export async function getAttendanceOverTime(filters: ReportFilters = {}) {
  const reports = await prisma.dailyReport.findMany({
    where: buildWhere(filters),
    select: {
      reportDate: true,
      attendanceBaraem: true,
      attendanceAshbal: true,
      attendanceKashafa: true,
      attendanceJawala: true,
      attendanceQada: true,
    },
    orderBy: { reportDate: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const r of reports) {
    const key = r.reportDate.toISOString().slice(0, 10);
    const total =
      r.attendanceBaraem + r.attendanceAshbal + r.attendanceKashafa + r.attendanceJawala + r.attendanceQada;
    byDay.set(key, (byDay.get(key) ?? 0) + total);
  }
  return Array.from(byDay.entries()).map(([date, total]) => ({ date, total }));
}

/** Total attendance grouped by scout group. */
export async function getAttendanceByGroup(filters: ReportFilters = {}) {
  const grouped = await prisma.dailyReport.groupBy({
    by: ["scoutGroupId"],
    where: buildWhere(filters),
    _sum: {
      attendanceBaraem: true,
      attendanceAshbal: true,
      attendanceKashafa: true,
      attendanceJawala: true,
      attendanceQada: true,
    },
  });

  const groups = await getScoutGroups();
  const nameById = new Map(groups.map((g) => [g.id, g.name]));

  return grouped.map((g) => {
    const total =
      (g._sum.attendanceBaraem ?? 0) +
      (g._sum.attendanceAshbal ?? 0) +
      (g._sum.attendanceKashafa ?? 0) +
      (g._sum.attendanceJawala ?? 0) +
      (g._sum.attendanceQada ?? 0);
    return { group: nameById.get(g.scoutGroupId) ?? "—", total };
  });
}

export async function getDashboardStats() {
  const [groupCount, totals] = await Promise.all([
    prisma.scoutGroup.count(),
    getAttendanceTotals(),
  ]);
  // totals.reportCount is the count of all reports.
  return { groupCount, ...totals };
}

function sumReport(r: {
  attendanceBaraem: number;
  attendanceAshbal: number;
  attendanceKashafa: number;
  attendanceJawala: number;
  attendanceQada: number;
}) {
  return (
    r.attendanceBaraem +
    r.attendanceAshbal +
    r.attendanceKashafa +
    r.attendanceJawala +
    r.attendanceQada
  );
}

/**
 * One consolidated payload for the admin dashboard.
 * Minimizes round-trips: a few counts + a single fetch of this month's reports,
 * from which today's total, the month total, and the time-series are computed
 * in memory. Latest reports are fetched once.
 */
export async function getAdminDashboard(opts: {
  todayStr: string;
  monthFrom: string;
  monthTo: string;
}) {
  const monthStart = toDateOnly(opts.monthFrom);
  const monthEnd = toDateOnly(opts.monthTo);
  const today = toDateOnly(opts.todayStr);

  const [groupCount, reportCount, monthReports, latest] = await Promise.all([
    prisma.scoutGroup.count(),
    prisma.dailyReport.count(),
    prisma.dailyReport.findMany({
      where: { reportDate: { gte: monthStart, lte: monthEnd } },
      select: {
        reportDate: true,
        attendanceBaraem: true,
        attendanceAshbal: true,
        attendanceKashafa: true,
        attendanceJawala: true,
        attendanceQada: true,
      },
      orderBy: { reportDate: "asc" },
    }),
    prisma.dailyReport.findMany({
      take: 8,
      orderBy: { reportDate: "desc" },
      include: {
        scoutGroup: true,
        programItems: { orderBy: { order: "asc" } },
      },
    }),
  ]);

  const todayKey = today.toISOString().slice(0, 10);
  let todayTotal = 0;
  let monthTotal = 0;
  const byDay = new Map<string, number>();

  for (const r of monthReports) {
    const t = sumReport(r);
    monthTotal += t;
    const key = r.reportDate.toISOString().slice(0, 10);
    if (key === todayKey) todayTotal += t;
    byDay.set(key, (byDay.get(key) ?? 0) + t);
  }

  const series = Array.from(byDay.entries()).map(([date, total]) => ({ date, total }));

  return { groupCount, reportCount, todayTotal, monthTotal, series, latest };
}
