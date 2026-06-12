import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "../types";

/** Weeks start on Monday, matching the spec (Mon–Sun header). */
export const WEEK_OPTS = { weekStartsOn: 1 as const };

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, WEEK_OPTS);
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

/** All days shown in a month grid (full leading/trailing weeks). */
export function getMonthGridDays(anchor: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(anchor), WEEK_OPTS),
    end: endOfWeek(endOfMonth(anchor), WEEK_OPTS),
  });
}

export function chunkIntoWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

/** Events that touch the given day (multi-day events included). */
export function eventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = addDays(dayStart, 1);
  return events.filter((e) => e.start < dayEnd && e.end > dayStart);
}

export function isMultiDayOrAllDay(e: CalendarEvent): boolean {
  return Boolean(e.allDay) || differenceInCalendarDays(e.end, e.start) >= 1;
}

/** "9 AM" / "2:30 PM" — drop minutes when on the hour, like Google. */
export function formatTime(d: Date): string {
  return format(d, d.getMinutes() === 0 ? "h a" : "h:mm a");
}

export function formatTimeRange(e: CalendarEvent): string {
  if (e.allDay) return "All day";
  if (isSameDay(e.start, e.end)) {
    return `${formatTime(e.start)} – ${formatTime(e.end)}`;
  }
  return `${format(e.start, "MMM d, h:mm a")} – ${format(e.end, "MMM d, h:mm a")}`;
}

/** Short title for narrow screens, e.g. "Jun 2026". */
export function compactHeaderTitle(anchor: Date): string {
  return format(anchor, "MMM yyyy");
}

export function headerTitle(view: "month" | "week" | "agenda", anchor: Date): string {
  if (view === "month") return format(anchor, "MMMM yyyy");
  const days = getWeekDays(anchor);
  const first = days[0];
  const last = days[6];
  if (isSameMonth(first, last)) return format(first, "MMMM yyyy");
  return `${format(first, "MMM")} – ${format(last, "MMM yyyy")}`;
}
