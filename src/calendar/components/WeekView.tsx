import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { format, isToday, set } from "date-fns";
import { EVENT_COLORS } from "../types";
import type { CalendarEvent } from "../types";
import { formatTime, getWeekDays } from "../utils/dates";
import { layoutAllDaySpans, layoutTimedEvents } from "../utils/layout";

export const HOUR_HEIGHT = 48;
const SNAP_MINUTES = 30;
const GUTTER = "w-14 sm:w-16";

interface WeekViewProps {
  anchor: Date;
  events: CalendarEvent[];
  onSlotClick: (start: Date) => void;
  onEventClick: (event: CalendarEvent, rect: DOMRect) => void;
  onEventHoverStart: (event: CalendarEvent, rect: DOMRect) => void;
  onEventHoverEnd: () => void;
}

/** Re-renders every minute so the "now" line tracks the clock. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function WeekView({
  anchor,
  events,
  onSlotClick,
  onEventClick,
  onEventHoverStart,
  onEventHoverEnd,
}: WeekViewProps) {
  const days = getWeekDays(anchor);
  const allDaySpans = layoutAllDaySpans(events, anchor);
  const allDayLanes = allDaySpans.reduce((m, s) => Math.max(m, s.lane + 1), 0);
  const now = useNow();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Open with the working day in view, like Google Calendar.
    scrollRef.current?.scrollTo({ top: 7 * HOUR_HEIGHT });
  }, []);

  const handleColumnClick = (day: Date) => (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minutes = ((e.clientY - rect.top) / HOUR_HEIGHT) * 60;
    const snapped = Math.min(Math.floor(minutes / SNAP_MINUTES) * SNAP_MINUTES, 23 * 60);
    onSlotClick(set(day, { hours: 0, minutes: snapped, seconds: 0, milliseconds: 0 }));
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Day-of-week header */}
      <div className="flex border-b border-gray-200 pr-2">
        <div className={`${GUTTER} shrink-0`} />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="flex-1 border-l border-gray-200 py-2 text-center">
              <div className={`text-[11px] font-medium uppercase ${today ? "text-blue-600" : "text-gray-500"}`}>
                {format(day, "EEE")}
              </div>
              <div
                className={`mx-auto mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-xl font-normal ${
                  today ? "bg-blue-600 text-white" : "text-gray-700"
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day / multi-day bar section */}
      {allDayLanes > 0 && (
        <div className="flex border-b border-gray-200 pr-2">
          <div className={`${GUTTER} shrink-0 py-1 pr-2 text-right text-[10px] leading-6 text-gray-500`}>
            all-day
          </div>
          <div
            className="grid flex-1 gap-y-0.5 py-1"
            style={{
              gridTemplateColumns: "repeat(7, 1fr)",
              gridTemplateRows: `repeat(${allDayLanes}, 1.5rem)`,
            }}
          >
            {allDaySpans.map(({ event, startCol, endCol, lane, continuesBefore, continuesAfter }) => {
              const color = EVENT_COLORS[event.color];
              return (
                <button
                  key={event.id}
                  onClick={(e) => onEventClick(event, e.currentTarget.getBoundingClientRect())}
                  onMouseEnter={(e) => onEventHoverStart(event, e.currentTarget.getBoundingClientRect())}
                  onMouseLeave={onEventHoverEnd}
                  className={`mx-0.5 truncate px-2 text-left text-xs font-medium leading-6 transition-[filter] hover:brightness-95 ${
                    continuesBefore ? "" : "rounded-l-md"
                  } ${continuesAfter ? "" : "rounded-r-md"}`}
                  style={{
                    gridColumn: `${startCol} / ${endCol + 1}`,
                    gridRow: lane + 1,
                    backgroundColor: color.solid,
                    color: color.onSolid,
                  }}
                >
                  {event.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable 24h grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: 24 * HOUR_HEIGHT }}>
          {/* Hour labels */}
          <div className={`${GUTTER} relative shrink-0`}>
            {Array.from({ length: 23 }, (_, i) => i + 1).map((hour) => (
              <span
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-gray-500"
                style={{ top: hour * HOUR_HEIGHT }}
              >
                {format(set(anchor, { hours: hour, minutes: 0 }), "h a")}
              </span>
            ))}
          </div>

          {/* Day columns */}
          <div className="relative flex flex-1">
            {/* Horizontal hour lines (behind events) */}
            {Array.from({ length: 23 }, (_, i) => i + 1).map((hour) => (
              <div
                key={hour}
                className="pointer-events-none absolute inset-x-0 border-t border-gray-200"
                style={{ top: hour * HOUR_HEIGHT }}
              />
            ))}

            {days.map((day) => {
              const layouts = layoutTimedEvents(events, day);
              const today = isToday(day);
              const nowTop = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT;
              return (
                <div
                  key={day.toISOString()}
                  className="relative flex-1 cursor-pointer border-l border-gray-200"
                  onClick={handleColumnClick(day)}
                >
                  {layouts.map(({ event, startMin, endMin, column, columns, continuesBefore, continuesAfter }) => {
                    const color = EVENT_COLORS[event.color];
                    const compact = endMin - startMin <= 30;
                    return (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event, e.currentTarget.getBoundingClientRect());
                        }}
                        onMouseEnter={(e) => onEventHoverStart(event, e.currentTarget.getBoundingClientRect())}
                        onMouseLeave={onEventHoverEnd}
                        className={`absolute z-10 overflow-hidden rounded-md px-2 py-1 text-left text-xs shadow-sm ring-1 ring-white/60 transition-[filter] hover:z-20 hover:brightness-95 ${
                          continuesBefore ? "rounded-t-none" : ""
                        } ${continuesAfter ? "rounded-b-none" : ""}`}
                        style={{
                          top: (startMin / 60) * HOUR_HEIGHT,
                          height: ((endMin - startMin) / 60) * HOUR_HEIGHT - 2,
                          left: `calc(${(column / columns) * 100}% + 1px)`,
                          width: `calc(${100 / columns}% - 4px)`,
                          backgroundColor: color.solid,
                          color: color.onSolid,
                        }}
                      >
                        <span className="font-medium">{event.title}</span>
                        <span className={compact ? "ml-1" : "block opacity-90"}>
                          {formatTime(event.start)}
                          {!compact && ` – ${formatTime(event.end)}`}
                        </span>
                      </button>
                    );
                  })}

                  {/* Current-time indicator */}
                  {today && (
                    <div className="pointer-events-none absolute inset-x-0 z-30" style={{ top: nowTop }}>
                      <div className="relative border-t-2 border-red-500">
                        <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-red-500" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
