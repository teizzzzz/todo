import { format, isToday } from "date-fns";
import { EVENT_COLORS } from "../types";
import type { CalendarEvent } from "../types";
import { eventsOnDay, formatTimeRange, getWeekDays } from "../utils/dates";
import { sortDayEvents } from "./MonthView";

interface AgendaViewProps {
  anchor: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent, rect: DOMRect) => void;
  onDayClick: (day: Date) => void;
}

/**
 * Mobile replacement for the week view: a vertical agenda list for the
 * current week. Swipe left/right (wired in Calendar) pages between weeks.
 */
export function AgendaView({ anchor, events, onEventClick, onDayClick }: AgendaViewProps) {
  const days = getWeekDays(anchor);
  const populated = days
    .map((day) => ({ day, dayEvents: sortDayEvents(eventsOnDay(events, day)) }))
    .filter(({ dayEvents }) => dayEvents.length > 0);

  if (populated.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-white px-6 text-center">
        <span className="text-4xl">🗓️</span>
        <p className="text-sm text-gray-500">No events this week. Tap + to create one.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      {populated.map(({ day, dayEvents }) => (
        <section key={day.toISOString()} className="flex gap-3 border-b border-gray-100 px-4 py-3">
          <button
            onClick={() => onDayClick(day)}
            className="flex w-12 shrink-0 flex-col items-center pt-0.5"
            aria-label={`Add event on ${format(day, "MMMM d")}`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                isToday(day) ? "bg-blue-600 font-medium text-white" : "text-gray-800"
              }`}
            >
              {format(day, "d")}
            </span>
            <span className={`text-[10px] font-medium uppercase ${isToday(day) ? "text-blue-600" : "text-gray-500"}`}>
              {format(day, "EEE")}
            </span>
          </button>

          <ul className="min-w-0 flex-1 space-y-1.5">
            {dayEvents.map((event) => {
              const color = EVENT_COLORS[event.color];
              return (
                <li key={event.id}>
                  <button
                    onClick={(e) => onEventClick(event, e.currentTarget.getBoundingClientRect())}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors active:bg-gray-100"
                    style={{ backgroundColor: color.tint }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color.solid }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900">{event.title}</span>
                      <span className="block truncate text-xs text-gray-600">
                        {formatTimeRange(event)}
                        {event.location ? ` · ${event.location}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
