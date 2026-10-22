export interface CalendarDay {
  date: Date;
  inMonth: boolean;
}

export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const buildMonthGrid = (year: number, month: number): CalendarDay[] => {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
};

export type CalendarEvents = Record<string, string[]>;

const KEY = "cheesecake-calendar-events";

export const loadEvents = (): CalendarEvents => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const clean: CalendarEvents = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v)) {
        const items = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
        if (items.length) clean[k] = items;
      }
    }
    return clean;
  } catch {
    return {};
  }
};

export const saveEvents = (events: CalendarEvents): boolean => {
  try {
    localStorage.setItem(KEY, JSON.stringify(events));
    return true;
  } catch {
    return false;
  }
};

export const addEvent = (events: CalendarEvents, dateKey: string, text: string): CalendarEvents => {
  const trimmed = text.trim().slice(0, 120);
  if (!trimmed) return events;
  return { ...events, [dateKey]: [...(events[dateKey] ?? []), trimmed] };
};

export const removeEvent = (events: CalendarEvents, dateKey: string, index: number): CalendarEvents => {
  const list = events[dateKey];
  if (!list) return events;
  const next = list.filter((_, i) => i !== index);
  const copy = { ...events };
  if (next.length) copy[dateKey] = next;
  else delete copy[dateKey];
  return copy;
};
