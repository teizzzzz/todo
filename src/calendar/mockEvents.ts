import { addDays, set, startOfWeek } from "date-fns";
import type { CalendarEvent } from "./types";
import { WEEK_OPTS } from "./utils/dates";

function at(day: Date, hours: number, minutes = 0): Date {
  return set(day, { hours, minutes, seconds: 0, milliseconds: 0 });
}

/**
 * Mock schedule anchored to the current week so the demo always has content.
 * Includes regular events, a 3-day spanning event, an all-day event, and a
 * deliberately overlapping 14:00 block to exercise the overlap algorithm.
 */
export function createMockEvents(now: Date = new Date()): CalendarEvent[] {
  const monday = startOfWeek(now, WEEK_OPTS);
  const day = (offset: number) => addDays(monday, offset);

  return [
    // --- Regular events spread across the week ---
    {
      id: "standup-mon",
      title: "Team Standup",
      start: at(day(0), 9, 30),
      end: at(day(0), 10, 0),
      color: "peacock",
      location: "Meet · daily-sync",
      description: "Quick round-robin: yesterday, today, blockers.",
    },
    {
      id: "design-review",
      title: "Design Review — Calendar v1",
      start: at(day(0), 15, 0),
      end: at(day(0), 16, 30),
      color: "grape",
      location: "Figma + Room 4B",
      description: "Walk through week-view spacing and event chip states.",
    },
    {
      id: "gym",
      title: "Gym",
      start: at(day(1), 7, 0),
      end: at(day(1), 8, 0),
      color: "basil",
    },
    {
      id: "one-on-one",
      title: "1:1 with Alex",
      start: at(day(2), 11, 0),
      end: at(day(2), 11, 45),
      color: "blueberry",
      location: "Cafe downstairs",
    },
    {
      id: "deep-work",
      title: "Deep Work: Overlap Algorithm",
      start: at(day(3), 9, 0),
      end: at(day(3), 12, 0),
      color: "graphite",
      description: "No meetings. Implement cluster-based column packing.",
    },
    {
      id: "dinner",
      title: "Dinner with Sam",
      start: at(day(4), 19, 0),
      end: at(day(4), 21, 0),
      color: "tangerine",
      location: "Izakaya Toro",
    },
    {
      id: "brunch",
      title: "Brunch",
      start: at(day(6), 11, 0),
      end: at(day(6), 12, 30),
      color: "banana",
    },

    // --- Overlapping block: three meetings colliding around 14:00 ---
    {
      id: "overlap-a",
      title: "Product Sync",
      start: at(day(2), 14, 0),
      end: at(day(2), 15, 0),
      color: "peacock",
      location: "Room 2A",
      description: "Roadmap checkpoint with PM team.",
    },
    {
      id: "overlap-b",
      title: "Vendor Call",
      start: at(day(2), 14, 0),
      end: at(day(2), 15, 0),
      color: "tomato",
      location: "Zoom",
      description: "Contract renewal — double-booked with Product Sync!",
    },
    {
      id: "overlap-c",
      title: "Code Review",
      start: at(day(2), 14, 30),
      end: at(day(2), 16, 0),
      color: "sage",
      description: "Partially overlaps the 14:00 meetings.",
    },

    // --- Busy morning to trigger "+N more" in the month view ---
    {
      id: "busy-1",
      title: "Sprint Planning",
      start: at(day(4), 9, 0),
      end: at(day(4), 10, 30),
      color: "blueberry",
    },
    {
      id: "busy-2",
      title: "Interview: Frontend",
      start: at(day(4), 10, 30),
      end: at(day(4), 11, 30),
      color: "grape",
    },
    {
      id: "busy-3",
      title: "Lunch & Learn",
      start: at(day(4), 12, 0),
      end: at(day(4), 13, 0),
      color: "banana",
    },
    {
      id: "busy-4",
      title: "Retro",
      start: at(day(4), 16, 0),
      end: at(day(4), 17, 0),
      color: "sage",
    },

    // --- Multi-day + all-day events ---
    {
      id: "offsite",
      title: "Team Offsite — Kyoto",
      start: at(day(3), 8, 0),
      end: at(day(5), 18, 0),
      color: "basil",
      location: "Kyoto",
      description: "Spans three days; rendered as a bar in week/month views.",
    },
    {
      id: "launch-day",
      title: "v1 Launch 🚀",
      start: at(day(1), 0, 0),
      end: at(day(1), 23, 59),
      allDay: true,
      color: "tomato",
    },
  ];
}
