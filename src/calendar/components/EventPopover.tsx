import { format } from "date-fns";
import { EVENT_COLORS } from "../types";
import type { CalendarEvent } from "../types";
import { formatTimeRange } from "../utils/dates";
import { AnchoredPopover } from "./AnchoredPopover";

interface EventPopoverProps {
  event: CalendarEvent;
  anchorRect: DOMRect;
  /** Pinned popovers (opened by click) stay open and show actions. */
  pinned: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function EventPopover({ event, anchorRect, pinned, onClose, onDelete }: EventPopoverProps) {
  const color = EVENT_COLORS[event.color];

  return (
    <AnchoredPopover anchorRect={anchorRect} interactive={pinned}>
      <div className="p-4">
        {pinned && (
          <div className="-mt-1 -mr-1 mb-1 flex justify-end gap-1">
            <button
              onClick={() => onDelete(event.id)}
              className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600"
              aria-label="Delete event"
              title="Delete"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded"
            style={{ backgroundColor: color.solid }}
          />
          <div className="min-w-0">
            <h3 className="text-base font-medium text-gray-900">{event.title}</h3>
            <p className="mt-0.5 text-sm text-gray-600">
              {format(event.start, "EEEE, MMMM d")} · {formatTimeRange(event)}
            </p>
          </div>
        </div>
        {event.location && (
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
            <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.description && (
          <div className="mt-3 flex items-start gap-3 text-sm text-gray-600">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            <p className="leading-relaxed">{event.description}</p>
          </div>
        )}
      </div>
    </AnchoredPopover>
  );
}
