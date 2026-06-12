import { useEffect, useState } from "react";
import { addHours, addMonths, addWeeks, format, set, startOfHour } from "date-fns";
import { EVENT_COLORS } from "./types";
import type { CalendarEvent, CalendarView, EffectiveView, EventDraft } from "./types";
import { createMockEvents } from "./mockEvents";
import { useIsDesktop, useIsMobile } from "./hooks/useMediaQuery";
import { useSwipe } from "./hooks/useSwipe";
import { formatTimeRange } from "./utils/dates";
import { AgendaView } from "./components/AgendaView";
import { AnchoredPopover } from "./components/AnchoredPopover";
import { CalendarHeader } from "./components/CalendarHeader";
import { EventPopover } from "./components/EventPopover";
import { MonthView } from "./components/MonthView";
import { QuickCreateModal } from "./components/QuickCreateModal";
import { WeekView } from "./components/WeekView";

interface PopoverState {
  event: CalendarEvent;
  rect: DOMRect;
  pinned: boolean;
}

interface OverflowState {
  day: Date;
  events: CalendarEvent[];
  rect: DOMRect;
}

export function Calendar() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [events, setEvents] = useState<CalendarEvent[]>(() => createMockEvents());
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [overflow, setOverflow] = useState<OverflowState | null>(null);

  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const effectiveView: EffectiveView = view === "week" && isMobile ? "agenda" : view;

  const closeFloating = () => {
    setPopover(null);
    setOverflow(null);
  };

  const navigate = (direction: 1 | -1) => {
    closeFloating();
    setAnchor((d) => (view === "month" ? addMonths(d, direction) : addWeeks(d, direction)));
  };

  const swipeHandlers = useSwipe(
    () => navigate(1),
    () => navigate(-1),
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraft(null);
        closeFloating();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openDraft = (start: Date) => {
    closeFloating();
    setDraft({ start, end: addHours(start, 1) });
  };

  const handleDayClick = (day: Date) =>
    openDraft(set(day, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }));

  const handleCreate = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
    setDraft(null);
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    closeFloating();
  };

  const handleEventClick = (event: CalendarEvent, rect: DOMRect) => {
    setOverflow(null);
    setPopover({ event, rect, pinned: true });
  };

  // Hover previews are desktop-only and never replace a pinned popover.
  const handleHoverStart = (event: CalendarEvent, rect: DOMRect) => {
    if (!isDesktop) return;
    setPopover((current) => (current?.pinned ? current : { event, rect, pinned: false }));
  };

  const handleHoverEnd = () => {
    setPopover((current) => (current?.pinned ? current : null));
  };

  const viewProps = {
    anchor,
    events,
    onEventClick: handleEventClick,
    onEventHoverStart: handleHoverStart,
    onEventHoverEnd: handleHoverEnd,
  };

  return (
    <div className="flex h-dvh flex-col bg-white font-sans text-gray-900 antialiased">
      <CalendarHeader
        anchor={anchor}
        view={view}
        effectiveView={effectiveView}
        onToday={() => {
          closeFloating();
          setAnchor(new Date());
        }}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onViewChange={(v) => {
          closeFloating();
          setView(v);
        }}
      />

      <main className="min-h-0 flex-1" {...(isMobile ? swipeHandlers : {})}>
        {effectiveView === "month" && (
          <MonthView
            {...viewProps}
            onDayClick={handleDayClick}
            onShowMore={(day, dayEvents, rect) => {
              setPopover(null);
              setOverflow({ day, events: dayEvents, rect });
            }}
          />
        )}
        {effectiveView === "week" && <WeekView {...viewProps} onSlotClick={openDraft} />}
        {effectiveView === "agenda" && (
          <AgendaView
            anchor={anchor}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        )}
      </main>

      {/* Mobile floating action button */}
      {isMobile && (
        <button
          onClick={() => openDraft(startOfHour(addHours(new Date(), 1)))}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-lg ring-1 ring-gray-200 transition-transform active:scale-95"
          aria-label="Create event"
        >
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}

      {/* "+N more" day overflow list */}
      {overflow && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOverflow(null)} />
          <AnchoredPopover anchorRect={overflow.rect}>
            <div className="p-3">
              <p className="px-1 pb-2 text-center text-sm font-medium text-gray-700">
                {format(overflow.day, "EEE, MMM d")}
              </p>
              <ul className="space-y-1">
                {overflow.events.map((event) => (
                  <li key={event.id}>
                    <button
                      onClick={(e) =>
                        handleEventClick(event, e.currentTarget.getBoundingClientRect())
                      }
                      className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-gray-100"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: EVENT_COLORS[event.color].solid }}
                      />
                      <span className="truncate font-medium text-gray-800">{event.title}</span>
                      <span className="ml-auto shrink-0 text-gray-500">{formatTimeRange(event)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </AnchoredPopover>
        </>
      )}

      {/* Event details (hover preview or pinned on click) */}
      {popover && (
        <>
          {popover.pinned && <div className="fixed inset-0 z-40" onClick={closeFloating} />}
          <EventPopover
            event={popover.event}
            anchorRect={popover.rect}
            pinned={popover.pinned}
            onClose={closeFloating}
            onDelete={handleDelete}
          />
        </>
      )}

      {draft && <QuickCreateModal draft={draft} onCreate={handleCreate} onClose={() => setDraft(null)} />}
    </div>
  );
}
