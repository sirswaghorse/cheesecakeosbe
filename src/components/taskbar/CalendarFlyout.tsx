import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addEvent,
  buildMonthGrid,
  loadEvents,
  removeEvent,
  saveEvents,
  toDateKey,
  type CalendarEvents,
} from "@/lib/calendar";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const CalendarFlyout = ({ children }: { children: ReactNode }) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(toDateKey(now));
  const [events, setEvents] = useState<CalendarEvents>(loadEvents);
  const [draft, setDraft] = useState("");

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const todayKey = toDateKey(new Date());
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString([], { month: "long", year: "numeric" });
  const selectedEvents = events[selected] ?? [];

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelected(toDateKey(t));
  };

  const commit = (next: CalendarEvents) => {
    setEvents(next);
    saveEvents(next);
  };

  const handleAdd = () => {
    if (!draft.trim()) return;
    commit(addEvent(events, selected, draft));
    setDraft("");
  };

  const selectedLabel = new Date(`${selected}T12:00:00`).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        className="win-glass w-80 max-w-[calc(100vw-16px)] rounded-lg border border-border/40 p-3 text-foreground z-[10000] animate-in slide-in-from-bottom-2 fade-in duration-200"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">{monthLabel}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/30" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/30" onClick={goToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/30" aria-label="Next month" onClick={() => shiftMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[10px] font-semibold text-foreground/60 py-1">{d}</span>
          ))}
          {grid.map(({ date, inMonth }) => {
            const key = toDateKey(date);
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const hasEvents = (events[key]?.length ?? 0) > 0;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                aria-label={date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
                aria-pressed={isSelected}
                className={`relative h-8 rounded text-xs tabular-nums transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday
                      ? "bg-primary/40 font-semibold"
                      : "hover:bg-primary/25"
                } ${inMonth ? "" : "text-foreground/35"}`}
              >
                {date.getDate()}
                {hasEvents && (
                  <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 border-t border-border/40 pt-2">
          <p className="text-xs font-semibold mb-1.5">{selectedLabel}</p>
          {selectedEvents.length === 0 ? (
            <p className="text-[11px] text-foreground/60 mb-2">No events for this day.</p>
          ) : (
            <ul className="space-y-1 mb-2 max-h-28 overflow-y-auto">
              {selectedEvents.map((text, i) => (
                <li key={`${text}-${i}`} className="flex items-center gap-2 text-xs bg-primary/20 rounded px-2 py-1">
                  <span className="flex-1 break-words">{text}</span>
                  <button
                    aria-label={`Delete event ${text}`}
                    className="shrink-0 p-0.5 rounded hover:bg-destructive/40"
                    onClick={() => commit(removeEvent(events, selected, i))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-1.5">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder="Add an event…"
              aria-label="New event"
              className="h-8 text-xs bg-background/40 border-border/40"
              maxLength={120}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-primary/30" aria-label="Add event" onClick={handleAdd} disabled={!draft.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CalendarFlyout;
