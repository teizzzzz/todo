export type EventColorKey =
  | "tomato"
  | "tangerine"
  | "banana"
  | "sage"
  | "basil"
  | "peacock"
  | "blueberry"
  | "lavender"
  | "grape"
  | "graphite";

export interface EventColor {
  /** Solid fill used for event blocks / chips. */
  solid: string;
  /** Text color rendered on top of the solid fill. */
  onSolid: string;
  /** Lighter tint used for hover surfaces. */
  tint: string;
}

/** Google Calendar's stock palette. */
export const EVENT_COLORS: Record<EventColorKey, EventColor> = {
  tomato: { solid: "#d50000", onSolid: "#ffffff", tint: "#fce8e6" },
  tangerine: { solid: "#f4511e", onSolid: "#ffffff", tint: "#feefe3" },
  banana: { solid: "#f6bf26", onSolid: "#3c2f00", tint: "#fef7e0" },
  sage: { solid: "#33b679", onSolid: "#ffffff", tint: "#e6f4ea" },
  basil: { solid: "#0b8043", onSolid: "#ffffff", tint: "#e2f0e7" },
  peacock: { solid: "#039be5", onSolid: "#ffffff", tint: "#e1f1fb" },
  blueberry: { solid: "#3f51b5", onSolid: "#ffffff", tint: "#e8eaf6" },
  lavender: { solid: "#7986cb", onSolid: "#ffffff", tint: "#eceef8" },
  grape: { solid: "#8e24aa", onSolid: "#ffffff", tint: "#f3e8f6" },
  graphite: { solid: "#616161", onSolid: "#ffffff", tint: "#efefef" },
};

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: EventColorKey;
  allDay?: boolean;
  location?: string;
  description?: string;
}

export type CalendarView = "month" | "week";

/** What actually gets rendered (mobile substitutes agenda for week). */
export type EffectiveView = "month" | "week" | "agenda";

/** Pre-filled values when the quick-create dialog opens. */
export interface EventDraft {
  start: Date;
  end: Date;
  allDay?: boolean;
}
