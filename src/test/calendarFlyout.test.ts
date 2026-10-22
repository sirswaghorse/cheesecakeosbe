import { describe, expect, it, beforeEach } from "vitest";
import {
  addEvent,
  buildMonthGrid,
  loadEvents,
  removeEvent,
  saveEvents,
  toDateKey,
} from "@/lib/calendar";

describe("buildMonthGrid", () => {
  it("always returns 42 cells covering full weeks", () => {
    for (let month = 0; month < 12; month++) {
      expect(buildMonthGrid(2026, month)).toHaveLength(42);
    }
  });

  it("starts on Sunday and marks out-of-month days", () => {
    // October 2026 starts on a Thursday.
    const grid = buildMonthGrid(2026, 9);
    expect(grid[0].date.getDay()).toBe(0);
    expect(grid[0].inMonth).toBe(false);
    expect(grid[4].date.getDate()).toBe(1);
    expect(grid[4].inMonth).toBe(true);
    expect(grid.filter((d) => d.inMonth)).toHaveLength(31);
  });

  it("pads the end with next-month days", () => {
    const grid = buildMonthGrid(2026, 9);
    expect(grid[41].inMonth).toBe(false);
    expect(grid[41].date.getMonth()).toBe(10);
  });
});

describe("toDateKey", () => {
  it("zero-pads month and day", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateKey(new Date(2026, 11, 25))).toBe("2026-12-25");
  });
});

describe("calendar events", () => {
  beforeEach(() => localStorage.clear());

  it("adds events under the right day and ignores blank text", () => {
    let events = addEvent({}, "2026-10-22", "  Release party  ");
    expect(events["2026-10-22"]).toEqual(["Release party"]);
    events = addEvent(events, "2026-10-22", "   ");
    expect(events["2026-10-22"]).toEqual(["Release party"]);
  });

  it("removes an event and drops the day when empty", () => {
    let events = addEvent({}, "2026-10-22", "One");
    events = addEvent(events, "2026-10-22", "Two");
    events = removeEvent(events, "2026-10-22", 0);
    expect(events["2026-10-22"]).toEqual(["Two"]);
    events = removeEvent(events, "2026-10-22", 0);
    expect(events["2026-10-22"]).toBeUndefined();
  });

  it("round-trips through localStorage and survives corrupt data", () => {
    const events = addEvent({}, "2026-10-22", "Persisted");
    expect(saveEvents(events)).toBe(true);
    expect(loadEvents()).toEqual(events);

    localStorage.setItem("cheesecake-calendar-events", "not json{");
    expect(loadEvents()).toEqual({});

    localStorage.setItem("cheesecake-calendar-events", JSON.stringify({ "2026-10-22": "oops", bad: [1, null] }));
    expect(loadEvents()).toEqual({});
  });
});
