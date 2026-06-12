import {
  differenceInCalendarDays,
  differenceInMinutes,
  endOfDay,
  max,
  min,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "../types";
import { isMultiDayOrAllDay, WEEK_OPTS } from "./dates";

export const MINUTES_IN_DAY = 24 * 60;

/** Shortest visual duration so 15-minute events stay clickable. */
const MIN_VISUAL_MINUTES = 30;

export interface TimedEventLayout {
  event: CalendarEvent;
  /** Minutes from midnight, clipped to the day. */
  startMin: number;
  endMin: number;
  /** Column slot within the overlap cluster (0-based). */
  column: number;
  /** Total columns in the cluster — width is 1/columns of the day lane. */
  columns: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * Overlap-resolution algorithm for the week view.
 *
 * Events are sorted by start (longer first on ties), then grouped into
 * "clusters" of transitively overlapping events. Within a cluster each event
 * takes the lowest-numbered column that is free at its start time; every
 * event in the cluster shares the cluster's total column count, so
 * simultaneous events split the lane width evenly instead of stacking.
 */
export function layoutTimedEvents(events: CalendarEvent[], day: Date): TimedEventLayout[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const items: TimedEventLayout[] = events
    .filter((e) => !isMultiDayOrAllDay(e) && e.start < dayEnd && e.end > dayStart)
    .map((e) => {
      const startMin = differenceInMinutes(max([e.start, dayStart]), dayStart);
      const rawEnd = differenceInMinutes(min([e.end, dayEnd]), dayStart);
      const endMin = Math.min(Math.max(rawEnd, startMin + MIN_VISUAL_MINUTES), MINUTES_IN_DAY);
      return {
        event: e,
        startMin,
        endMin,
        column: 0,
        columns: 1,
        continuesBefore: e.start < dayStart,
        continuesAfter: e.end > dayEnd,
      };
    })
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  let cluster: TimedEventLayout[] = [];
  // colEnds[c] = end time of the latest event placed in column c (current cluster)
  let colEnds: number[] = [];
  let clusterEnd = -1;

  const closeCluster = () => {
    for (const item of cluster) item.columns = colEnds.length;
    cluster = [];
    colEnds = [];
  };

  for (const item of items) {
    if (item.startMin >= clusterEnd) closeCluster();

    let col = colEnds.findIndex((end) => end <= item.startMin);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(0);
    }
    item.column = col;
    colEnds[col] = item.endMin;
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endMin);
  }
  closeCluster();

  return items;
}

export interface AllDaySpanLayout {
  event: CalendarEvent;
  /** Grid columns within the week, 1-based inclusive. */
  startCol: number;
  endCol: number;
  /** Vertical lane (row) so overlapping spans stack instead of colliding. */
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * Lays out all-day and multi-day events as horizontal bars across a week,
 * packing them into the fewest lanes with the same greedy column strategy.
 */
export function layoutAllDaySpans(events: CalendarEvent[], weekAnchor: Date): AllDaySpanLayout[] {
  const weekStart = startOfDay(startOfWeek(weekAnchor, WEEK_OPTS));

  const spans = events
    .filter((e) => {
      if (!isMultiDayOrAllDay(e)) return false;
      const startOffset = differenceInCalendarDays(startOfDay(e.start), weekStart);
      const endOffset = differenceInCalendarDays(startOfDay(e.end), weekStart);
      return startOffset <= 6 && endOffset >= 0;
    })
    .map((e) => {
      const startOffset = differenceInCalendarDays(startOfDay(e.start), weekStart);
      const endOffset = differenceInCalendarDays(startOfDay(e.end), weekStart);
      return {
        event: e,
        startCol: Math.max(startOffset, 0) + 1,
        endCol: Math.min(endOffset, 6) + 1,
        lane: 0,
        continuesBefore: startOffset < 0,
        continuesAfter: endOffset > 6,
      };
    })
    .sort((a, b) => a.startCol - b.startCol || b.endCol - a.endCol);

  const laneEnds: number[] = [];
  for (const span of spans) {
    let lane = laneEnds.findIndex((end) => end < span.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    span.lane = lane;
    laneEnds[lane] = span.endCol;
  }

  return spans;
}
