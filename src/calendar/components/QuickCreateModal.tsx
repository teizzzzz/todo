import { useState } from "react";
import type { FormEvent } from "react";
import { addHours, format } from "date-fns";
import { EVENT_COLORS } from "../types";
import type { CalendarEvent, EventColorKey, EventDraft } from "../types";

interface QuickCreateModalProps {
  draft: EventDraft;
  onCreate: (event: CalendarEvent) => void;
  onClose: () => void;
}

export function QuickCreateModal({ draft, onCreate, onClose }: QuickCreateModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(draft.start, "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(format(draft.start, "HH:mm"));
  const [endTime, setEndTime] = useState(format(draft.end, "HH:mm"));
  const [allDay, setAllDay] = useState(Boolean(draft.allDay));
  const [color, setColor] = useState<EventColorKey>("peacock");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const start = allDay ? new Date(`${date}T00:00`) : new Date(`${date}T${startTime}`);
    let end = allDay ? new Date(`${date}T23:59`) : new Date(`${date}T${endTime}`);
    if (end <= start) end = addHours(start, 1);
    onCreate({
      id: crypto.randomUUID(),
      title: title.trim() || "(No title)",
      start,
      end,
      allDay,
      color,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create event"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:w-[26rem] sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">New event</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add title"
          className="w-full border-b-2 border-gray-200 pb-2 text-xl text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-600"
        />

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-600"
            />
            <label className="ml-auto flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              All day
            </label>
          </div>

          {!allDay && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="rounded-lg border border-gray-300 px-3 py-1.5 outline-none focus:border-blue-600"
              />
              <span className="text-gray-400">–</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="rounded-lg border border-gray-300 px-3 py-1.5 outline-none focus:border-blue-600"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Event color">
            {(Object.keys(EVENT_COLORS) as EventColorKey[]).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={color === key}
                aria-label={key}
                onClick={() => setColor(key)}
                className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
                  color === key ? "ring-2 ring-gray-700 ring-offset-2" : ""
                }`}
                style={{ backgroundColor: EVENT_COLORS[key].solid }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
