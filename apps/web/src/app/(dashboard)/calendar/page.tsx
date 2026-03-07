"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/trpc/client";

// ─── Types ──────────────────────────────────────────────────
type EntryType = "BLOG_POST" | "SOCIAL_POST" | "EMAIL_CAMPAIGN" | "LANDING_PAGE" | "VIDEO" | "PODCAST" | "WEBINAR" | "OTHER";
type EntryStatus = "idea" | "planned" | "in_progress" | "in_review" | "approved" | "published" | "cancelled";
type ViewMode = "month" | "week";

// Derive CalendarEntry from the tRPC query return type
type RawEntry = NonNullable<
  ReturnType<typeof trpc.calendar.list.useQuery>["data"]
>["items"][number];

interface CalendarEntry {
  id: string;
  title: string;
  type: EntryType;
  status: EntryStatus;
  date: Date;
  assignee: string;
  raw: RawEntry;
}

// ─── Constants ──────────────────────────────────────────────
const TYPE_COLORS: Record<EntryType, { bg: string; text: string; border: string }> = {
  BLOG_POST: {
    bg: "bg-green-500/15 dark:bg-green-500/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-500/30",
  },
  SOCIAL_POST: {
    bg: "bg-blue-500/15 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  EMAIL_CAMPAIGN: {
    bg: "bg-purple-500/15 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/30",
  },
  LANDING_PAGE: {
    bg: "bg-orange-500/15 dark:bg-orange-500/20",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500/30",
  },
  VIDEO: {
    bg: "bg-red-500/15 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/30",
  },
  PODCAST: {
    bg: "bg-indigo-500/15 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-500/30",
  },
  WEBINAR: {
    bg: "bg-teal-500/15 dark:bg-teal-500/20",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-500/30",
  },
  OTHER: {
    bg: "bg-gray-500/15 dark:bg-gray-500/20",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-500/30",
  },
};

const TYPE_LABELS: Record<EntryType, string> = {
  BLOG_POST: "Blog",
  SOCIAL_POST: "Social",
  EMAIL_CAMPAIGN: "Email",
  LANDING_PAGE: "Page",
  VIDEO: "Video",
  PODCAST: "Podcast",
  WEBINAR: "Webinar",
  OTHER: "Other",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  idea: "bg-gray-400 dark:bg-gray-500",
  planned: "bg-blue-400 dark:bg-blue-500",
  in_progress: "bg-yellow-400 dark:bg-yellow-500",
  in_review: "bg-orange-400 dark:bg-orange-500",
  approved: "bg-cyan-400 dark:bg-cyan-500",
  published: "bg-green-500 dark:bg-accent",
  cancelled: "bg-red-400 dark:bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  idea: "Ideas",
  planned: "Planned",
  in_progress: "In Progress",
  in_review: "In Review",
  approved: "Approved",
  published: "Published",
  cancelled: "Cancelled",
};

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ────────────────────────────────────────────────
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // getDay() returns 0 for Sunday; convert to Monday-based (0=Mon, 6=Sun)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const grid: Date[] = [];

  // Previous month padding
  for (let i = startDow - 1; i >= 0; i--) {
    grid.push(new Date(year, month, -i));
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.push(new Date(year, month, d));
  }

  // Next month padding to complete the grid (always fill to 35 or 42 cells)
  const targetCells = grid.length <= 35 ? 35 : 42;
  let nextDay = 1;
  while (grid.length < targetCells) {
    grid.push(new Date(year, month + 1, nextDay++));
  }

  return grid;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Map a DB uppercase status to a lowercase UI status */
function mapStatus(dbStatus: string): EntryStatus {
  return dbStatus.toLowerCase().replace(/ /g, "_") as EntryStatus;
}

/** Get the status dot color, defaulting to gray for unknown statuses */
function getStatusDotColor(status: string): string {
  return STATUS_DOT_COLORS[status] ?? "bg-gray-400 dark:bg-gray-500";
}

// ─── Component ──────────────────────────────────────────────
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarGrid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  // Compute the date range covering the visible calendar grid
  const queryFrom = calendarGrid[0];
  const queryTo = calendarGrid[calendarGrid.length - 1];

  // ─── tRPC Queries ──────────────────────────────────────────
  const listQuery = trpc.calendar.list.useQuery({
    from: queryFrom,
    to: queryTo,
  });

  const statsQuery = trpc.calendar.stats.useQuery({});

  // ─── Map raw entries to CalendarEntry format ───────────────
  const entries: CalendarEntry[] = useMemo(() => {
    if (!listQuery.data) return [];
    return listQuery.data.items
      .filter((item) => item.scheduledDate != null)
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: item.entryType as EntryType,
        status: mapStatus(item.status),
        date: new Date(item.scheduledDate!),
        assignee: item.assignee?.name ?? "Unassigned",
        raw: item,
      }));
  }, [listQuery.data]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}-${entry.date.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  }, [entries]);

  // Upcoming entries (next 5 from today)
  const upcomingEntries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entries
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [entries]);

  // Stats from tRPC
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      idea: 0,
      planned: 0,
      in_progress: 0,
      in_review: 0,
      approved: 0,
      published: 0,
      cancelled: 0,
    };
    if (statsQuery.data) {
      for (const item of statsQuery.data.byStatus) {
        const key = mapStatus(item.status);
        counts[key] = item.count;
      }
    }
    return counts;
  }, [statsQuery.data]);

  // Type counts from tRPC stats
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    if (statsQuery.data) {
      for (const item of statsQuery.data.byType) {
        counts[item.entryType] = item.count;
        total += item.count;
      }
    }
    return { counts, total };
  }, [statsQuery.data]);

  // Navigation
  function goToPrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  // Week view: get the week containing the current date
  const weekDates = useMemo(() => {
    const d = new Date(year, month, currentDate.getDate());
    let dow = d.getDay() - 1;
    if (dow < 0) dow = 6;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - dow);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const wd = new Date(weekStart);
      wd.setDate(weekStart.getDate() + i);
      dates.push(wd);
    }
    return dates;
  }, [year, month, currentDate]);

  function goToPrevWeek() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
  }

  function goToNextWeek() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
  }

  const isLoading = listQuery.isLoading;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Content Calendar
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Plan and schedule your content strategy
          </p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Entry
        </button>
      </div>

      {/* ── Toolbar: View toggle + month nav ───────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* View mode toggle */}
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-900">
          {(["month", "week"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                viewMode === mode
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={viewMode === "month" ? goToPrevMonth : goToPrevWeek}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="min-w-[160px] text-center text-sm font-semibold text-gray-900 dark:text-white">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={viewMode === "month" ? goToNextMonth : goToNextWeek}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content: Calendar + Sidebar ────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-gray-200/50 dark:border-gray-800/50">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {isLoading ? (
            /* ── Loading Skeleton ──────────────────────────── */
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, idx) => (
                <div
                  key={idx}
                  className="min-h-[100px] animate-pulse border-b border-r border-gray-100 p-1.5 dark:border-gray-800/50"
                >
                  <div className="mb-2 px-1">
                    <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    {idx % 3 === 0 && (
                      <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                    )}
                    {idx % 5 === 0 && (
                      <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "month" ? (
            /* ── Month View Grid ─────────────────────────── */
            <div className="grid grid-cols-7">
              {calendarGrid.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === month;
                const today = isToday(date);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                const dayEntries = entriesByDate.get(dateKey) || [];

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 transition-colors last:border-r-0 dark:border-gray-800/50 ${
                      isCurrentMonth
                        ? "bg-white dark:bg-gray-950"
                        : "bg-gray-50/50 dark:bg-gray-950/50"
                    } ${idx % 7 === 0 ? "" : ""} ${
                      today ? "ring-1 ring-inset ring-green-500/30 dark:ring-accent/30" : ""
                    }`}
                  >
                    {/* Day number */}
                    <div className="mb-1 flex items-center justify-between px-1">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          today
                            ? "bg-green-600 text-white dark:bg-accent dark:text-black"
                            : isCurrentMonth
                              ? "text-gray-900 dark:text-gray-200"
                              : "text-gray-300 dark:text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Entry pills */}
                    <div className="flex flex-col gap-0.5">
                      {dayEntries.slice(0, 3).map((entry) => {
                        const typeColor = TYPE_COLORS[entry.type] ?? TYPE_COLORS.OTHER;
                        return (
                          <div
                            key={entry.id}
                            className={`group flex cursor-pointer items-center gap-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight transition-all hover:opacity-80 ${typeColor.bg} ${typeColor.text}`}
                            title={`${entry.title} (${entry.status})`}
                          >
                            <span
                              className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${getStatusDotColor(entry.status)}`}
                            />
                            <span className="truncate">{entry.title}</span>
                          </div>
                        );
                      })}
                      {dayEntries.length > 3 && (
                        <span className="px-1.5 text-[10px] text-gray-400 dark:text-gray-600">
                          +{dayEntries.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Week View Grid ──────────────────────────── */
            <div className="grid grid-cols-7">
              {weekDates.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === month;
                const today = isToday(date);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                const dayEntries = entriesByDate.get(dateKey) || [];

                return (
                  <div
                    key={idx}
                    className={`min-h-[280px] border-b border-r border-gray-100 p-2 transition-colors last:border-r-0 dark:border-gray-800/50 ${
                      isCurrentMonth
                        ? "bg-white dark:bg-gray-950"
                        : "bg-gray-50/50 dark:bg-gray-950/50"
                    } ${today ? "ring-1 ring-inset ring-green-500/30 dark:ring-accent/30" : ""}`}
                  >
                    {/* Day number */}
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                          today
                            ? "bg-green-600 text-white dark:bg-accent dark:text-black"
                            : isCurrentMonth
                              ? "text-gray-900 dark:text-gray-200"
                              : "text-gray-300 dark:text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-600">
                        {MONTH_NAMES[date.getMonth()].slice(0, 3)}
                      </span>
                    </div>

                    {/* Entry cards (expanded for week view) */}
                    <div className="flex flex-col gap-1.5">
                      {dayEntries.map((entry) => {
                        const typeColor = TYPE_COLORS[entry.type] ?? TYPE_COLORS.OTHER;
                        return (
                          <div
                            key={entry.id}
                            className={`cursor-pointer rounded-lg border p-2 transition-all hover:opacity-80 ${typeColor.bg} ${typeColor.border}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-block h-2 w-2 shrink-0 rounded-full ${getStatusDotColor(entry.status)}`}
                              />
                              <span className={`truncate text-xs font-medium ${typeColor.text}`}>
                                {entry.title}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span
                                className={`rounded px-1 py-0.5 text-[9px] font-semibold uppercase ${typeColor.bg} ${typeColor.text}`}
                              >
                                {TYPE_LABELS[entry.type] ?? entry.type}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {entry.assignee}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800/50">
            {(Object.keys(TYPE_COLORS) as EntryType[]).map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`inline-block h-2.5 w-2.5 rounded-sm ${TYPE_COLORS[type].bg} ${TYPE_COLORS[type].border} border`} />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{TYPE_LABELS[type]}</span>
              </div>
            ))}
            <div className="mx-2 h-3 w-px bg-gray-200 dark:bg-gray-800" />
            {(Object.keys(STATUS_DOT_COLORS)).map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                <span className="text-[11px] capitalize text-gray-500 dark:text-gray-400">
                  {status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Upcoming */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Upcoming</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {listQuery.isLoading ? (
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/50">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="flex animate-pulse items-start gap-3 px-5 py-3.5">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingEntries.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-600">
                  No upcoming entries
                </div>
              ) : (
                upcomingEntries.map((entry) => {
                  const typeColor = TYPE_COLORS[entry.type] ?? TYPE_COLORS.OTHER;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      {/* Assignee avatar */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {getInitials(entry.assignee)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-900 dark:text-white">{entry.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 dark:text-gray-600">
                            {entry.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${typeColor.bg} ${typeColor.text}`}
                          >
                            {TYPE_LABELS[entry.type] ?? entry.type}
                          </span>
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${getStatusDotColor(entry.status)}`}
                            title={entry.status}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Stats</h2>
            </div>
            {statsQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800/50">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex animate-pulse flex-col items-center gap-2 bg-white px-4 py-5 dark:bg-gray-950"
                  >
                    <div className="h-7 w-10 rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800/50">
                {Object.keys(statusCounts).map((status) => (
                  <div
                    key={status}
                    className="flex flex-col items-center gap-1 bg-white px-4 py-5 dark:bg-gray-950"
                  >
                    <span className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {statusCounts[status]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${getStatusDotColor(status)}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {STATUS_LABELS[status] ?? status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick type breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/50">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">By Type</h2>
            </div>
            <div className="p-4">
              {statsQuery.isLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="animate-pulse">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-3 w-4 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(Object.keys(TYPE_LABELS) as EntryType[]).map((type) => {
                    const count = typeCounts.counts[type] ?? 0;
                    const pct = typeCounts.total > 0 ? (count / typeCounts.total) * 100 : 0;
                    const typeColor = TYPE_COLORS[type];
                    return (
                      <div key={type}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className={`text-xs font-medium ${typeColor.text}`}>
                            {TYPE_LABELS[type]}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-600">{count}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className={`h-full rounded-full transition-all ${typeColor.bg.replace("/15", "/60").replace("/20", "/60")}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
