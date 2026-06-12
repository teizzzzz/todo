import { format, isSameDay, isSameMonth, isToday, startOfDay } from "date-fns";
import type { MouseEvent } from "react";
import { EVENT_COLORS } from "../types";
import type { CalendarEvent } from "../types";
import {
  chunkIntoWeeks,
  eventsOnDay,
  formatTime,
  getMonthGridDays,
  isMultiDayOrAllDay,
} from "../utils/dates";

const MAX_VISIBLE_PER_DAY = 3;
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthViewProps {
  anchor: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (event: CalendarEvent, rect: DOMRect) => void;
  onEventHoverStart: (event: CalendarEvent, rect: DOMRect) => void;
  onEventHoverEnd: () => void;
  onShowMore: (day: Date, dayEvents: CalendarEvent[], rect: DOMRect) => void;
}

/** Multi-day/all-day bars first, then timed events chronologically. */
export function sortDayEvents(dayEvents: CalendarEvent[]): CalendarEvent[] {
  return [...dayEvents].sort((a, b) => {
    const spanDiff = Number(isMultiDayOrAllDay(b)) - Number(isMultiDayOrAllDay(a));
    return spanDiff !== 0 ? spanDiff : a.start.getTime() - b.start.getTime();
  });
}

export function MonthView({
  anchor,
  events,
  onDayClick,
  onEventClick,
  onEventHoverStart,
  onEventHoverEnd,
  onShowMore,
}: MonthViewProps) {
  const weeks = chunkIntoWeeks(getMonthGridDays(anchor));

  const chipHandlers = (event: CalendarEvent) => ({
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onEventClick(event, e.currentTarget.getBoundingClientRect());
    },
    onMouseEnter: (e: MouseEvent<HTMLButtonElement>) =>
      onEventHoverStart(event, e.currentTarget.getBoundingClientRect()),
    onMouseLeave: onEventHoverEnd,
  });

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2 text-center text-[11px] font-medium uppercase text-gray-500">
            <span className="sm:hidden">{label[0]}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid flex-1 auto-rows-fr grid-cols-7">
        {weeks.flat().map((day) => {
          const inMonth = isSameMonth(day, anchor);
          const today = isToday(day);
          const dayEvents = sortDayEvents(eventsOnDay(events, day));
          const visible = dayEvents.slice(0, MAX_VISIBLE_PER_DAY);
          const hiddenCount = dayEvents.length - visible.length;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className="flex min-h-16 cursor-pointer flex-col gap-px overflow-hidden border-b border-l border-gray-200 px-1 pb-1 first:border-l-0 nth-[7n+1]:border-l-0 hover:bg-gray-50 sm:min-h-24"
            >
              <div className="flex justify-center py-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    today
                      ? "bg-blue-600 text-white"
                      : inMonth
                        ? "text-gray-700"
                        : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              {visible.map((event) => {
                const color = EVENT_COLORS[event.color];
                if (isMultiDayOrAllDay(event)) {
                  const isStart = isSameDay(day, event.start);
                  const isEnd = isSameDay(day, startOfDay(event.end)) || event.end <= startOfDay(day);
                  const showTitle = isStart || day.getDay() === 1; // start day or Monday segment
                  return (
                    <button
                      key={event.id}
                      {...chipHandlers(event)}
                      className={`h-[18px] shrink-0 truncate px-1.5 text-left text-[11px] font-medium leading-[18px] transition-[filter] hover:brightness-95 ${
                        isStart ? "rounded-l" : "-ml-1"
                      } ${isEnd ? "rounded-r" : "-mr-1"}`}
                      style={{ backgroundColor: color.solid, color: color.onSolid }}
                    >
                      {showTitle ? event.title : " "}
                    </button>
                  );
                }
                return (
                  <button
                    key={event.id}
                    {...chipHandlers(event)}
                    className="flex h-[18px] shrink-0 items-center gap-1 truncate rounded px-1 text-left text-[11px] leading-[18px] text-gray-700 hover:bg-gray-100"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color.solid }} />
                    <span className="hidden shrink-0 text-gray-500 lg:inline">{formatTime(event.start)}</span>
                    <span className="truncate font-medium">{event.title}</span>
                  </button>
                );
              })}

              {hiddenCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowMore(day, dayEvents, e.currentTarget.getBoundingClientRect());
                  }}
                  className="shrink-0 rounded px-1 text-left text-[11px] font-medium text-gray-600 hover:bg-gray-100"
                >
                  +{hiddenCount} more
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
