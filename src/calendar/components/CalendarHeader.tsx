import type { CalendarView, EffectiveView } from "../types";
import { compactHeaderTitle, headerTitle } from "../utils/dates";

interface CalendarHeaderProps {
  anchor: Date;
  view: CalendarView;
  effectiveView: EffectiveView;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarHeader({
  anchor,
  view,
  effectiveView,
  onToday,
  onPrev,
  onNext,
  onViewChange,
}: CalendarHeaderProps) {
  return (
    <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-5">
      <div className="hidden items-center gap-2 pr-2 lg:flex">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="3" fill="#1a73e8" />
          <rect x="3" y="4" width="18" height="5" rx="3" fill="#1967d2" />
          <text x="12" y="17.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="sans-serif">
            {new Date().getDate()}
          </text>
        </svg>
        <span className="text-lg text-gray-700">Calendar</span>
      </div>

      <button
        onClick={onToday}
        className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
      >
        Today
      </button>

      {/* Hidden on phones — swipe gestures page between dates there. */}
      <div className="hidden items-center sm:flex">
        <button
          onClick={onPrev}
          className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
          aria-label="Previous period"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={onNext}
          className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
          aria-label="Next period"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <h1 className="min-w-0 flex-1 truncate text-base font-normal text-gray-800 sm:text-xl">
        <span className="sm:hidden">{compactHeaderTitle(anchor)}</span>
        <span className="hidden sm:inline">{headerTitle(effectiveView, anchor)}</span>
      </h1>

      <div className="flex rounded-full border border-gray-300 p-0.5 text-sm" role="tablist" aria-label="Calendar view">
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => onViewChange(v)}
            className={`rounded-full px-3 py-1 font-medium capitalize transition-colors sm:px-4 ${
              view === v ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {/* On mobile the week tab renders the agenda list. */}
            {v === "week" && effectiveView === "agenda" ? "Agenda" : v}
          </button>
        ))}
      </div>
    </header>
  );
}
