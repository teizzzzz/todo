# Calendar Core Component

A responsive, Google Calendar–style calendar built with **React + Vite + TypeScript + Tailwind CSS v4 + date-fns**. Phase 1 of a cross-platform calendar app — the web core is framework-light and ships as a plain Vite SPA, so it can be wrapped by Tauri or Capacitor unchanged.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks (tsc -b) then bundles to dist/
```

## Features

- **Month / Week view switching** with a Google-style segmented control. Month cells cap at 3 events and collapse the rest into a `+N more` popover.
- **Week view time grid**: 24-hour axis, Mon–Sun columns, events absolutely positioned from their start/end times, a live red "now" indicator, and an all-day lane for all-day and multi-day events (rendered as spanning bars).
- **Overlap resolution** (`src/calendar/utils/layout.ts`): transitively overlapping events are grouped into clusters; within a cluster each event takes the lowest free column, and all cluster members share the column count — so simultaneous meetings split the lane width evenly instead of stacking.
- **Responsive behavior**: at `< 768px` the week view becomes an agenda list with swipe-left/right week paging and a floating create button; at `≥ 1024px` hovering an event shows a detail popover.
- **Quick create**: click any empty month cell or week-grid slot (snapped to 30 minutes) to open a New Event dialog with title, date, time range, all-day toggle, and the Google color palette.
- **Mock data** (`src/calendar/mockEvents.ts`) is anchored to the current week and includes regular, all-day, 3-day spanning, and deliberately double-booked events.

## Structure

```
src/calendar/
├── Calendar.tsx          # state + view orchestration (events, popovers, modal)
├── types.ts              # CalendarEvent, view types, color palette
├── mockEvents.ts         # demo schedule anchored to the current week
├── hooks/
│   ├── useMediaQuery.ts  # mobile / desktop breakpoints
│   └── useSwipe.ts       # horizontal swipe paging for touch screens
├── utils/
│   ├── dates.ts          # week/month grids, formatting (Mon-start weeks)
│   └── layout.ts         # overlap clustering + all-day lane packing
└── components/
    ├── CalendarHeader.tsx
    ├── MonthView.tsx
    ├── WeekView.tsx
    ├── AgendaView.tsx     # mobile substitute for the week view
    ├── EventPopover.tsx   # hover preview / pinned detail card
    ├── AnchoredPopover.tsx
    └── QuickCreateModal.tsx
```
